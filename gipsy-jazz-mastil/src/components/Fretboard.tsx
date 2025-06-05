import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Tone from 'tone';

interface Note {
  name: string;
  value: number;
  fret: number;
  string: number;
  id: string;
}

interface FretboardProps {
  tuning?: string[];
  maxFrets?: number;
  highlightedNotes?: Map<string, string>;
  selectedNotes?: Set<string>;
  onNoteClick?: (note: Note) => void;
  audioEnabled?: boolean;
  leftHanded?: boolean;
  showIntervals?: boolean;
}

const DEFAULT_TUNING = ['E', 'A', 'D', 'G', 'B', 'E'];
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const Fretboard: React.FC<FretboardProps> = ({
  tuning = DEFAULT_TUNING,
  maxFrets = 15,
  highlightedNotes = new Map(),
  selectedNotes = new Set(),
  onNoteClick,
  audioEnabled = false,
  leftHanded = false,
  showIntervals = true
}) => {
  const [audioSynth, setAudioSynth] = useState<Tone.Synth | null>(null);
  const fretboardRef = useRef<HTMLDivElement>(null);

  // Inicializar audio
  useEffect(() => {
    if (audioEnabled && !audioSynth) {
      const synth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.02,
          decay: 0.2,
          sustain: 0.3,
          release: 0.8
        }
      }).toDestination();
      setAudioSynth(synth);
    }
  }, [audioEnabled, audioSynth]);

  // Función para obtener el valor numérico de una nota
  const getNoteValue = useCallback((noteName: string): number => {
    const cleanName = noteName.replace(/[0-9]/g, '');
    return NOTE_NAMES.indexOf(cleanName);
  }, []);

  // Función para obtener el nombre de una nota desde su valor
  const getNoteName = useCallback((value: number): string => {
    return NOTE_NAMES[value % 12];
  }, []);

  // Calcular nota en una posición específica
  const calculateNote = useCallback((stringIndex: number, fret: number): Note => {
    const openStringValue = getNoteValue(tuning[stringIndex]);
    const noteValue = (openStringValue + fret) % 12;
    const noteName = getNoteName(noteValue);
    const id = `${stringIndex}-${fret}`;
    
    return {
      name: noteName,
      value: noteValue,
      fret,
      string: stringIndex,
      id
    };
  }, [tuning, getNoteValue, getNoteName]);

  // Manejar click en nota
  const handleNoteClick = useCallback(async (note: Note) => {
    // Reproducir sonido si está habilitado
    if (audioEnabled && audioSynth) {
      try {
        await Tone.start();
        const octave = 2 + Math.floor((getNoteValue(tuning[note.string]) + note.fret) / 12);
        audioSynth.triggerAttackRelease(`${note.name}${octave}`, '4n');
      } catch (error) {
        console.error('Error reproduciendo audio:', error);
      }
    }

    // Llamar callback si existe
    if (onNoteClick) {
      onNoteClick(note);
    }
  }, [audioEnabled, audioSynth, tuning, getNoteValue, onNoteClick]);

  // Obtener clase CSS para una nota
  const getNoteClass = useCallback((note: Note): string => {
    const baseClass = 'note';
    const isHighlighted = highlightedNotes.has(note.id);
    const isSelected = selectedNotes.has(note.id);
    
    let classes = [baseClass];
    
    if (isHighlighted) classes.push('highlighted');
    if (isSelected) classes.push('selected');
    if (!isHighlighted && !isSelected) classes.push('dimmed');
    
    return classes.join(' ');
  }, [highlightedNotes, selectedNotes]);

  // Obtener estilo para una nota basado en su intervalo
  const getNoteStyle = useCallback((note: Note): React.CSSProperties => {
    const interval = highlightedNotes.get(note.id);
    if (!interval) return {};

    // Colores específicos para intervalos
    const intervalColors: Record<string, string> = {
      '1': '#ef4444', // Rojo - Tónica
      'b2': '#6366f1', // Índigo - 2da menor
      '2': '#6366f1', // Índigo - 2da mayor
      'b3': '#3b82f6', // Azul - 3ra menor
      '3': '#3b82f6', // Azul - 3ra mayor
      '4': '#6b7280', // Gris - 4ta
      'b5': '#78716c', // Gris piedra - Tritono
      '5': '#10b981', // Verde - 5ta
      '#5': '#10b981', // Verde - 5ta aumentada
      'b6': '#8b5cf6', // Violeta - 6ta menor
      '6': '#8b5cf6', // Violeta - 6ta mayor
      'b7': '#f59e0b', // Ámbar - 7ma menor
      '7': '#f59e0b', // Ámbar - 7ma mayor
    };

    const backgroundColor = intervalColors[interval] || '#6b7280';
    
    return {
      backgroundColor,
      color: '#ffffff',
      border: `2px solid ${backgroundColor}`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    };
  }, [highlightedNotes]);

  // Renderizar marcadores de trastes
  const renderFretMarkers = () => {
    const markerFrets = [3, 5, 7, 9, 12, 15];
    const doubleMarkerFrets = [12];
    
    return markerFrets.map(fret => (
      <div
        key={fret}
        className="fret-marker"
        style={{
          left: `${(fret - 0.5) * (100 / maxFrets)}%`,
        }}
      >
        {doubleMarkerFrets.includes(fret) && (
          <div className="double-marker" />
        )}
      </div>
    ));
  };

  // Renderizar una cuerda
  const renderString = (stringIndex: number) => {
    const notes = [];
    
    // Nota al aire
    const openNote = calculateNote(stringIndex, 0);
    notes.push(
      <motion.div
        key={`${stringIndex}-0`}
        className={`open-string-marker ${getNoteClass(openNote)}`}
        style={getNoteStyle(openNote)}
        onClick={() => handleNoteClick(openNote)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: stringIndex * 0.1 }}
      >
        {showIntervals && highlightedNotes.get(openNote.id) 
          ? highlightedNotes.get(openNote.id)
          : openNote.name
        }
      </motion.div>
    );

    // Notas en trastes
    for (let fret = 1; fret <= maxFrets; fret++) {
      const note = calculateNote(stringIndex, fret);
      notes.push(
        <motion.div
          key={note.id}
          className={getNoteClass(note)}
          style={{
            left: `${(fret - 0.5) * (100 / maxFrets)}%`,
            ...getNoteStyle(note)
          }}
          onClick={() => handleNoteClick(note)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: (stringIndex * 0.1) + (fret * 0.02) }}
        >
          {showIntervals && highlightedNotes.get(note.id) 
            ? highlightedNotes.get(note.id)
            : note.name
          }
        </motion.div>
      );
    }

    return (
      <div
        key={stringIndex}
        className="string"
        style={{
          top: `${((stringIndex + 0.5) / tuning.length) * 100}%`
        }}
      >
        <div className="string-line" />
        {notes}
      </div>
    );
  };

  // Renderizar números de trastes
  const renderFretNumbers = () => {
    const numbers = [];
    for (let fret = 1; fret <= maxFrets; fret++) {
      numbers.push(
        <div
          key={fret}
          className="fret-number"
          style={{
            left: `${(fret - 0.5) * (100 / maxFrets)}%`
          }}
        >
          {fret}
        </div>
      );
    }
    return numbers;
  };

  return (
    <div className={`fretboard-container ${leftHanded ? 'left-handed' : ''}`}>
      <div
        ref={fretboardRef}
        className="fretboard"
        style={{
          background: 'linear-gradient(to bottom, #f3e9d2 0%, #e8dcc0 100%)',
          border: '3px solid #c6ac8f',
          borderRadius: '8px',
          position: 'relative',
          width: '100%',
          height: '320px',
          overflow: 'hidden'
        }}
      >
        {/* Líneas de trastes */}
        {Array.from({ length: maxFrets }, (_, i) => (
          <div
            key={i}
            className="fret-line"
            style={{
              position: 'absolute',
              left: `${((i + 1) * 100) / maxFrets}%`,
              top: 0,
              bottom: 0,
              width: '2px',
              backgroundColor: '#a89a85',
              zIndex: 1
            }}
          />
        ))}

        {/* Marcadores de posición */}
        {renderFretMarkers()}

        {/* Cuerdas y notas */}
        {tuning.map((_, index) => renderString(index))}

        {/* Números de trastes */}
        <div className="fret-numbers">
          {renderFretNumbers()}
        </div>

        {/* Cejilla (nut) */}
        <div
          className="nut"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            backgroundColor: '#5c4033',
            zIndex: 2
          }}
        />
      </div>
    </div>
  );
};

export default Fretboard;