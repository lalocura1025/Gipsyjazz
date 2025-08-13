import { CANONICAL_NOTE_NAMES, NOTE_TO_VALUE, TUNING, NUM_FRETS } from './config.js';

export class FretboardUI {
  constructor(
    rootSelect,
    typeSelect,
    nameSelect,
    dropSelect,
    fretboardContainer,
    soundToggle,
    chordDisplay,
    dataManager
  ) {
    this.rootSelect = rootSelect;
    this.typeSelect = typeSelect;
    this.nameSelect = nameSelect;
    this.dropSelect = dropSelect;
    this.fretboardContainer = fretboardContainer;
    this.soundToggle = soundToggle;
    this.chordDisplay = chordDisplay;
    this.dataManager = dataManager;
    this.fretClickCallback = null;
    this.fretElements = []; // To cache fret elements
  }

  onFretClick(callback) {
    this.fretClickCallback = callback;
  }

  updateNameSelector(names) {
    if (!names || names.length === 0) {
      this.nameSelect.innerHTML = '<option>---</option>';
      return;
    }
    this.nameSelect.innerHTML = names
      .map((name) => `<option value="${name}">${name}</option>`)
      .join('');
  }

  drawFretboard() {
    this.fretboardContainer.innerHTML = ''; // Clear previous content
    this.fretElements = []; // Reset cache
    const fretboard = document.createElement('div');
    fretboard.className = 'fretboard';

    TUNING.toReversed().forEach((_, stringIndex) => {
      const stringNum = 5 - stringIndex;
      this.fretElements[stringNum] = [];
      const stringEl = document.createElement('div');
      stringEl.className = 'string';

      for (let fret = 0; fret <= NUM_FRETS; fret++) {
        const fretEl = document.createElement('div');
        fretEl.className = 'fret';
        fretEl.dataset.fret = fret;
        fretEl.dataset.string = stringNum;

        fretEl.addEventListener('click', () => {
          if (this.fretClickCallback) {
            this.fretClickCallback(stringNum, fret);
          }
        });

        stringEl.appendChild(fretEl);
        this.fretElements[stringNum][fret] = fretEl; // Cache the element
      }
      fretboard.appendChild(stringEl);
    });

    this.fretboardContainer.appendChild(fretboard);
  }

  getNoteNameFromValue(noteValue) {
    return CANONICAL_NOTE_NAMES[noteValue % 12];
  }

  getDropVoicing(intervals, drop) {
    if (drop === '2' && intervals.length === 4) {
      const secondNote = intervals.splice(2, 1);
      intervals.unshift(secondNote[0] - 12);
    } else if (drop === '3' && intervals.length === 4) {
      const thirdNote = intervals.splice(1, 1);
      intervals.unshift(thirdNote[0] - 12);
    }
    return intervals;
  }

  displayNotes(rootNote, intervals, drop) {
    this.fretboardContainer.querySelectorAll('.note').forEach((note) => note.remove());
    if (!intervals || !rootNote) return;

    const rootValue = NOTE_TO_VALUE[rootNote];
    if (rootValue === undefined) return;

    let finalIntervals = [...intervals];
    if (drop && (this.typeSelect.value === 'chords' || this.typeSelect.value === 'arpeggios')) {
      finalIntervals = this.getDropVoicing(finalIntervals, drop);
    }

    const scaleNotes = finalIntervals.map(
      (interval) => (rootValue + interval) % 12
    );

    TUNING.toReversed().forEach((openNote, stringIndex) => {
      const openNoteIndex = NOTE_TO_VALUE[openNote];
      const stringNum = 5 - stringIndex;

      for (let fret = 0; fret <= NUM_FRETS; fret++) {
        const currentNoteValue = (openNoteIndex + fret);
        const currentNoteName = this.getNoteNameFromValue(currentNoteValue);

        if (scaleNotes.includes(currentNoteValue % 12)) {
          const fretEl = this.freElements[stringNum]?.[fret];
          if (fretEl) {
            const interval = finalIntervals.find(i => (rootValue + i) % 12 === currentNoteValue % 12);
            this.addNoteToFret(fretEl, currentNoteName, rootNote, interval);
          }
        }
      }
    });
  }

  addNoteToFret(fretEl, noteName, rootNote, interval) {
    const noteEl = document.createElement('div');
    noteEl.className = 'note';
    noteEl.textContent = noteName;

    if (noteName === rootNote) {
      noteEl.classList.add('root-note');
    }

    noteEl.dataset.string = fretEl.dataset.string;
    noteEl.dataset.fret = fretEl.dataset.fret;
    noteEl.dataset.interval = interval;

    noteEl.addEventListener('click', () => this.highlightInterval(noteEl));

    fretEl.appendChild(noteEl);
  }

  highlightInterval(noteEl) {
    const interval = parseInt(noteEl.dataset.interval, 10);
    const intervalName = this.dataManager.getIntervalName(interval);

    // Remove any existing interval display
    const existingInterval = document.getElementById('interval-display');
    if (existingInterval) {
      existingInterval.remove();
    }

    if (intervalName) {
      const intervalDisplay = document.createElement('div');
      intervalDisplay.id = 'interval-display';
      intervalDisplay.textContent = `Intervalo: ${intervalName}`;
      this.fretboardContainer.appendChild(intervalDisplay);
    }
  }

  toggleFretSelected(string, fret, isSelected) {
    const fretEl = this.fretElements[string]?.[fret];
    if (fretEl) {
      fretEl.classList.toggle('selected', isSelected);
    }
  }

  updateSoundToggle(isSoundEnabled) {
    this.soundToggle.textContent = isSoundEnabled ? 'Sonido On' : 'Sonido Off';
  }

  renderError(message) {
    this.fretboardContainer.innerHTML = `<p class="error">${message}</p>`;
  }

  updateChordDisplay(chordName) {
    this.chordDisplay.textContent = chordName || '---';
  }
}
