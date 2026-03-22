const Anthropic = require('@anthropic-ai/sdk');
const { buildIntakePrompt, buildRefinementPrompt, buildGenerationPrompt } = require('../prompts/moduleBuilderPrompts');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function streamIntakeConversation(conversationHistory, res) {
  const isRefinement = conversationHistory.length > 2;
  const systemPrompt = isRefinement ? buildRefinementPrompt() : buildIntakePrompt();

  try {
    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: conversationHistory,
    });

    let fullResponse = '';

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.text) {
        const token = event.delta.text;
        fullResponse += token;

        // Don't stream the <module_data> JSON to the user
        if (!fullResponse.includes('<module_data>')) {
          res.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`);
        }
      }
    }

    // Extract module data JSON
    const dataMatch = fullResponse.match(/<module_data>([\s\S]*?)<\/module_data>/);
    if (dataMatch) {
      try {
        const moduleData = JSON.parse(dataMatch[1].trim());
        res.write(`data: ${JSON.stringify({ type: 'module_data', content: moduleData })}\n\n`);
      } catch (e) {
        console.error('Failed to parse module_data:', e.message);
      }
    }

    // Send the clean response (without JSON) for conversation history
    const cleanResponse = fullResponse.replace(/<module_data>[\s\S]*?<\/module_data>/, '').trim();
    res.write(`data: ${JSON.stringify({ type: 'done', content: cleanResponse })}\n\n`);
    res.end();
  } catch (err) {
    console.error('Module builder intake error:', err.message);
    res.write(`data: ${JSON.stringify({ type: 'error', content: err.message })}\n\n`);
    res.end();
  }
}

async function streamModuleGeneration(moduleIntake, res) {
  const systemPrompt = buildGenerationPrompt(moduleIntake);

  const progressSteps = [
    'Structuring the scenario context',
    'Defining the counterpart personality',
    'Calibrating the hidden truth reveal',
    'Writing the learner briefing',
    'Creating the assessment framework',
    'Generating the debrief experience',
  ];

  // Send initial progress
  res.write(`data: ${JSON.stringify({ type: 'progress', step: 0, label: progressSteps[0] })}\n\n`);

  try {
    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: 'You are a simulation module generator. Output only the requested JSON inside <generated_module> tags. No other text.',
      messages: [{ role: 'user', content: systemPrompt }],
    });

    let fullResponse = '';
    let progressIndex = 0;
    const tokenThresholds = [200, 600, 1200, 2000, 3000];

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.text) {
        fullResponse += event.delta.text;

        // Emit progress steps based on token count
        if (progressIndex < tokenThresholds.length && fullResponse.length > tokenThresholds[progressIndex]) {
          progressIndex++;
          if (progressIndex < progressSteps.length) {
            res.write(`data: ${JSON.stringify({ type: 'progress', step: progressIndex, label: progressSteps[progressIndex] })}\n\n`);
          }
        }
      }
    }

    // Extract generated module
    const moduleMatch = fullResponse.match(/<generated_module>([\s\S]*?)<\/generated_module>/);
    if (moduleMatch) {
      try {
        const generatedModule = JSON.parse(moduleMatch[1].trim());
        res.write(`data: ${JSON.stringify({ type: 'progress', step: progressSteps.length - 1, label: progressSteps[progressSteps.length - 1] })}\n\n`);
        res.write(`data: ${JSON.stringify({ type: 'generated_module', content: generatedModule })}\n\n`);
      } catch (e) {
        console.error('Failed to parse generated module:', e.message);
        res.write(`data: ${JSON.stringify({ type: 'error', content: 'Failed to parse generated module' })}\n\n`);
      }
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', content: 'No module generated' })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (err) {
    console.error('Module generation error:', err.message);
    res.write(`data: ${JSON.stringify({ type: 'error', content: err.message })}\n\n`);
    res.end();
  }
}

module.exports = { streamIntakeConversation, streamModuleGeneration };
