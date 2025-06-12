class FretboardApp {
  constructor() {
    this.NOTES = ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#'];
    this.TUNING = ['E', 'A', 'D', 'G', 'B', 'E']; // Standard tuning, 6th to 1st string
    this.NUM_FRETS = 15;

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
      this.dom.fretboardContainer.innerHTML = '<p>Error al cargar datos. Revisa la consola.</p>';
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
    const scaleNotes = intervals.map(interval => this.NOTES[(rootIndex + interval) % 12]);

    this.TUNING.toReversed().forEach((openNote, stringIndex) => {
        const openNoteIndex = this.NOTES.indexOf(openNote);
        for (let fret = 0; fret <= this.NUM_FRETS; fret++) {
            const currentNoteIndex = (openNoteIndex + fret) % 12;
            const currentNote = this.NOTES[currentNoteIndex];
            
            if (scaleNotes.includes(currentNote)) {
                const fretEl = this.dom.fretboardContainer.querySelector(`.fret[data-string="${5 - stringIndex}"][data-fret="${fret}"]`);
                const noteEl = document.createElement('div');
                noteEl.className = 'note';
                noteEl.textContent = currentNote;

                if (currentNote === this.state.rootNote) {
                    noteEl.classList.add('root-note');
                }
                
                fretEl.appendChild(noteEl);
            }
        }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new FretboardApp();
});