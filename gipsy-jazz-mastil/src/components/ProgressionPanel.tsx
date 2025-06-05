import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, RotateCcw, Plus, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface Chord {
  symbol: string;
  numeral: string;
  function: string;
  duration: number;
}

interface Progression {
  name: string;
  description: string;
  chords: Chord[];
  key: string;
  tempo: number;
  style: string;
}

interface ProgressionPanelProps {
  progressions: Record<string, Progression>;
  onChordSelect?: (chord: string) => void;
  onProgressionPlay?: (progression: Progression) => void;
}

const ProgressionPanel: React.FC<ProgressionPanelProps> = ({
  progressions,
  onChordSelect,
  onProgressionPlay
}) => {
  const [selectedProgression, setSelectedProgression] = useState<string>('');
  const [currentProgression, setCurrentProgression] = useState<Progression | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [tempo, setTempo] = useState(120);
  const [customChords, setCustomChords] = useState<Chord[]>([]);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [metronomeEnabled, setMetronomeEnabled] = useState(true);

  // Efecto para manejar la reproducción
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentProgression) {
      const beatInterval = (60 / tempo) * 1000; // Convertir BPM a milisegundos
      
      interval = setInterval(() => {
        setCurrentBeat(prev => {
          const chord = currentProgression.chords[currentChordIndex];
          const newBeat = prev + 1;
          
          // Si completamos la duración del acorde actual
          if (newBeat >= chord.duration) {
            const nextChordIndex = (currentChordIndex + 1) % currentProgression.chords.length;
            setCurrentChordIndex(nextChordIndex);
            
            // Notificar cambio de acorde
            if (onChordSelect) {
              onChordSelect(currentProgression.chords[nextChordIndex].symbol);
            }
            
            return 0;
          }
          
          return newBeat;
        });
      }, beatInterval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentProgression, currentChordIndex, tempo, onChordSelect]);

  // Cargar progresión seleccionada
  const loadProgression = useCallback((progressionKey: string) => {
    const progression = progressions[progressionKey];
    if (progression) {
      setCurrentProgression(progression);
      setTempo(progression.tempo);
      setCurrentChordIndex(0);
      setCurrentBeat(0);
      setIsPlaying(false);
    }
  }, [progressions]);

  // Controles de reproducción
  const handlePlay = () => {
    if (currentProgression) {
      setIsPlaying(true);
      if (onProgressionPlay) {
        onProgressionPlay(currentProgression);
      }
      // Seleccionar el primer acorde
      if (onChordSelect) {
        onChordSelect(currentProgression.chords[currentChordIndex].symbol);
      }
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentChordIndex(0);
    setCurrentBeat(0);
  };

  const handleReset = () => {
    handleStop();
    if (currentProgression && onChordSelect) {
      onChordSelect(currentProgression.chords[0].symbol);
    }
  };

  // Seleccionar acorde manualmente
  const selectChord = (index: number) => {
    if (currentProgression) {
      setCurrentChordIndex(index);
      setCurrentBeat(0);
      if (onChordSelect) {
        onChordSelect(currentProgression.chords[index].symbol);
      }
    }
  };

  // Renderizar selector de progresiones
  const renderProgressionSelector = () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select value={selectedProgression} onValueChange={(value) => {
          setSelectedProgression(value);
          loadProgression(value);
        }}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Selecciona una progresión..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(progressions).map(([key, progression]) => (
              <SelectItem key={key} value={key}>
                {progression.name} - {progression.key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowCustomBuilder(!showCustomBuilder)}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {currentProgression && (
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm font-medium text-amber-800">{currentProgression.name}</p>
          <p className="text-xs text-amber-700 mt-1">{currentProgression.description}</p>
          <div className="flex gap-4 mt-2 text-xs text-amber-600">
            <span>Tonalidad: {currentProgression.key}</span>
            <span>Estilo: {currentProgression.style}</span>
          </div>
        </div>
      )}
    </div>
  );

  // Renderizar controles de reproducción
  const renderPlaybackControls = () => (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center">
        <Button
          onClick={handlePlay}
          disabled={!currentProgression || isPlaying}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          <Play className="h-4 w-4 mr-1" />
          Play
        </Button>
        <Button
          onClick={handlePause}
          disabled={!isPlaying}
          size="sm"
          variant="outline"
        >
          <Pause className="h-4 w-4 mr-1" />
          Pause
        </Button>
        <Button
          onClick={handleStop}
          disabled={!currentProgression}
          size="sm"
          variant="outline"
        >
          <Square className="h-4 w-4 mr-1" />
          Stop
        </Button>
        <Button
          onClick={handleReset}
          disabled={!currentProgression}
          size="sm"
          variant="outline"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Tempo: {tempo} BPM</label>
          <Badge variant="secondary" className="text-xs">
            {isPlaying ? 'Reproduciendo' : 'Pausado'}
          </Badge>
        </div>
        <Slider
          value={[tempo]}
          onValueChange={(value) => setTempo(value[0])}
          min={60}
          max={200}
          step={5}
          className="w-full"
        />
      </div>
    </div>
  );

  // Renderizar progresión visual
  const renderProgressionChart = () => {
    if (!currentProgression) return null;

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Secuencia de Acordes</h4>
        <div className="grid grid-cols-2 gap-2">
          {currentProgression.chords.map((chord, index) => (
            <motion.div
              key={index}
              className={`
                p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${index === currentChordIndex 
                  ? 'border-amber-500 bg-amber-100 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
              onClick={() => selectChord(index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-lg text-gray-800">{chord.symbol}</div>
                  <div className="text-xs text-gray-600">{chord.numeral}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">{chord.duration} beats</div>
                  <div className="text-xs text-gray-400">{chord.function}</div>
                </div>
              </div>
              
              {/* Indicador de progreso */}
              {index === currentChordIndex && isPlaying && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <motion.div
                      className="bg-amber-500 h-1 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${(currentBeat / chord.duration) * 100}%` 
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar metrónomo visual
  const renderMetronome = () => {
    if (!metronomeEnabled || !isPlaying) return null;

    return (
      <div className="flex justify-center items-center space-x-2 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm font-medium text-gray-600">Metrónomo:</div>
        {Array.from({ length: 4 }, (_, i) => (
          <motion.div
            key={i}
            className={`
              w-3 h-3 rounded-full border-2
              ${(currentBeat % 4) === i 
                ? 'bg-amber-500 border-amber-600' 
                : 'bg-gray-200 border-gray-300'
              }
            `}
            animate={{
              scale: (currentBeat % 4) === i ? 1.2 : 1,
            }}
            transition={{ duration: 0.1 }}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <Settings className="h-5 w-5" />
          Panel de Progresiones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selector de progresiones */}
        {renderProgressionSelector()}
        
        {/* Controles de reproducción */}
        {renderPlaybackControls()}
        
        {/* Metrónomo visual */}
        {renderMetronome()}
        
        {/* Progresión visual */}
        <AnimatePresence>
          {currentProgression && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderProgressionChart()}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default ProgressionPanel;