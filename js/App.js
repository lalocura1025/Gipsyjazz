import { DataManager } from './DataManager.js';
import { FretboardUI } from './FretboardUI.js';
import { AudioPlayer } from './AudioPlayer.js';

class App {
  constructor() {
    this.dataManager = new DataManager();
    this.audioPlayer = new AudioPlayer();

    this.dom = {
      rootSelect: document.getElementById('root-note-select'),
      typeSelect: document.getElementById('type-select'),
      nameSelect: document.getElementById('name-select'),
      fretboardContainer: document.getElementById('fretboard-container'),
      soundToggle: document.getElementById('toggle-sound'),
    };

    this.ui = new FretboardUI(
      this.dom.rootSelect,
      this.dom.typeSelect,
      this.dom.nameSelect,
      this.dom.fretboardContainer,
      this.dom.soundToggle
    );

    this.state = {
      rootNote: 'C',
      type: 'scales',
      name: '',
      soundEnabled: true,
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

    this.ui.onNoteClick((string, fret) => {
      this.audioPlayer.playNote(string, fret);
    });
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
