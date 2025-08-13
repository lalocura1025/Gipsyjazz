import { CANONICAL_NOTE_NAMES, NOTE_TO_VALUE } from './config.js';

export class ChordIdentifier {
  constructor() {
    // Map of chord names to their interval structure (in semitones)
    this.CHORD_FORMULAS = {
      'Major': [0, 4, 7],
      'Minor': [0, 3, 7],
      'Diminished': [0, 3, 6],
      'Augmented': [0, 4, 8],
      'Sus4': [0, 5, 7],
      'Sus2': [0, 2, 7],
      'Maj7': [0, 4, 7, 11],
      '7': [0, 4, 7, 10],
      'm7': [0, 3, 7, 10],
      'm(Maj7)': [0, 3, 7, 11],
      'm7b5': [0, 3, 6, 10], // Half-diminished
      'dim7': [0, 3, 6, 9],
      '6': [0, 4, 7, 9],
      'm6': [0, 3, 7, 9],
      '7sus4': [0, 5, 7, 10],
      'Maj7#5': [0, 4, 8, 11],
      '7#5': [0, 4, 8, 10],
      '7b5': [0, 4, 6, 10],
    };
  }

  /**
   * Identifies a chord from a set of note names.
   * @param {string[]} noteNames - An array of note names, e.g., ['C', 'E', 'G'].
   * @returns {string|null} The name of the chord (e.g., "C Major") or null if not found.
   */
  identify(noteNames) {
    if (!noteNames || noteNames.length < 3) {
      return null;
    }

    // Get unique numeric values for each note name
    const noteValues = [...new Set(noteNames.map(name => NOTE_TO_VALUE[name]).filter(v => v !== undefined))];

    // Check every note as a potential root
    for (const rootNoteValue of noteValues) {
      // Calculate intervals relative to the potential root
      const intervals = noteValues
        .map(noteValue => (noteValue - rootNoteValue + 12) % 12)
        .sort((a, b) => a - b);

      const intervalsString = JSON.stringify(intervals);

      // Compare the interval pattern with our known formulas
      for (const chordName in this.CHORD_FORMULAS) {
        const formula = this.CHORD_FORMULAS[chordName];
        if (JSON.stringify(formula) === intervalsString) {
          const rootNoteName = CANONICAL_NOTE_NAMES[rootNoteValue];
          return `${rootNoteName} ${chordName}`;
        }
      }
    }

    return null; // No match found
  }
}
