'use strict';

/**
 * ASSESSMENT ROUTE — Post-Session Student Comprehension Assessment
 *
 * After a teaching session ends, this route generates 10 comprehension questions
 * across Bloom's taxonomy levels and evaluates how each of the 5 AI students
 * would answer based on their engagement during the session.
 *
 * Score formula:
 *   studentAchievement = (totalCorrect / 50) × 100
 *   confidence = selfRating × 20
 *   compositeScore = 0.70 × studentAchievement + 0.30 × confidence
 */

const { Router } = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const sessionStore = require('../session/SessionStore');
const { loadModule } = require('../modules/ModuleRegistry');
const { optionalAuth } = require('../middleware/auth');

let db;
try { db = require('../db/database'); } catch (_) {}

const client = new Anthropic();
const router = Router();

/**
 * POST /api/assessment/:sessionId — Generate post-session student assessment
 */
router.post('/:sessionId', optionalAuth, async (req, res) => {
  const { sessionId } = req.params;
  const { selfRating } = req.body; // 1-5 confidence scale

  // ── Step 1: Get session (try in-memory first, then database) ──
  let session = sessionStore.getSession(sessionId);

  if (!session && db) {
    try {
      const d = await db.getDb();
      const rows = d.exec('SELECT transcript, scenario_id FROM sessions WHERE id = ?', [sessionId]);
      if (rows.length > 0 && rows[0].values.length > 0) {
        const [transcript, scenarioId] = rows[0].values[0];
        session = {
          transcript: transcript ? JSON.parse(transcript) : [],
          scenarioId: scenarioId || 'abl-p7-force-pressure',
        };
      }
    } catch (dbErr) {
      console.error('[Assessment] DB fallback error:', dbErr.message);
    }
  }

  if (!session) {
    return res.status(404).json({ error: 'Session not found in memory or database' });
  }

  if (!session.transcript || session.transcript.length === 0) {
    return res.status(400).json({ error: 'Session has no transcript to assess' });
  }

  // ── Step 2: Get module config ────────────────────────────
  const moduleId = session.scenarioId || 'abl-p7-force-pressure';
  const mod = loadModule(moduleId);
  const moduleTitle = (mod && mod.title) || (mod && mod.name) || moduleId;
  const moduleObjectives = (mod && mod.objectives) || (mod && mod.keyMessages) || [];
  const leadingQuestions = (mod && mod.leadingQuestions) || [];
  const keyMessages = (mod && mod.keyMessages) || [];
  const misconceptions = (mod && mod.misconceptions) || [];

  // ── Step 3: Format transcript ─────────────────────────
  const transcriptText = session.transcript
    .filter(entry => entry.role === 'manager' || entry.role === 'classroom' || entry.role === 'customer')
    .map(entry => {
      const role = entry.role === 'manager' ? 'Ignator' : 'Students';
      return `${role}: ${entry.content}`;
    })
    .join('\n');

  // ── Step 4: Build the assessment prompt ──────────────────
  // Build module context sections
  const formatList = (arr, getStr) => arr.map((item, i) => {
    const text = typeof item === 'object' ? getStr(item) : String(item);
    return (i + 1) + '. ' + text;
  }).join('\n');

  let moduleContext = '';
  if (moduleObjectives.length > 0) {
    moduleContext += 'KEY MESSAGES:\n' + formatList(moduleObjectives, o => o.message || o.text || JSON.stringify(o)) + '\n';
  }
  if (leadingQuestions.length > 0) {
    moduleContext += '\nLEADING QUESTIONS FROM HANDBOOK:\n' + formatList(leadingQuestions, q => q.question || q.text || JSON.stringify(q)) + '\n';
  }
  if (misconceptions.length > 0) {
    moduleContext += '\nCOMMON MISCONCEPTIONS:\n' + formatList(misconceptions, m => m.misconception || m.text || JSON.stringify(m)) + '\n';
  }

  const systemPrompt = `You are an expert education assessment designer for Agastya International Foundation's VidyaSpark platform.

Your task: Generate 10 comprehension questions and score each of 5 AI students based on how well the Ignator taught them.

MODULE: ${moduleTitle}
${moduleContext}

QUESTION DISTRIBUTION (10 total):
- 3 Recall questions (Bloom's Level 1: remember facts)
- 3 Understanding questions (Bloom's Level 2: explain concepts)
- 2 Application questions (Bloom's Level 3: use in new context)
- 2 Analysis questions (Bloom's Level 4: break down, evaluate)

THE 5 AI STUDENTS AND SCORING RULES:

1. **Priya** (13, Curious): Genuinely curious, asks "why" questions. Benefits from clear explanations and interactive teaching. Scores high if Ignator explained concepts well and encouraged questions.

2. **Ravi** (14, Skeptic): Demands proof and challenges claims. Scores high if Ignator provided evidence, demonstrated experiments clearly, addressed skepticism. Struggles with assertion-based teaching.

3. **Lakshmi** (12, Shy): Knows answers internally but won't speak unless directly called upon by name. If the Ignator NEVER addressed her by name or created inclusive moments, Lakshmi's score MUST be 0. If called upon gently, she performs well.

4. **Arjun** (14, Disengaged): Bored, makes jokes. Needs re-engagement with interesting hooks or hands-on roles. If Ignator never tried to re-engage him, score 0-2. If given a task or hooked with something interesting, can score 6-8.

5. **Meena** (13, Rote Learner): Memorizes without understanding. ALWAYS gets recall questions right (she memorizes everything). But FAILS application and analysis questions UNLESS the Ignator specifically challenged rote learning and pushed for deeper understanding.

CRITICAL SCORING RULES:
- Each student answers all 10 questions. Score = number correct (0-10).
- Scores MUST reflect actual engagement patterns from the transcript.
- If Ignator did NOT engage a student type, that student scores poorly.
- Meena ALWAYS gets at least 2-3 recall questions right (she memorizes).
- Lakshmi scores 0 if never called on by name.
- Be honest and differentiating — NOT all students should score similarly.
- For each student, provide a specific "note" explaining their score tied to transcript evidence.

ALSO GENERATE:
- "conceptsTaughtWell": Array of 2-4 concepts the Ignator clearly explained (with evidence from transcript)
- "conceptsToImprove": Array of 2-4 concepts that were unclear or missed, with specific "insteadOf" / "tryThis" coaching pairs
- "goingForward": Array of 3 specific tips for the next session
- "sessionSummary": 2-3 sentence overall assessment of the teaching quality

RESPONSE FORMAT — You MUST respond with valid JSON only, no markdown, no comments. Use this exact structure:

{"questions":[{"id":1,"question":"What are the three states of matter?","type":"recall","correctAnswer":"Solid, liquid, and gas"},{"id":2,"question":"...","type":"recall","correctAnswer":"..."}],"studentResults":{"priya":{"score":8,"answers":[{"questionId":1,"correct":true,"answer":"Solid, liquid, and gas!"},{"questionId":2,"correct":true,"answer":"..."}],"note":"Priya scored well because the Ignator..."},"ravi":{"score":6,"answers":[{"questionId":1,"correct":true,"answer":"..."}],"note":"..."},"lakshmi":{"score":0,"answers":[{"questionId":1,"correct":false,"answer":"..."}],"note":"Lakshmi was never called on..."},"arjun":{"score":3,"answers":[{"questionId":1,"correct":false,"answer":"..."}],"note":"..."},"meena":{"score":5,"answers":[{"questionId":1,"correct":true,"answer":"..."}],"note":"..."}},"conceptsTaughtWell":[{"concept":"Air occupies space","evidence":"Ignator clearly demonstrated with test tube"}],"conceptsToImprove":[{"concept":"Inclusive teaching","insteadOf":"Only calling on Priya","tryThis":"Call on Lakshmi by name"}],"goingForward":["Tip 1","Tip 2","Tip 3"],"sessionSummary":"The Ignator showed clear knowledge but..."}

IMPORTANT: Include ALL 10 questions in the questions array. Include ALL 10 answers for EACH student in their answers array. Return ONLY the JSON object, nothing else.`;

  const userMessage = `Here is the full teaching session transcript. Analyze how the Ignator taught and generate the 10-question assessment.

SESSION TRANSCRIPT:
${transcriptText}

Generate 10 comprehension questions (3 recall, 3 understanding, 2 application, 2 analysis) based on the content taught, then determine how each of the 5 AI students would answer based on their personality and how well the Ignator engaged them during this session. Also provide concept analysis and coaching recommendations. Respond with JSON only.`;

  try {
    // ── Step 5: Call Claude API ───────────────────────────────
    console.log('[Assessment] Calling Claude API for session', sessionId, 'transcript length:', transcriptText.length);
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });
    console.log('[Assessment] Claude response received, stop_reason:', response.stop_reason);

    const textBlock = response.content.find(block => block.type === 'text');
    if (!textBlock) {
      return res.status(500).json({ error: 'No text response from assessment model' });
    }

    let assessment;
    try {
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

    // ── Step 6: Compute scores ────────────────────────
    const students = ['priya', 'ravi', 'lakshmi', 'arjun', 'meena'];
    const totalQuestions = assessment.questions?.length || 10;
    let totalCorrect = 0;
    let studentCount = 0;

    // Cap each student's score at the actual number of questions generated
    students.forEach(name => {
      if (assessment.studentResults && assessment.studentResults[name]) {
        const rawScore = assessment.studentResults[name].score || 0;
        const cappedScore = Math.min(rawScore, totalQuestions);
        assessment.studentResults[name].score = cappedScore;
        totalCorrect += cappedScore;
        studentCount++;
      }
    });

    const maxPossible = studentCount * totalQuestions; // 5 students × actual questions
    const studentAchievement = maxPossible > 0 ? (totalCorrect / maxPossible) * 100 : 0;
    const classAverage = studentCount > 0
      ? Math.round((totalCorrect / studentCount) * 10) / 10
      : 0;

    // Composite score (selfRating applied client-side if not provided here)
    const confidence = selfRating ? selfRating * 20 : null;
    const compositeScore = confidence !== null
      ? Math.round(0.70 * studentAchievement + 0.30 * confidence)
      : null;

    // ── Step 7: Save score to database ────────────────────
    const scoreToSave = compositeScore !== null ? compositeScore : Math.round(studentAchievement);
    if (db && scoreToSave > 0) {
      try {
        const d = await db.getDb();
        d.run('UPDATE sessions SET composite_score = ?, objective_score = ? WHERE id = ?',
          [scoreToSave, Math.round(studentAchievement), sessionId]);
        db.saveToDisk();
        console.log('[Assessment] Saved score', scoreToSave, 'for session', sessionId);
      } catch (dbErr) {
        console.error('[Assessment] Failed to save score to DB:', dbErr.message);
      }
    }

    // ── Step 8: Return full assessment ────────────────────
    return res.json({
      questions: assessment.questions,
      studentResults: assessment.studentResults,
      conceptsTaughtWell: assessment.conceptsTaughtWell || [],
      conceptsToImprove: assessment.conceptsToImprove || [],
      goingForward: assessment.goingForward || [],
      sessionSummary: assessment.sessionSummary || '',
      classAverage,
      totalCorrect,
      maxPossible,
      totalQuestions,
      studentAchievement: Math.round(studentAchievement * 10) / 10,
      compositeScore,
    });

  } catch (err) {
    console.error('[POST /api/assessment/:sessionId] Error:', err.message);
    console.error('[Assessment] Full error:', err.status || '', err.error?.message || err.message);
    return res.status(500).json({ error: 'Assessment generation failed: ' + err.message });
  }
});

module.exports = router;
