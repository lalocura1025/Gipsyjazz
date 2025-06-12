'use strict';

/**
 * @class DiapasonInteractivo
 * @description Manages all the logic for the advanced interactive fretboard application.
 * This class handles UI, state management, musical logic, and event binding.
 * It's designed to be modular, loading its musical data from external JSON files.
 */
class DiapasonInteractivo {
    /**
     * Initializes the application.
     * @param {string} fretboardId - The DOM ID of the fretboard container element.
     */
    constructor(fretboardId = 'fretboard') {
        console.log("Initializing DiapasonInteractivo v9 (Refactored)...");

        // --- Core Constants & Configuration ---
        this.MAX_FRETS = 15;
        this.NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        this.NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
        this.useFlats = false; // Future option for display preferences.

        // --- Musical Data (to be loaded from JSON) ---
        // This structure centralizes all external data, making the application's logic
        // independent of the data source.
        this.data = {
            scales: {},
            arpeggios: {},
            chords: {},
            gypsyVoicings: {},
            theorySnippets: {},
            equivalentPatterns: {}
        };

        // --- Interval Mapping ---
        // Bi-directional map for quick lookups between interval names and semitone values.
        this.intervalMap = { 0: '1', 1: 'b2', 2: '2', 3: 'b3', 4: '3', 5: '4', 6: 'b5', 7: '5', 8: '#5', 9: '6', 10: 'b7', 11: '7' };
        this.intervalSemitones = this._initializeIntervalSeminotesMap();

        // --- Tunings ---
        // Hard-coded as they are fundamental configurations of the instrument itself.
        this.tunings = {
            'Standard (EADGBE)': ['E', 'A', 'D', 'G', 'B', 'E'],
            'Drop D (DADGBE)': ['D', 'A', 'D', 'G', 'B', 'E'],
            'Open G (DGDGBD)': ['D', 'G', 'D', 'G', 'B', 'D'],
            'Open D (DADF#AD)': ['D', 'A', 'D', 'F#', 'A', 'D'],
            'Standard C (CFA#D#GC)': ['C', 'F', 'A#', 'D#', 'G', 'C'],
        };
        this.currentTuningName = 'Standard (EADGBE)';

        // --- Application State ---
        // These properties track the user's interactions and the current display state.
        this.selectedNotesData = [];
        this.tonicInfo = null;
        this.currentHighlight = null;
        this.currentVoicingExample = null;
        this.activeVoicingExampleType = null;
        this.activeVoicingIndex = -1;
        this.identifiedChordInfo = null;
        this.currentInversionIndex = 0;
        this.selectedPatternType = 'scale';
        this.isLeftHanded = false;
        this.isAudioEnabled = false;
        this.audioSynth = null;

        // --- DOM Element References ---
        // Centralizing DOM queries improves performance and organization.
        this.dom = {};

        // --- Asynchronous Initialization ---
        // The constructor now delegates to an async method to handle data loading
        // before proceeding with the setup.
        this._initialize();
    }

    /**
     * Main asynchronous initialization method.
     * This orchestrates the loading of data and the setup of the UI.
     * @private
     */
    async _initialize() {
        try {
            // CRITICAL STEP: Load all external data first.
            await this._loadAllData();

            // Once data is loaded, proceed with DOM setup and bindings.
            this._getDomElements('fretboard');
            if (!this._validateDomElements()) return;

            this._populateControls();
            this._buildFretboard();
            this._bindEvents();
            this._updatePatternType();
            this._updateInversionSelect();
            this._initializeAudio();
            this._initializeTooltips();

            // Initial UI animation.
            window.setTimeout(() => {
                this._getAllNoteElements().forEach(el => el.classList.add('visible'));
            }, 50);

            console.log("DiapasonInteractivo v9 (Refactored) initialized successfully.");
        } catch (error) {
            console.error("Fatal error during initialization:", error);
            alert("Could not load application data. Please check the console and ensure all .json files are accessible.");
        }
    }

    /**
     * Fetches all required JSON data files in parallel.
     * This is a robust way to handle multiple asynchronous operations.
     * @private
     */
    async _loadAllData() {
        console.log("Loading data from JSON files...");
        try {
            const [scales, arpeggios, chords, gypsyVoicings, theorySnippets, equivalentPatterns] = await Promise.all([
                fetch('./data/scales.json').then(res => this._handleFetchResponse(res, 'scales.json')),
                fetch('./data/arpeggios.json').then(res => this._handleFetchResponse(res, 'arpeggios.json')),
                fetch('./data/chords.json').then(res => this._handleFetchResponse(res, 'chords.json')),
                fetch('./data/theory/gypsy_voicings.json').then(res => this._handleFetchResponse(res, 'gypsy_voicings.json')),
                fetch('./data/theory/theory_snippets.json').then(res => this._handleFetchResponse(res, 'theory_snippets.json')),
                fetch('./data/equivalent_patterns.json').then(res => this._handleFetchResponse(res, 'equivalent_patterns.json'))
            ]);

            this.data = { scales, arpeggios, chords, gypsyVoicings, theorySnippets, equivalentPatterns };
            console.log("All data loaded successfully.", this.data);
        } catch (error) {
            console.error("Failed to load one or more data files:", error);
            // Re-throw the error to be caught by the _initialize method.
            throw error;
        }
    }

    /**
     * A helper to handle fetch responses, checking for network errors.
     * @param {Response} response - The response object from fetch.
     * @param {string} fileName - The name of the file being fetched, for error logging.
     * @returns {Promise<any>}
     * @private
     */
    _handleFetchResponse(response, fileName) {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} while fetching ${fileName}`);
        }
        return response.json();
    }


    /**
     * Creates an extended map from interval names to semitone values.
     * This includes common aliases for broader recognition.
     * @private
     * @returns {Object.<string, number>}
     */
    _initializeIntervalSeminotesMap() {
        const invertedMap = this._invertMap(this.intervalMap);
        Object.assign(invertedMap, {
            'P1': 0, 'R': 0,
            'm2': 1, 'min2': 1, 'b9': 1,
            'M2': 2, 'maj2': 2, '9': 2,
            'm3': 3, 'min3': 3, '#9': 3, 'a9': 3,
            'M3': 4, 'maj3': 4,
            'P4': 5, '11': 5,
            'A4': 6, 'aug4': 6, '#4': 6, '#11': 6, 'd5': 6, 'dim5': 6,
            'P5': 7,
            'A5': 8, 'aug5': 8, 'b6': 8, 'm6': 8, 'min6': 8, 'b13': 8,
            'M6': 9, 'maj6': 9, '13': 9, 'bb7': 9,
            'm7': 10, 'min7': 10, 'dom7': 10,
            'M7': 11, 'maj7': 11
        });
        return invertedMap;
    }

    /**
     * Queries the DOM for all necessary elements and stores them in this.dom.
     * @param {string} fretboardId
     * @private
     */
    _getDomElements(fretboardId) {
        const d = (selector) => document.querySelector(selector);
        this.dom = {
            fretboard: d(`#${fretboardId}`),
            inversionHighlightBg: d('#inversionHighlightBg'),
            selectedNotes: d('#selectedNotes'),
            intervalsDisplay: d('#intervalsDisplay'),
            chordName: d('#chordName'),
            currentStudyPattern: d('#currentStudyPattern'),
            equivalentPatterns: d('#equivalentPatterns'),
            highlightedNotesDisplay: d('#highlightedNotesDisplay'),
            rootNoteSelect: d('#rootNoteSelect'),
            patternTypeSelect: d('#patternTypeSelect'),
            patternSelect: d('#patternSelect'),
            inversionSelect: d('#inversionSelect'),
            showPatternBtn: d('#showPatternBtn'),
            showGmaj7Btn: d('#showGmaj7Btn'),
            showGm6Btn: d('#showGm6Btn'),
            showGdim7Btn: d('#showGdim7Btn'),
            showG7Btn: d('#showG7Btn'),
            clearHighlightsBtn: d('#clearHighlightsBtn'),
            resetBtn: d('#resetBtn'),
            clearSelectionBtn: d('#clearSelectionBtn'),
            tuningSelect: d('#tuningSelect'),
            toggleLeftyBtn: d('#toggleLeftyBtn'),
            toggleAudioBtn: d('#toggleAudioBtn'),
            theoryDisplay: d('#theoryDisplay'),
            theoryTitle: d('#theoryTitle'),
            theoryContent: d('#theoryContent'),
            voicingControls: d('#voicingControls'),
            voicingTypeSelect: d('#voicingTypeSelect'),
            stringSetSelect: d('#stringSetSelect')
        };
        // Add fretboard container for orientation logic
        this.dom.fretboardContainer = this.dom.fretboard ? this.dom.fretboard.parentElement : null;
    }

    /**
     * Validates that all essential DOM elements were found.
     * @private
     * @returns {boolean}
     */
    _validateDomElements() {
        for (const key in this.dom) {
            if (!this.dom[key]) {
                console.error(`Fatal Error: DOM element not found for key '${key}'. The application cannot start.`);
                return false;
            }
        }
        return true;
    }
    
    // ... [ The rest of the class methods (_buildFretboard, _bindEvents, _handleFretboardClick, etc.) go here ]
    // IMPORTANT: Make sure to replace all occurrences of `this.scaleDictionary` with `this.data.scales`,
    // `this.arpeggioDictionary` with `this.data.arpeggios`, and so on for all the loaded data.
    // The following is a placeholder for the rest of the code, which you should adapt from your original file.
    // I will provide the fully refactored methods in the next steps.

    /**
     * Binds all necessary event listeners to the DOM elements.
     * @private
     */
    _bindEvents() {
        // Example of a refactored binding
        this.dom.resetBtn.onclick = () => this.resetAll();
        
        // You would continue this pattern for all other events...
        this.dom.showPatternBtn.onclick = () => this._displaySelectedPatternOrVoicing();
        this.dom.clearHighlightsBtn.onclick = () => this._clearHighlights(true);
        this.dom.clearSelectionBtn.onclick = () => this._clearChordSelection();

        this.dom.patternTypeSelect.onchange = () => this._updatePatternType();
        this.dom.inversionSelect.onchange = (e) => this._handleInversionChange(e);
        this.dom.tuningSelect.onchange = (e) => this._handleTuningChange(e);
        
        this.dom.rootNoteSelect.onchange = () => { if(this.currentHighlight && !this.activeVoicingExampleType) { this._displaySelectedPatternOrVoicing(); } };
        this.dom.patternSelect.onchange = () => { if(this.currentHighlight && !this.activeVoicingExampleType) { this._displaySelectedPatternOrVoicing(); } };
        
        this.dom.voicingTypeSelect.onchange = () => { if(this.currentHighlight && this.currentHighlight.type === 'voicing') { this._displaySelectedPatternOrVoicing(); } };
        this.dom.stringSetSelect.onchange = () => { if(this.currentHighlight && this.currentHighlight.type === 'voicing') { this._displaySelectedPatternOrVoicing(); } };

        this.dom.fretboard.onclick = (event) => this._handleFretboardClick(event);
        this.dom.fretboard.onkeydown = (event) => {
            if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.note.visible:not(.dimmed), .open-string-marker.visible:not(.dimmed)')) {
                event.preventDefault();
                this._handleFretboardClick(event);
            }
        };

        this.dom.showGmaj7Btn.onclick = () => this._displaySpecificVoicingExample('gmaj7Drop2');
        this.dom.showGm6Btn.onclick = () => this._displaySpecificVoicingExample('gm6');
        this.dom.showGdim7Btn.onclick = () => this._displaySpecificVoicingExample('gDim7');
        this.dom.showG7Btn.onclick = () => this._displaySpecificVoicingExample('g7Drop2');

        this.dom.toggleLeftyBtn.onclick = () => this._toggleLeftHandedMode();
    }

    // NOTE: All other methods from your original class should be here,
    // but with their dictionary references updated to `this.data.*`.
    // I will omit them for brevity here but they are required for functionality.
    // Please make sure to copy them from the original file and apply the changes.
}


// --- Application Entry Point ---
// This ensures the script runs after the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
    // Instantiate the main class to start the application.
    // The constructor is now async and handles its own initialization flow.
    new DiapasonInteractivo('fretboard');
});

// A simple utility function, can be placed outside the class
function _invertMap(map) {
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [v, parseInt(k)]));
}
