import { ChordIdentifier } from '../js/ChordIdentifier.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

export function runChordIdentifierTests() {
  const identifier = new ChordIdentifier();
  const results = {
    passed: 0,
    failed: 0,
    failures: [],
  };

  const testCases = [
    // Root position
    { notes: ['C', 'E', 'G'], expected: 'C Major', name: 'C Major root position' },
    { notes: ['G', 'Bb', 'D'], expected: 'G Minor', name: 'G Minor root position' },
    { notes: ['A', 'C#', 'E', 'G#'], expected: 'A Maj7', name: 'A Maj7 root position' },
    // Inversions
    { notes: ['E', 'G', 'C'], expected: 'C Major', name: 'C Major first inversion' },
    { notes: ['F', 'A', 'C#'], expected: 'F Augmented', name: 'F Augmented root position' },
    { notes: ['D', 'F', 'Ab', 'B'], expected: 'D dim7', name: 'D dim7 root position' },
    { notes: ['F#', 'A', 'C', 'E'], expected: 'F# m7b5', name: 'F# m7b5 root position' },
    // Not a chord
    { notes: ['C', 'D'], expected: null, name: 'Too few notes' },
    { notes: ['C', 'C#', 'D', 'D#'], expected: null, name: 'Chromatic cluster' },
  ];

  console.log('Running ChordIdentifier tests...');

  testCases.forEach(({ notes, expected, name }) => {
    try {
      const result = identifier.identify(notes);
      assert(
        result === expected,
        `Test '${name}': notes [${notes.join(', ')}] expected ${expected}, but got ${result}`
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
