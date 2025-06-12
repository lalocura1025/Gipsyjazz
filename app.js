class FretboardApp {
  constructor() {
    this.NOTES = [
      'E',
      'F',
      'F#',
      'G',
      'G#',
      'A',
      'A#',
      'B',
      'C',
      'C#',
      'D',
      'D#',
    ];
    this.TUNING = ['E', 'A', 'D', 'G', 'B', 'E']; // Standard tuning, 6th to 1st string
    this.NUM_FRETS = 15;

    this.STRING_FREQUENCIES = [82.41, 110, 146.83, 196, 246.94, 329.63];
    this.soundEnabled = true;
    this.audioCtx = null;

    this.data = {
      scales: {},
      chords: {},
      arpeggios: {},
    };

    this.state = {
      rootNote: 'C',
      type: 'scales',
      name: '',
    };

    this.dom = {
      rootSelect: document.getElementById('root-note-select'),
      typeSelect: document.getElementById('type-select'),
      nameSelect: document.getElementById('name-select'),
      fretboardContainer: document.getElementById('fretboard-container'),
      soundToggle: document.getElementById('toggle-sound'),
    };

    this.initialize();
  }

  async initialize() {
    await this.loadData();
    this.setupEventListeners();
    this.updateNameSelector();
    this.render();
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
      this.dom.fretboardContainer.innerHTML =
        '<p>Error al cargar datos. Revisa la consola.</p>';
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
      this.soundEnabled = !this.soundEnabled;
      this.dom.soundToggle.textContent = this.soundEnabled
        ? 'Sonido On'
        : 'Sonido Off';
    });
  }

  updateNameSelector() {
    const dataForType = this.data[this.state.type];
    const names = Object.keys(dataForType);

    if (names.length === 0) return;

    this.dom.nameSelect.innerHTML = names
      .map((name) => `<option value="${name}">${name}</option>`)
      .join('');

    this.state.name = names[0]; // Seleccionar el primero por defecto
  }

  render() {
    this.drawFretboard();
    this.displayNotes();
  }

  drawFretboard() {
    this.dom.fretboardContainer.innerHTML = '';
    const fretboard = document.createElement('div');
    fretboard.className = 'fretboard';

    // Crear las celdas para cada traste en cada cuerda
    this.TUNING.toReversed().forEach((openNote, stringIndex) => {
      const stringEl = document.createElement('div');
      stringEl.className = 'string';
      for (let fret = 0; fret <= this.NUM_FRETS; fret++) {
        const fretEl = document.createElement('div');
        fretEl.className = 'fret';
        fretEl.dataset.fret = fret;
        fretEl.dataset.string = 5 - stringIndex; // 0-indexed from top
        stringEl.appendChild(fretEl);
      }
      fretboard.appendChild(stringEl);
    });

    this.dom.fretboardContainer.appendChild(fretboard);
  }

  displayNotes() {
    const intervals = this.data[this.state.type]?.[this.state.name];
    if (!intervals) return;

    const rootIndex = this.NOTES.indexOf(this.state.rootNote);
    const scaleNotes = intervals.map(
      (interval) => this.NOTES[(rootIndex + interval) % 12]
    );

    this.TUNING.toReversed().forEach((openNote, stringIndex) => {
      const openNoteIndex = this.NOTES.indexOf(openNote);
      for (let fret = 0; fret <= this.NUM_FRETS; fret++) {
        const currentNoteIndex = (openNoteIndex + fret) % 12;
        const currentNote = this.NOTES[currentNoteIndex];

        if (scaleNotes.includes(currentNote)) {
          const fretEl = this.dom.fretboardContainer.querySelector(
            `.fret[data-string="${5 - stringIndex}"][data-fret="${fret}"]`
          );
          const noteEl = document.createElement('div');
          noteEl.className = 'note';
          noteEl.textContent = currentNote;

          if (currentNote === this.state.rootNote) {
            noteEl.classList.add('root-note');
          }
          noteEl.dataset.string = 5 - stringIndex;
          noteEl.dataset.fret = fret;
          noteEl.addEventListener('click', () => {
            this.playNote(
              parseInt(noteEl.dataset.string, 10),
              parseInt(noteEl.dataset.fret, 10)
            );
          });

          fretEl.appendChild(noteEl);
        }
      }
    });
  }

  playNote(stringIndex, fret) {
    if (!this.soundEnabled) return;
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const frequency =
      this.STRING_FREQUENCIES[stringIndex] * Math.pow(2, fret / 12);
    const oscillator = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    gain.connect(this.audioCtx.destination);
    gain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.2,
      this.audioCtx.currentTime + 0.01
    );
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioCtx.currentTime + 1
    );
    oscillator.start();
    oscillator.stop(this.audioCtx.currentTime + 1);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new FretboardApp();
});
