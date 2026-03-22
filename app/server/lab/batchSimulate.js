'use strict';

/**
 * BATCH SIMULATE — Orchestrates N Conversations
 *
 * Runs multiple simulated conversations with configurable skill/difficulty mix.
 * Uses a concurrency limiter to avoid API rate limits.
 * Saves results to app/server/data/lab-results/.
 */

const path = require('path');
const fs = require('fs');
const { simulateConversation } = require('./simulateConversation');
const { generateRandomWeights } = require('../prompts/systemPrompts');

/**
 * Simple async semaphore for concurrency control
 */
class Semaphore {
  constructor(max) {
    this.max = max;
    this.current = 0;
    this.queue = [];
  }
  async acquire() {
    if (this.current < this.max) {
      this.current++;
      return;
    }
    return new Promise(resolve => this.queue.push(resolve));
  }
  release() {
    this.current--;
    if (this.queue.length > 0) {
      this.current++;
      this.queue.shift()();
    }
  }
}

/**
 * Generate conversation configs based on mix ratios
 */
function generateConfigs(totalConversations, skillMix, difficultyMix) {
  const configs = [];

  const skills = Object.entries(skillMix);
  const difficulties = Object.entries(difficultyMix);

  for (let i = 0; i < totalConversations; i++) {
    // Weighted random selection for skill level
    let r = Math.random();
    let skillLevel = 'intermediate';
    for (const [skill, weight] of skills) {
      r -= weight;
      if (r <= 0) { skillLevel = skill; break; }
    }

    // Weighted random selection for difficulty
    r = Math.random();
    let difficulty = 'medium';
    for (const [diff, weight] of difficulties) {
      r -= weight;
      if (r <= 0) { difficulty = diff; break; }
    }

    // Random exchange count (8-12)
    const numExchanges = 8 + Math.floor(Math.random() * 5);

    configs.push({
      skillLevel,
      difficulty,
      numExchanges,
      sessionWeights: generateRandomWeights(),
    });
  }

  return configs;
}

/**
 * Run a batch of simulated conversations
 *
 * @param {Object} options
 * @param {number} options.totalConversations - how many to run
 * @param {Object} options.skillMix - { novice: 0.33, intermediate: 0.34, expert: 0.33 }
 * @param {Object} options.difficultyMix - { easy: 0.33, medium: 0.34, hard: 0.33 }
 * @param {number} options.maxConcurrent - max parallel conversations
 * @param {string} options.outputDir - directory for results
 * @param {number} options.delayMs - delay between API calls within each conversation
 * @returns {Promise<Object>} BatchResult
 */
async function runBatch({
  totalConversations = 50,
  skillMix = { novice: 0.33, intermediate: 0.34, expert: 0.33 },
  difficultyMix = { easy: 0.33, medium: 0.34, hard: 0.33 },
  maxConcurrent = 3,
  outputDir = path.join(__dirname, '..', 'data', 'lab-results'),
  delayMs = 200,
} = {}) {
  const batchId = 'batch-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const startTime = Date.now();

  console.log('\n========================================');
  console.log('COACH Conversation Lab');
  console.log('========================================');
  console.log('Batch: ' + batchId);
  console.log('Conversations: ' + totalConversations);
  console.log('Concurrency: ' + maxConcurrent);
  console.log('Skill mix: ' + JSON.stringify(skillMix));
  console.log('Difficulty mix: ' + JSON.stringify(difficultyMix));
  console.log('========================================\n');

  // Generate configs
  const configs = generateConfigs(totalConversations, skillMix, difficultyMix);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Run conversations with concurrency control
  const semaphore = new Semaphore(maxConcurrent);
  const results = [];
  const errors = [];
  let completed = 0;

  const tasks = configs.map((config, idx) => async () => {
    await semaphore.acquire();
    try {
      console.log('[' + (idx + 1) + '/' + totalConversations + '] Starting ' +
        config.skillLevel + '/' + config.difficulty + ' (' + config.numExchanges + ' exchanges)');

      const result = await simulateConversation({
        ...config,
        delayMs,
      });

      results.push(result);
      completed++;

      const pct = ((completed / totalConversations) * 100).toFixed(1);
      console.log('[' + completed + '/' + totalConversations + '] (' + pct + '%) ' +
        config.skillLevel + '/' + config.difficulty + ' → Score: ' + result.finalObjectiveScore + '\n');

    } catch (err) {
      console.error('[' + (idx + 1) + '/' + totalConversations + '] FAILED:', err.message);
      errors.push({ index: idx, config, error: err.message });
    } finally {
      semaphore.release();
    }
  });

  // Execute all tasks
  await Promise.all(tasks.map(fn => fn()));

  // Compute summary statistics
  const bySkillLevel = {};
  const byDifficulty = {};

  ['novice', 'intermediate', 'expert'].forEach(skill => {
    const subset = results.filter(r => r.skillLevel === skill);
    bySkillLevel[skill] = {
      count: subset.length,
      avgFinalScore: subset.length > 0
        ? Math.round(subset.reduce((s, r) => s + r.finalObjectiveScore, 0) / subset.length)
        : 0,
      avgExchanges: subset.length > 0
        ? Math.round(subset.reduce((s, r) => s + r.numExchanges, 0) / subset.length)
        : 0,
    };
  });

  ['easy', 'medium', 'hard'].forEach(diff => {
    const subset = results.filter(r => r.difficulty === diff);
    byDifficulty[diff] = {
      count: subset.length,
      avgFinalScore: subset.length > 0
        ? Math.round(subset.reduce((s, r) => s + r.finalObjectiveScore, 0) / subset.length)
        : 0,
    };
  });

  const endTime = Date.now();

  const batchResult = {
    batchId,
    timestamp: new Date().toISOString(),
    totalConversations,
    completedConversations: results.length,
    failedConversations: errors.length,
    bySkillLevel,
    byDifficulty,
    conversations: results,
    errors: errors.length > 0 ? errors : undefined,
    durationMs: endTime - startTime,
    durationMinutes: Math.round((endTime - startTime) / 60000),
  };

  // Save results
  const outFile = path.join(outputDir, batchId + '.json');
  fs.writeFileSync(outFile, JSON.stringify(batchResult, null, 2), 'utf-8');

  console.log('\n========================================');
  console.log('BATCH COMPLETE');
  console.log('========================================');
  console.log('Completed: ' + results.length + '/' + totalConversations);
  console.log('Failed: ' + errors.length);
  console.log('Duration: ' + batchResult.durationMinutes + ' minutes');
  console.log('');
  console.log('BY SKILL LEVEL:');
  Object.entries(bySkillLevel).forEach(([skill, data]) => {
    console.log('  ' + skill + ': ' + data.count + ' conversations, avg score: ' + data.avgFinalScore);
  });
  console.log('');
  console.log('BY DIFFICULTY:');
  Object.entries(byDifficulty).forEach(([diff, data]) => {
    console.log('  ' + diff + ': ' + data.count + ' conversations, avg score: ' + data.avgFinalScore);
  });
  console.log('');
  console.log('Results saved to: ' + outFile);
  console.log('========================================\n');

  return batchResult;
}

module.exports = { runBatch };
