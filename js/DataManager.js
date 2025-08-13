import { SEMITONE_MAP } from './config.js';

export class DataManager {
  constructor() {
    this.data = {
      scales: {},
      chords: {},
      arpeggios: {},
    };
  }

  async loadData() {
    try {
      const [scales, chords, arpeggios] = await Promise.all([
        fetch('./data/scales.json').then((res) => res.json()),
        fetch('./data/chords.json').then((res) => res.json()),
        fetch('./data/arpeggios.json').then((res) => res.json()),
      ]);
      this.data.scales = scales;
      this.data.chords = chords;
      this.data.arpeggios = arpeggios;
    } catch (error) {
      console.error('Error loading data:', error);
      throw new Error('Failed to load musical data. Please check the data files and network connection.');
    }
  }

  getNamesForType(type) {
    return Object.keys(this.data[type] || {});
  }

  getIntervals(type, name) {
    const intervalStrings = this.data[type]?.[name];
    if (!intervalStrings) {
      return [];
    }
    return intervalStrings
      .map((i) => this.intervalStringToSemitone(i))
      .filter((i) => i !== null);
  }

  intervalStringToSemitone(intervalStr) {
    const semitone = SEMITONE_MAP[intervalStr];
    if (semitone === undefined) {
      console.warn(`Unknown interval: ${intervalStr}`);
      return null;
    }
    return semitone;
  }

  getIntervalName(semitone) {
    for (const name in SEMITONE_MAP) {
      if (SEMITONE_MAP[name] === semitone) {
        return name;
      }
    }
    return null;
  }
}
