import { NOTES, TUNING, NUM_FRETS } from './config.js';

export class FretboardUI {
  constructor(
    rootSelect,
    typeSelect,
    nameSelect,
    fretboardContainer,
    soundToggle
  ) {
    this.rootSelect = rootSelect;
    this.typeSelect = typeSelect;
    this.nameSelect = nameSelect;
    this.fretboardContainer = fretboardContainer;
    this.soundToggle = soundToggle;
    this.noteClickCallback = null;
    this.fretElements = []; // To cache fret elements
  }

  onNoteClick(callback) {
    this.noteClickCallback = callback;
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

    const rootIndex = NOTES.indexOf(rootNote);
    const scaleNotes = intervals.map(
      (interval) => NOTES[(rootIndex + interval) % 12]
    );

    TUNING.toReversed().forEach((openNote, stringIndex) => {
      const openNoteIndex = NOTES.indexOf(openNote);
      const stringNum = 5 - stringIndex;

      for (let fret = 0; fret <= NUM_FRETS; fret++) {
        const currentNoteIndex = (openNoteIndex + fret) % 12;
        const currentNote = NOTES[currentNoteIndex];

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

    noteEl.addEventListener('click', (e) => {
      if (this.noteClickCallback) {
        const string = parseInt(e.currentTarget.dataset.string, 10);
        const fret = parseInt(e.currentTarget.dataset.fret, 10);
        this.noteClickCallback(string, fret);
      }
    });

    fretEl.appendChild(noteEl);
  }

  updateSoundToggle(isSoundEnabled) {
    this.soundToggle.textContent = isSoundEnabled ? 'Sonido On' : 'Sonido Off';
  }

  renderError(message) {
    this.fretboardContainer.innerHTML = `<p class="error">${message}</p>`;
  }
}
