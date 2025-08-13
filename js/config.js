// The canonical names for notes, using sharps for accidentals.
// Used for displaying note names.
export const CANONICAL_NOTE_NAMES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
];

// A map to convert any valid note name (including enharmonic equivalents)
// to its numeric value (0-11).
export const NOTE_TO_VALUE = {
  'B#': 0, 'C': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4,
  'F': 5, 'E#': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11,
};

export const TUNING = ['E', 'A', 'D', 'G', 'B', 'E']; // Standard tuning, 6th to 1st string

export const NUM_FRETS = 15;

export const STRING_FREQUENCIES = [82.41, 110, 146.83, 196, 246.94, 329.63];

export const SEMITONE_MAP = {
  '1': 0, 'b2': 1, '2': 2, '#2': 3, 'b3': 3, '3': 4, '4': 5, 'b5': 6, '#4': 6, '5': 7, 'b6': 8, '#5': 8, '6': 9, 'bb7': 9, 'b7': 10, '7': 11,
  // Compound intervals (octave removed)
  'b9': 1, '9': 2, '#9': 3, '11': 5, '#11': 6, 'b13': 8, '13': 9,
};
