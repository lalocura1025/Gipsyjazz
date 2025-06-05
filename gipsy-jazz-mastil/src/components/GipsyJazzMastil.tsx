import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Music, 
  Settings, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Palette,
  Moon,
  Sun
} from 'lucide-react';

import Fretboard from './Fretboard';
import ProgressionPanel from './ProgressionPanel';
import VoicingLibrary from './VoicingLibrary';
import VoiceLeadingAnalyzer from './VoiceLeadingAnalyzer';
import TrainingMode from './TrainingMode';

import '../styles/fretboard.css';

interface GipsyJazzMastilProps {
  className?: string;
}

const TUNINGS = {
  'Standard': ['E', 'A', 'D', 'G', 'B', 'E'],
  'Drop D': ['D', 'A', 'D', 'G', 'B', 'E'],
  'DADGAD': ['D', 'A', 'D', 'G', 'A', 'D'],
  'Open G': ['D', 'G', 'D', 'G', 'B', 'D']
};

const GipsyJazzMastil: React.FC<GipsyJazzMastilProps> = ({ className }) => {
  // Estados principales
  const [highlightedNotes, setHighlightedNotes] = useState<Map<string, string>>(new Map());
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [currentTuning, setCurrentTuning] = useState<string>('Standard');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [leftHanded, setLeftHanded] = useState(false);
  const [showIntervals, setShowIntervals] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('fretboard');

  // Estados para datos
  const [scales, setScales] = useState<any>({});
  const [voicings, setVoicings] = useState<any>({});
  const [progressions, setProgressions] = useState<any>({});
  const [exercises, setExercises] = useState<any>({});

  // Estados para funcionalidades avanzadas
  const [currentProgression, setCurrentProgression] = useState<any>(null);
  const [selectedVoicings, setSelectedVoicings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentPattern, setCurrentPattern] = useState<any>(null);

  // Estados para voice leading
  const [voicing1, setVoicing1] = useState<any>(null);
  const [voicing2, setVoicing2] = useState<any>(null);

  // Cargar datos al inicializar
  useEffect(() => {
    const loadData = async () => {
      try {
        const [scalesRes, voicingsRes, progressionsRes, exercisesRes] = await Promise.all([
          fetch('/data/gipsy-scales.json'),
          fetch('/data/gipsy-voicings.json'),
          fetch('/data/gipsy-progressions.json'),
          fetch('/data/training-exercises.json')
        ]);

        const [scalesData, voicingsData, progressionsData, exercisesData] = await Promise.all([
          scalesRes.json(),
          voicingsRes.json(),
          progressionsRes.json(),
          exercisesRes.json()
        ]);

        setScales(scalesData);
        setVoicings(voicingsData);
        setProgressions(progressionsData);
        setExercises(exercisesData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };

    loadData();
  }, []);

  // Función para calcular notas de una escala
  const calculateScaleNotes = useCallback((scaleIntervals: string[], rootNote: string) => {
    const noteValues = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootValue = noteValues.indexOf(rootNote);
    const scaleNotes = new Map<string, string>();

    // Mapeo de intervalos a semitonos
    const intervalMap: Record<string, number> = {
      '1': 0, 'b2': 1, '2': 2, 'b3': 3, '3': 4, '4': 5,
      'b5': 6, '5': 7, '#5': 8, 'b6': 8, '6': 9, 'b7': 10, '7': 11
    };

    scaleIntervals.forEach(interval => {
      const semitones = intervalMap[interval];
      if (semitones !== undefined) {
        const noteValue = (rootValue + semitones) % 12;
        const noteName = noteValues[noteValue];
        scaleNotes.set(noteName, interval);
      }
    });

    return scaleNotes;
  }, []);

  // Función para mostrar patrón en el diapasón
  const showPattern = useCallback((pattern: any) => {
    if (!pattern) return;

    let notes = new Map<string, string>();

    if (pattern.type === 'scale' && scales[pattern.name]) {
      notes = calculateScaleNotes(scales[pattern.name].intervals, pattern.root || 'C');
    } else if (pattern.type === 'voicing' && voicings[pattern.name]) {
      const voicing = voicings[pattern.name];
      const position = voicing.positions[pattern.position || 0];
      if (position) {
        position.notes.forEach((note: string, index: number) => {
          if (note !== 'x') {
            notes.set(note, position.intervals[index]);
          }
        });
      }
    }

    setHighlightedNotes(notes);
    setCurrentPattern(pattern);
  }, [scales, voicings, calculateScaleNotes]);

  // Manejar click en nota del diapasón
  const handleNoteClick = useCallback((note: any) => {
    const newSelected = new Set(selectedNotes);
    
    if (newSelected.has(note.id)) {
      newSelected.delete(note.id);
    } else {
      newSelected.add(note.id);
    }
    
    setSelectedNotes(newSelected);
  }, [selectedNotes]);

  // Manejar selección de acorde en progresión
  const handleChordSelect = useCallback((chordSymbol: string) => {
    // Buscar el voicing correspondiente y mostrarlo
    // Esto es una simplificación, en una implementación real
    // tendríamos un mapeo más complejo de símbolos a voicings
    console.log('Acorde seleccionado:', chordSymbol);
  }, []);

  // Manejar selección de voicing
  const handleVoicingSelect = useCallback((voicingKey: string, positionIndex: number) => {
    const voicing = voicings[voicingKey];
    if (voicing && voicing.positions[positionIndex]) {
      const position = voicing.positions[positionIndex];
      showPattern({
        type: 'voicing',
        name: voicingKey,
        position: positionIndex
      });

      // Configurar para análisis de voice leading
      if (!voicing1) {
        setVoicing1({
          name: position.name,
          notes: position.notes,
          frets: position.frets,
          intervals: position.intervals
        });
      } else if (!voicing2) {
        setVoicing2({
          name: position.name,
          notes: position.notes,
          frets: position.frets,
          intervals: position.intervals
        });
      } else {
        // Rotar: voicing2 -> voicing1, nuevo -> voicing2
        setVoicing1(voicing2);
        setVoicing2({
          name: position.name,
          notes: position.notes,
          frets: position.frets,
          intervals: position.intervals
        });
      }
    }
  }, [voicings, voicing1, voicing2, showPattern]);

  // Alternar favoritos
  const toggleFavorite = useCallback((voicingId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(voicingId)) {
      newFavorites.delete(voicingId);
    } else {
      newFavorites.add(voicingId);
    }
    setFavorites(newFavorites);
  }, [favorites]);

  // Limpiar visualización
  const clearVisualization = useCallback(() => {
    setHighlightedNotes(new Map());
    setSelectedNotes(new Set());
    setCurrentPattern(null);
  }, []);

  // Resetear análisis de voice leading
  const resetVoiceLeading = useCallback(() => {
    setVoicing1(null);
    setVoicing2(null);
  }, []);

  // Renderizar controles principales
  const renderMainControls = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="h-6 w-6 text-amber-600" />
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Gipsy Jazz Mástil Pro
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Afinación */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Afinación</label>
            <Select value={currentTuning} onValueChange={setCurrentTuning}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(TUNINGS).map(tuning => (
                  <SelectItem key={tuning} value={tuning}>
                    {tuning}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Audio */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Audio</label>
            <div className="flex items-center gap-2">
              <Switch
                checked={audioEnabled}
                onCheckedChange={setAudioEnabled}
              />
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </div>
          </div>

          {/* Modo zurdo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Zurdo</label>
            <Switch
              checked={leftHanded}
              onCheckedChange={setLeftHanded}
            />
          </div>

          {/* Mostrar intervalos */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Intervalos</label>
            <Switch
              checked={showIntervals}
              onCheckedChange={setShowIntervals}
            />
          </div>
        </div>

        {/* Controles de acción */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            onClick={clearVisualization}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar
          </Button>
          
          {currentPattern && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Settings className="h-3 w-3" />
              {currentPattern.name} - {currentPattern.root || 'C'}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Calcular tuning actual
  const currentTuningArray = useMemo(() => 
    TUNINGS[currentTuning as keyof typeof TUNINGS] || TUNINGS.Standard
  , [currentTuning]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 ${className || ''}`}>
      <div className="container mx-auto max-w-7xl">
        {/* Controles principales */}
        {renderMainControls()}

        {/* Diapasón principal */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <Fretboard
              tuning={currentTuningArray}
              maxFrets={15}
              highlightedNotes={highlightedNotes}
              selectedNotes={selectedNotes}
              onNoteClick={handleNoteClick}
              audioEnabled={audioEnabled}
              leftHanded={leftHanded}
              showIntervals={showIntervals}
            />
          </CardContent>
        </Card>

        {/* Pestañas principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-amber-100">
            <TabsTrigger value="progressions" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              Progresiones
            </TabsTrigger>
            <TabsTrigger value="voicings" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              Voicings
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              Voice Leading
            </TabsTrigger>
            <TabsTrigger value="training" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              Entrenamiento
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="progressions" className="space-y-6">
                <ProgressionPanel
                  progressions={progressions}
                  onChordSelect={handleChordSelect}
                />
              </TabsContent>

              <TabsContent value="voicings" className="space-y-6">
                <VoicingLibrary
                  voicings={voicings}
                  onVoicingSelect={handleVoicingSelect}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-amber-800">
                    Análisis de Voice Leading
                  </h2>
                  <Button
                    variant="outline"
                    onClick={resetVoiceLeading}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
                <VoiceLeadingAnalyzer
                  voicing1={voicing1}
                  voicing2={voicing2}
                />
              </TabsContent>

              <TabsContent value="training" className="space-y-6">
                <TrainingMode
                  exercises={exercises}
                  onShowPattern={showPattern}
                />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
};

export default GipsyJazzMastil;