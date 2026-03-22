#!/usr/bin/env node
'use strict';

// Load environment variables (ANTHROPIC_API_KEY)
const dotenvPath = require('path').resolve(__dirname, '..', '..', '.env');
try { require('dotenv').config({ path: dotenvPath, override: true }); } catch (_) {}

/**
 * RUN LAB — CLI Entry Point
 *
 * Usage:
 *   node app/server/lab/runLab.js --conversations=50 --concurrent=3
 *   node app/server/lab/runLab.js --analyze=batch-2026-03-12T14-30-00.json
 *   node app/server/lab/runLab.js --conversations=5 --quick  (pilot test)
 *
 * Options:
 *   --conversations=N     Number of conversations to simulate (default: 50)
 *   --concurrent=N        Max parallel conversations (default: 3)
 *   --delay=N             Delay in ms between API calls (default: 200)
 *   --skill=LEVEL         Run only one skill level (novice/intermediate/expert)
 *   --difficulty=LEVEL    Run only one difficulty (easy/medium/hard)
 *   --quick               Pilot mode: 5 conversations, 1 concurrent, fast
 *   --analyze=FILE        Analyze a previously saved batch result file
 *   --help                Show this help
 */

const path = require('path');
const fs = require('fs');
const { runBatch } = require('./batchSimulate');
const { analyzeResults } = require('./analyzeConversations');

// Parse CLI args
const args = {};
process.argv.slice(2).forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, val] = arg.slice(2).split('=');
    args[key] = val || true;
  }
});

if (args.help) {
  console.log(`
COACH Conversation Lab
=====================

Usage:
  node app/server/lab/runLab.js [options]

Options:
  --conversations=N   Number of conversations (default: 50)
  --concurrent=N      Max parallel conversations (default: 3)
  --delay=N           Delay between API calls in ms (default: 200)
  --skill=LEVEL       Only run one skill level (novice|intermediate|expert)
  --difficulty=LEVEL  Only run one difficulty (easy|medium|hard)
  --quick             Pilot mode: 5 conversations, 1 concurrent
  --analyze=FILE      Analyze a previously saved batch file
  --help              Show this help

Examples:
  node app/server/lab/runLab.js --quick                    # 5-conversation pilot
  node app/server/lab/runLab.js --conversations=50         # Medium batch
  node app/server/lab/runLab.js --conversations=200        # Full research batch
  node app/server/lab/runLab.js --skill=expert --quick     # Test expert only
  node app/server/lab/runLab.js --analyze=batch-2026-03-12T14-30-00.json
`);
  process.exit(0);
}

const outputDir = path.join(__dirname, '..', 'data', 'lab-results');

async function main() {
  // Mode 1: Analyze existing batch
  if (args.analyze) {
    const filePath = path.isAbsolute(args.analyze)
      ? args.analyze
      : path.join(outputDir, args.analyze);

    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      process.exit(1);
    }

    console.log('Loading batch data from:', filePath);
    const batchData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log('Loaded ' + batchData.conversations.length + ' conversations');

    const report = await analyzeResults(batchData);

    const reportFile = path.join(outputDir, 'analysis-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) + '.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf-8');
    console.log('\nAnalysis saved to:', reportFile);
    return;
  }

  // Mode 2: Simulate + Analyze
  const isQuick = args.quick === true;
  const totalConversations = parseInt(args.conversations) || (isQuick ? 5 : 50);
  const maxConcurrent = parseInt(args.concurrent) || (isQuick ? 1 : 3);
  const delayMs = parseInt(args.delay) || (isQuick ? 100 : 200);

  // Build skill/difficulty mix
  let skillMix = { novice: 0.33, intermediate: 0.34, expert: 0.33 };
  let difficultyMix = { easy: 0.33, medium: 0.34, hard: 0.33 };

  if (args.skill) {
    skillMix = { novice: 0, intermediate: 0, expert: 0 };
    skillMix[args.skill] = 1.0;
  }
  if (args.difficulty) {
    difficultyMix = { easy: 0, medium: 0, hard: 0 };
    difficultyMix[args.difficulty] = 1.0;
  }

  // Run batch
  const batchResult = await runBatch({
    totalConversations,
    skillMix,
    difficultyMix,
    maxConcurrent,
    outputDir,
    delayMs,
  });

  // Analyze results
  if (batchResult.completedConversations >= 5) {
    console.log('\nStarting analysis...');
    const report = await analyzeResults(batchResult);

    const reportFile = path.join(outputDir, 'analysis-' + batchResult.batchId.replace('batch-', '') + '.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf-8');
    console.log('\nAnalysis saved to:', reportFile);
  } else {
    console.log('\nToo few completed conversations for analysis. Run with more conversations.');
  }
}

main().catch(err => {
  console.error('\nLab failed:', err);
  process.exit(1);
});
