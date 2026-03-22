'use strict';

/**
 * Generates a human-readable 6-character join code.
 * Uses uppercase letters and digits, excluding ambiguous characters (0/O, 1/I/L).
 *
 * @param {Set<string>} existingCodes - set of codes currently in use
 * @returns {string} unique 6-character join code
 */
function generateJoinCode(existingCodes = new Set()) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const CODE_LENGTH = 6;
  const MAX_ATTEMPTS = 100;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let code = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    if (!existingCodes.has(code)) {
      return code;
    }
  }

  throw new Error('Failed to generate unique join code after maximum attempts');
}

module.exports = { generateJoinCode };
