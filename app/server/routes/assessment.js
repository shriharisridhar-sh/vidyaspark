'use strict';

/**
 * ASSESSMENT ROUTE — Post-Session Student Comprehension Assessment
 *
 * After a teaching session ends, this route generates comprehension questions
 * based on the module content and evaluates how each of the 5 AI students
 * would answer based on their engagement during the session.
 *
 * The 5 AI Students:
 *   - Priya (13, Curious): Asks "why" questions, engaged learner
 *   - Ravi (14, Skeptic): Demands proof, challenges claims
 *   - Lakshmi (12, Shy): Knows answers but won't speak unless invited
 *   - Arjun (14, Disengaged): Bored, jokes, can be won back
 *   - Meena (13, Rote Learner): Repeats without understanding
 */

const { Router } = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const sessionStore = require('../session/SessionStore');
const { loadModule } = require('../modules/ModuleRegistry');
const { optionalAuth } = require('../middleware/auth');

const client = new Anthropic();
const router = Router();

/**
 * POST /api/assessment/:sessionId — Generate post-session student assessment
 *
 * Returns comprehension questions and per-student results that reflect
 * how well the Ignator taught and engaged each student archetype.
 */
router.post('/:sessionId', optionalAuth, async (req, res) => {
  const { sessionId } = req.params;

  // ── Step 1: Get session ──────────────────────────────────
  const session = sessionStore.getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (!session.transcript || session.transcript.length === 0) {
    return res.status(400).json({ error: 'Session has no transcript to assess' });
  }

  // ── Step 2: Get module config ────────────────────────────
  const moduleId = session.scenarioId || 'abl-p7-force-pressure';
  const mod = loadModule(moduleId);
  const moduleTitle = (mod && mod.title) || moduleId;
  const moduleObjectives = (mod && mod.objectives) || [];

  // ── Step 3: Format transcript for the prompt ─────────────
  const transcriptText = session.transcript
    .filter(entry => entry.role === 'manager' || entry.role === 'customer')
    .map(entry => {
      const role = entry.role === 'manager' ? 'Ignator' : 'Student';
      return `${role}: ${entry.content}`;
    })
    .join('\n');

  // ── Step 4: Build the assessment prompt ──────────────────
  const systemPrompt = `You are an expert education assessment designer for Agastya International Foundation's VidyaSpark platform.

Your task is to evaluate how well an Ignator (science educator) taught an Activity-Based Learning (ABL) module by:
1. Generating 4 comprehension questions at increasing Bloom's taxonomy levels
2. Determining how each of 5 AI students would answer based on their personality and engagement during the session

Module: ${moduleTitle}
${moduleObjectives.length > 0 ? 'Learning Objectives:\n' + moduleObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n') : ''}

THE 5 AI STUDENTS:

1. **Priya** (13, Curious): Genuinely curious, asks "why" questions. If the Ignator explained concepts well and encouraged questions, Priya will score high. She benefits from clear explanations and interactive teaching.

2. **Ravi** (14, Skeptic): Demands proof and challenges claims. If the Ignator provided evidence, demonstrated experiments clearly, and addressed skepticism, Ravi will score high. He struggles when teaching is assertion-based without proof.

3. **Lakshmi** (12, Shy): Knows answers internally but won't speak unless directly invited or called upon. If the Ignator never addressed quiet students or created inclusive moments, Lakshmi's score should be 0 (she won't volunteer answers). If called upon gently, she performs well.

4. **Arjun** (14, Disengaged): Bored, makes jokes, needs to be re-engaged with interesting hooks. If the Ignator never tried to re-engage distracted students or make the content exciting, Arjun scores poorly (0-1). If re-engaged successfully, he can score well.

5. **Meena** (13, Rote Learner): Memorizes without understanding. She can answer recall questions but fails application/analysis unless the Ignator specifically challenged rote learning and pushed for deeper understanding.

SCORING RULES:
- Each student answers all 4 questions. Score = number of correct answers (0-4).
- Student answers MUST reflect their engagement level during the session.
- If the Ignator did not engage a student type, that student should score poorly.
- Meena always gets recall questions right (she memorizes) but fails higher-order questions unless pushed.
- Lakshmi scores 0 across the board if never called on or invited to participate.
- Arjun scores 0-1 if never re-engaged; he only answers if something caught his attention.

RESPONSE FORMAT — You MUST respond with valid JSON only, no other text:
{
  "questions": [
    { "id": 1, "question": "...", "type": "recall", "correctAnswer": "..." },
    { "id": 2, "question": "...", "type": "understanding", "correctAnswer": "..." },
    { "id": 3, "question": "...", "type": "application", "correctAnswer": "..." },
    { "id": 4, "question": "...", "type": "analysis", "correctAnswer": "..." }
  ],
  "studentResults": {
    "priya": {
      "score": <0-4>,
      "answers": [
        { "questionId": 1, "answer": "...", "correct": true/false },
        { "questionId": 2, "answer": "...", "correct": true/false },
        { "questionId": 3, "answer": "...", "correct": true/false },
        { "questionId": 4, "answer": "...", "correct": true/false }
      ],
      "note": "<brief note on why this student performed this way based on the session>"
    },
    "ravi": { "score": <0-4>, "answers": [...], "note": "..." },
    "lakshmi": { "score": <0-4>, "answers": [...], "note": "..." },
    "arjun": { "score": <0-4>, "answers": [...], "note": "..." },
    "meena": { "score": <0-4>, "answers": [...], "note": "..." }
  }
}`;

  const userMessage = `Here is the full teaching session transcript. Analyze how the Ignator taught and generate the assessment.

SESSION TRANSCRIPT:
${transcriptText}

Generate 4 comprehension questions (recall, understanding, application, analysis) based on the content taught, then determine how each of the 5 AI students would answer based on their personality and how well the Ignator engaged them during this session. Respond with JSON only.`;

  try {
    // ── Step 5: Call Claude API ───────────────────────────────
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20241022',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    // Extract text content from the response
    const textBlock = response.content.find(block => block.type === 'text');
    if (!textBlock) {
      return res.status(500).json({ error: 'No text response from assessment model' });
    }

    // Parse the JSON response
    let assessment;
    try {
      // Strip markdown code fences if present
      let jsonText = textBlock.text.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
      }
      assessment = JSON.parse(jsonText);
    } catch (parseErr) {
      console.error('[Assessment] Failed to parse Claude response:', parseErr.message);
      console.error('[Assessment] Raw response:', textBlock.text.substring(0, 500));
      return res.status(500).json({ error: 'Failed to parse assessment response' });
    }

    // ── Step 6: Compute class average ────────────────────────
    const students = ['priya', 'ravi', 'lakshmi', 'arjun', 'meena'];
    let totalScore = 0;
    let studentCount = 0;

    students.forEach(name => {
      if (assessment.studentResults && assessment.studentResults[name]) {
        totalScore += assessment.studentResults[name].score || 0;
        studentCount++;
      }
    });

    const classAverage = studentCount > 0
      ? Math.round((totalScore / studentCount) * 10) / 10
      : 0;

    // ── Step 7: Return assessment results ────────────────────
    return res.json({
      questions: assessment.questions,
      studentResults: assessment.studentResults,
      classAverage,
    });

  } catch (err) {
    console.error('[POST /api/assessment/:sessionId] Error:', err.message);
    return res.status(500).json({ error: 'Assessment generation failed: ' + err.message });
  }
});

module.exports = router;
