import { CANONICAL_NOTE_NAMES, NOTE_TO_VALUE, TUNING, NUM_FRETS } from './config.js';

export class FretboardUI {
  constructor(
    rootSelect,
    typeSelect,
    nameSelect,
    fretboardContainer,
    soundToggle,
    chordDisplay
  ) {
    this.rootSelect = rootSelect;
    this.typeSelect = typeSelect;
    this.nameSelect = nameSelect;
    this.fretboardContainer = fretboardContainer;
    this.soundToggle = soundToggle;
    this.chordDisplay = chordDisplay;
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

  displayNotes(rootNote, intervals) {
    // Clear previous notes
    this.fretboardContainer
      .querySelectorAll('.note')
      .forEach((note) => note.remove());

    if (!intervals || !rootNote) return;

    const rootIndex = NOTE_TO_VALUE[rootNote];
    if (rootIndex === undefined) return; // Unknown root note

    const scaleNotes = intervals.map(
      (interval) => CANONICAL_NOTE_NAMES[(rootIndex + interval) % 12]
    );

    TUNING.toReversed().forEach((openNote, stringIndex) => {
      const openNoteIndex = NOTE_TO_VALUE[openNote];
      const stringNum = 5 - stringIndex;

      for (let fret = 0; fret <= NUM_FRETS; fret++) {
        const currentNoteIndex = (openNoteIndex + fret) % 12;
        const currentNote = CANONICAL_NOTE_NAMES[currentNoteIndex];

        if (scaleNotes.includes(currentNote)) {
          const fretEl = this.fretElements[stringNum]?.[fret];
          if (fretEl) {
            this.addNoteToFret(fretEl, currentNote, rootNote);
          }
        }
      }
    });
  }

  addNoteToFret(fretEl, noteName, rootNote) {
    const noteEl = document.createElement('div');
    noteEl.className = 'note';
    noteEl.textContent = noteName;

    if (noteName === rootNote) {
      noteEl.classList.add('root-note');
    }

    noteEl.dataset.string = fretEl.dataset.string;
    noteEl.dataset.fret = fretEl.dataset.fret;

    fretEl.appendChild(noteEl);
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
