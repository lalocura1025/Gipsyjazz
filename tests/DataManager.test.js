import { DataManager } from '../js/DataManager.js';

// A simple assertion function for our tests
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Test suite for DataManager
export function runDataManagerTests() {
  const dataManager = new DataManager();
  const results = {
    passed: 0,
    failed: 0,
    failures: [],
  };

  const testCases = [
    // Naturals
    { interval: '1', expected: 0, name: 'Root' },
    { interval: '3', expected: 4, name: 'Major Third' },
    { interval: '5', expected: 7, name: 'Perfect Fifth' },
    // Flats
    { interval: 'b3', expected: 3, name: 'Minor Third' },
    { interval: 'b7', expected: 10, name: 'Flat Seventh' },
    // Sharps
    { interval: '#5', expected: 8, name: 'Sharp Fifth' },
    // Double Flats
    { interval: 'bb7', expected: 9, name: 'Double Flat Seventh' },
    // Compound Intervals
    { interval: '9', expected: 2, name: 'Ninth' },
    { interval: 'b9', expected: 1, name: 'Flat Ninth' },
    { interval: '#11', expected: 6, name: 'Sharp Eleventh' },
    // Edge cases
    { interval: 'unknown', expected: null, name: 'Unknown interval' },
    { interval: '8', expected: null, name: 'Non-existent interval' },
  ];

  console.log('Running DataManager tests...');

  testCases.forEach(({ interval, expected, name }) => {
    try {
      const result = dataManager.intervalStringToSemitone(interval);
      assert(
        result === expected,
        `Test '${name}': interval '${interval}' expected ${expected}, but got ${result}`
      );
      results.passed++;
    } catch (e) {
      results.failed++;
      results.failures.push(e.message);
      console.error(e);
    }
  });

  return results;
}
