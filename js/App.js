import { DataManager } from './DataManager.js';
import { FretboardUI } from './FretboardUI.js';
import { AudioPlayer } from './AudioPlayer.js';
import { ChordIdentifier } from './ChordIdentifier.js';
import { CANONICAL_NOTE_NAMES, NOTE_TO_VALUE, TUNING } from './config.js';

class App {
  constructor() {
    this.dataManager = new DataManager();
    this.audioPlayer = new AudioPlayer();
    this.chordIdentifier = new ChordIdentifier();

    this.dom = {
      rootSelect: document.getElementById('root-note-select'),
      typeSelect: document.getElementById('type-select'),
      nameSelect: document.getElementById('name-select'),
      fretboardContainer: document.getElementById('fretboard-container'),
      soundToggle: document.getElementById('toggle-sound'),
      chordDisplay: document.getElementById('chord-display'),
      modeSwitches: document.querySelectorAll('input[name="mode"]'),
    };

    this.ui = new FretboardUI(
      this.dom.rootSelect,
      this.dom.typeSelect,
      this.dom.nameSelect,
      this.dom.fretboardContainer,
      this.dom.soundToggle,
      this.dom.chordDisplay
    );

    this.state = {
      rootNote: 'C',
      type: 'scales',
      name: '',
      soundEnabled: true,
      selectedNotes: [], // To store { string, fret, noteName }
      mode: 'display', // 'display' or 'identify'
    };

    this.initialize();
  }

  async initialize() {
    try {
      await this.dataManager.loadData();
      this.setupEventListeners();
      this.ui.drawFretboard();
      this.updateNameSelector();
      this.render();
    } catch (error) {
      console.error('Initialization failed:', error);
      this.ui.renderError(error.message);
    }
  }

  setupEventListeners() {
    this.dom.rootSelect.addEventListener('change', (e) => {
      this.state.rootNote = e.target.value;
      this.render();
    });

    this.dom.typeSelect.addEventListener('change', (e) => {
      this.state.type = e.target.value;
      this.updateNameSelector();
      this.render();
    });

    this.dom.nameSelect.addEventListener('change', (e) => {
      this.state.name = e.target.value;
      this.render();
    });

    this.dom.soundToggle.addEventListener('click', () => {
      this.state.soundEnabled = !this.state.soundEnabled;
      this.audioPlayer.toggleSound(this.state.soundEnabled);
      this.ui.updateSoundToggle(this.state.soundEnabled);
    });

    this.ui.onFretClick((string, fret) => {
      this.handleFretClick(string, fret);
    });

    this.dom.modeSwitches.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.handleModeChange(e.target.value);
      });
    });
  }

  handleModeChange(newMode) {
    this.state.mode = newMode;
    this.updateUIForMode();
  }

  updateUIForMode() {
    const isDisplayMode = this.state.mode === 'display';

    // Toggle disabled state of display controls
    this.dom.rootSelect.disabled = !isDisplayMode;
    this.dom.typeSelect.disabled = !isDisplayMode;
    this.dom.nameSelect.disabled = !isDisplayMode;

    if (isDisplayMode) {
      // Switched to Display Mode
      // Clear selected frets
      this.state.selectedNotes.forEach(note => {
        this.ui.toggleFretSelected(note.string, note.fret, false);
      });
      this.state.selectedNotes = [];
      this.ui.updateChordDisplay(null); // Clear chord name
      this.render(); // Re-render the selected scale
    } else {
      // Switched to Identify Mode
      // Clear displayed scale notes
      this.ui.displayNotes(null, []);
    }
  }

  getNoteAt(string, fret) {
    const openNoteValue = NOTE_TO_VALUE[TUNING[string]];
    if (openNoteValue === undefined) return null;
    const noteIndex = (openNoteValue + fret) % 12;
    return CANONICAL_NOTE_NAMES[noteIndex];
  }

  handleFretClick(string, fret) {
    if (this.state.mode !== 'identify') return;

    const noteName = this.getNoteAt(string, fret);
    if (!noteName) return;

    this.audioPlayer.playNote(string, fret);

    const existingNoteIndex = this.state.selectedNotes.findIndex(
      (n) => n.string === string && n.fret === fret
    );

    let isSelected;
    if (existingNoteIndex > -1) {
      // Note exists, so remove it
      this.state.selectedNotes.splice(existingNoteIndex, 1);
      isSelected = false;
    } else {
      // Note doesn't exist, so add it
      this.state.selectedNotes.push({ string, fret, noteName });
      isSelected = true;
    }

    this.ui.toggleFretSelected(string, fret, isSelected);

    const selectedNoteNames = this.state.selectedNotes.map(n => n.noteName);
    const chordName = this.chordIdentifier.identify(selectedNoteNames);
    this.ui.updateChordDisplay(chordName);
  }

  updateNameSelector() {
    const names = this.dataManager.getNamesForType(this.state.type);
    this.ui.updateNameSelector(names);
    if (names.length > 0) {
      this.state.name = names[0];
    } else {
      this.state.name = '';
    }
  }

  render() {
    if (this.state.mode !== 'display') return;

    const intervals = this.dataManager.getIntervals(
      this.state.type,
      this.state.name
    );
    this.ui.displayNotes(this.state.rootNote, intervals);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
