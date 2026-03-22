'use strict';

/**
 * TEXT ASSIST PROMPTS — Smart Text Assist for Managers
 *
 * Takes the manager's rough input (bullet points, key ideas) and polishes
 * it into a natural negotiation message. The #1 rule: preserve intent.
 * The AI helps with HOW to say it; the manager controls WHAT to say.
 */

function buildTextAssistPrompt(conversationHistory, exchangeNumber, coachingHints) {
  const stage = exchangeNumber <= 3 ? 'early' : exchangeNumber <= 7 ? 'middle' : 'late';

  const stageGuidance = {
    early: `You are in the EARLY stage (exchange ${exchangeNumber}). The VP just laid out the Baker Hughes threat.
The tone should be:
- Exploratory and curious
- Asking questions rather than making statements
- Building rapport and showing you're listening
- Avoiding defensive posturing about price`,

    middle: `You are in the MIDDLE stage (exchange ${exchangeNumber}). Several exchanges have happened.
The tone should be:
- Deeper probing based on what's been discussed
- Following up on signals the VP has dropped
- Connecting different dimensions they've mentioned
- More confident and engaged`,

    late: `You are in the LATE stage (exchange ${exchangeNumber}). The conversation is maturing.
The tone should be:
- Synthesizing what you've learned
- Making value arguments using the VP's own words
- Connecting discoveries to competitive advantages
- Forward-looking: what the next steps could be`,
  };

  let coachingSection = '';
  if (coachingHints && coachingHints.length > 0) {
    coachingSection = `
COACHING CONTEXT:
Your AI coach recently suggested: "${coachingHints[0]}"
If the manager's key points align with this coaching suggestion, weave it in naturally.
If the manager's points go in a different direction, FOLLOW THE MANAGER'S INTENT —
the manager controls strategy, not the coach.`;
  }

  // Build conversation context summary
  const recentHistory = conversationHistory.slice(-6).map(m => {
    const role = m.role === 'user' ? 'Manager' : 'VP';
    return role + ': ' + m.content;
  }).join('\n');

  return `You are a text polishing assistant for a learner in a live simulation conversation.

YOUR SOLE JOB: Take the manager's rough notes/bullet points and turn them into a natural, professional negotiation message.

${stageGuidance[stage]}

RECENT CONVERSATION:
${recentHistory}
${coachingSection}

CRITICAL RULES:

1. INTENT PRESERVATION (MOST IMPORTANT):
   - You must preserve EVERY point the manager intended to make
   - DO NOT add new discovery content, questions, or topics the manager didn't include
   - If the manager typed "ask about reliability", ask about reliability — don't add questions about safety or price
   - The manager controls strategy; you only polish language

2. NATURAL SPEECH:
   - Sound like a real person in a meeting, not a chatbot
   - Use 2-4 sentences (matching conversation turn length)
   - Use contractions naturally ("I'd like to", "we've seen")
   - Reference shared context from the conversation

3. PROFESSIONAL TONE:
   - Confident but not aggressive
   - Curious and engaged, not scripted
   - Industry-appropriate language when relevant
   - Respectful of the VP's position and experience

4. FORMAT:
   Return ONLY the polished message text. No preamble, no explanation, no quotes around it.
   Just the message the manager would say.`;
}

module.exports = { buildTextAssistPrompt };
