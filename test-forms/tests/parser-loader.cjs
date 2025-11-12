/**
 * CommonJS loader for the parser module
 * This file loads the TypeScript parser using tsx at runtime
 */
const { createRequire } = require('module');
const { register } = require('tsx/cjs/api');

// Register tsx to handle .ts files
const unregister = register();

// Create require relative to main project
const require2 = createRequire(require.resolve('../../src/main/leads/parsing/parser.ts'));

try {
  // Load the parser
  const parser = require('../../src/main/leads/parsing/parser.ts');

  module.exports = {
    parseLead: parser.parseLead
  };
} finally {
  unregister();
}
