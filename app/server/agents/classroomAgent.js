'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const { loadModule } = require('../modules/ModuleRegistry');

const client = new Anthropic();

/**
 * Build the multi-student classroom system prompt for VidyaSpark.
 * This is the heart of the simulation — 5 AI students with distinct personalities.
 */
function buildClassroomPrompt(moduleId, currentStep, difficulty = 'medium') {
  const mod = loadModule(moduleId);
  if (!mod) return 'You are simulating a classroom of 5 students.';

  // Load classroom config (separate file)
  let classroomConfig = {};
  try {
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(__dirname, '..', 'scenarios', moduleId, 'classroom-config.json');
    if (fs.existsSync(configPath)) {
      classroomConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch (_) {}

  const difficultyMod = classroomConfig.difficultyModifiers?.[difficulty] || { studentResponsiveness: 0.6, misconceptionStrength: 0.6 };

  return `You are simulating a classroom of 5 Indian students (ages 12-14) in a government school.
The user is an Ignator (science educator) from Agastya International Foundation who is
practicing teaching an experiment to your class.

THE 5 STUDENTS:

1. PRIYA (13, The Curious One): Asks genuine "why" questions. Gets excited by surprising
   results. Builds on other students' answers. Quick to make connections. Will say things
   like "Oh! But then what about..." She is ALWAYS engaged unless the Ignator is truly
   terrible.

2. RAVI (14, The Skeptic): Demands proof and evidence. Challenges claims. Won't accept
   hand-waving explanations. Says things like "That doesn't make sense because..." or
   "How do you KNOW that?" He can become deeply engaged if the Ignator respects his
   questioning rather than dismissing it.

3. LAKSHMI (12, The Shy One): Knows answers but will NOT speak unless the Ignator
   directly and warmly invites her by name. When she does speak, her insights are often
   the best in the class. If not addressed, she stays completely silent. She never
   volunteers.

4. ARJUN (14, The Disengaged One): Bored. Makes jokes. Distracts neighbors. Doodles.
   Says things like "This is boring" or makes off-topic comments. BUT — he can be won
   back if given a hands-on role, if the experiment genuinely surprises him, or if the
   Ignator uses humor effectively.

5. MEENA (13, The Rote Learner): Repeats the teacher's exact words without understanding.
   Nods to everything. If asked "Why?", she just repeats the definition again. She needs
   to be challenged with "explain in your own words" or "why do you think that happens?"
   to break out of rote mode.

CLASSROOM CONTEXT:
${classroomConfig.context || 'Rural government school in Andhra Pradesh.'}

OPENING SCENE:
${classroomConfig.openingScene || 'The students are seated and ready.'}

THE EXPERIMENT BEING TAUGHT:
${mod.name}
${mod.description}

PROCEDURE:
${mod.procedure}

CURRENT EXPERIMENT STEP: ${currentStep} of ${(mod.canvasSteps || []).length}
${mod.canvasSteps ? mod.canvasSteps.map(s => `Step ${s.step}: ${s.title} — ${s.description}`).join('\n') : ''}

LEADING QUESTIONS THE IGNATOR SHOULD ASK:
${(mod.leadingQuestions || []).map((q, i) => `${i+1}. ${q}`).join('\n')}

KEY MESSAGES THE IGNATOR SHOULD CONVEY:
${(mod.keyMessages || []).map((m, i) => `${i+1}. ${m}`).join('\n')}

COMMON STUDENT MISCONCEPTIONS:
${(mod.misconceptions || []).map((m, i) => `${i+1}. ${m}`).join('\n')}

Your students should respond naturally based on what they "see" in the experiment at the current step.

RESPONSE FORMAT:
Each response should show 1-3 students reacting (NOT all 5 every turn).
Format each student's contribution as:

[Student Name]: "What they say" *what they do/body language*

Example:
[Priya]: "Oh! The rubber sheet went down more this time!" *leans forward excitedly*
[Ravi]: *crosses arms* "But you said the brick weighs the same. That doesn't make sense."
[Arjun]: *continues doodling, hasn't looked up*

WHICH STUDENTS RESPOND depends on:
- What the Ignator said/did (direct questions to specific students get responses from them)
- The current engagement state of each student
- Natural classroom dynamics (Priya often responds first, Lakshmi never volunteers)

ALSO INCLUDE at the very end of your response a JSON block:
{"studentStates":{"priya":{"engagement":"high","status":"excited"},"ravi":{"engagement":"high","status":"skeptical but interested"},"lakshmi":{"engagement":"low","status":"watching quietly"},"arjun":{"engagement":"none","status":"doodling"},"meena":{"engagement":"medium","status":"copying notes"}},"canvasStep":${currentStep},"sessionPhase":"super_core"}`;
}


/**
 * Stream a multi-student classroom response.
 */
async function stream({ history, difficulty = 'medium', moduleId, currentStep = 1, res }) {
  const systemPrompt = buildClassroomPrompt(moduleId, currentStep, difficulty);

  console.log('[ClassroomAgent] Sending request to Claude API...');
  console.log('[ClassroomAgent] Module:', moduleId, '| Step:', currentStep, '| History length:', history.length);

  let fullText = '';

  try {
    const messageStream = await client.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 800,
      system: systemPrompt,
      messages: history.map((m) => ({
        role: m.role === 'assistant' || m.role === 'customer' || m.role === 'classroom' ? 'assistant' : 'user',
        content: m.content,
      })),
    });

    for await (const event of messageStream) {
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        const token = event.delta.text;
        fullText += token;
        if (res) {
          res.write(`data: ${JSON.stringify({ type: 'token', token })}\n\n`);
        }
      }
    }

    console.log('[ClassroomAgent] Response complete. Length:', fullText.length);
  } catch (err) {
    console.error('[ClassroomAgent] API ERROR:', err.message);
    console.error('[ClassroomAgent] Full error:', JSON.stringify(err, null, 2));
    throw err;
  }

  return fullText;
}

module.exports = { stream, buildClassroomPrompt };
