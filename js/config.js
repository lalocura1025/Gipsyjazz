export const NOTES = [
  'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#',
];

export const TUNING = ['E', 'A', 'D', 'G', 'B', 'E']; // Standard tuning, 6th to 1st string

export const NUM_FRETS = 15;

export const STRING_FREQUENCIES = [82.41, 110, 146.83, 196, 246.94, 329.63];

export const SEMITONE_MAP = {
  '1': 0, 'b2': 1, '2': 2, '#2': 3, 'b3': 3, '3': 4, '4': 5, 'b5': 6, '#4': 6, '5': 7, 'b6': 8, '#5': 8, '6': 9, 'bb7': 9, 'b7': 10, '7': 11,
  // Compound intervals (octave removed)
  'b9': 1, '9': 2, '#9': 3, '11': 5, '#11': 6, 'b13': 8, '13': 9,
};
