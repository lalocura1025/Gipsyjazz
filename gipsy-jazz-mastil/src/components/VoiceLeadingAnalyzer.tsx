import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, TrendingUp, TrendingDown, Minus, RotateCcw, Target, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface VoiceMovement {
  from: string;
  to: string;
  direction: 'up' | 'down' | 'same';
  semitones: number;
  commonTone: boolean;
}

interface VoiceLeadingAnalysis {
  movements: VoiceMovement[];
  smoothness: number;
  commonTones: number;
  maxMovement: number;
  recommendations: string[];
}

interface Voicing {
  name: string;
  notes: string[];
  frets: (number | string)[];
  intervals: string[];
}

interface VoiceLeadingAnalyzerProps {
  voicing1?: Voicing;
  voicing2?: Voicing;
  onOptimize?: (optimizedVoicing: Voicing) => void;
  showAnalysis?: boolean;
}

const VoiceLeadingAnalyzer: React.FC<VoiceLeadingAnalyzerProps> = ({
  voicing1,
  voicing2,
  onOptimize,
  showAnalysis = true
}) => {
  const [analysis, setAnalysis] = useState<VoiceLeadingAnalysis | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [animateConnections, setAnimateConnections] = useState(false);

  // Función para calcular la distancia en semitonos entre notas
  const getNoteValue = (note: string): number => {
    const noteMap: Record<string, number> = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8,
      'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };
    return noteMap[note.replace(/[0-9]/g, '')] || 0;
  };

  // Calcular movimiento de voces
  const calculateVoiceMovement = (note1: string, note2: string): VoiceMovement => {
    if (note1 === 'x' || note2 === 'x') {
      return {
        from: note1,
        to: note2,
        direction: 'same',
        semitones: 0,
        commonTone: false
      };
    }

    const value1 = getNoteValue(note1);
    const value2 = getNoteValue(note2);
    
    // Calcular la diferencia más corta considerando el círculo cromático
    let semitones = value2 - value1;
    if (semitones > 6) semitones -= 12;
    if (semitones < -6) semitones += 12;

    return {
      from: note1,
      to: note2,
      direction: semitones > 0 ? 'up' : semitones < 0 ? 'down' : 'same',
      semitones: Math.abs(semitones),
      commonTone: semitones === 0 && note1 !== 'x' && note2 !== 'x'
    };
  };

  // Analizar voice leading
  const analyzeVoiceLeading = useMemo((): VoiceLeadingAnalysis | null => {
    if (!voicing1 || !voicing2) return null;

    const movements: VoiceMovement[] = [];
    let commonTones = 0;
    let totalMovement = 0;
    let maxMovement = 0;

    // Analizar cada voz (string)
    for (let i = 0; i < Math.min(voicing1.notes.length, voicing2.notes.length); i++) {
      const movement = calculateVoiceMovement(voicing1.notes[i], voicing2.notes[i]);
      movements.push(movement);

      if (movement.commonTone) {
        commonTones++;
      } else if (movement.from !== 'x' && movement.to !== 'x') {
        totalMovement += movement.semitones;
        maxMovement = Math.max(maxMovement, movement.semitones);
      }
    }

    // Calcular smoothness (0-100, donde 100 es más suave)
    const activeVoices = movements.filter(m => m.from !== 'x' && m.to !== 'x').length;
    const averageMovement = activeVoices > 0 ? totalMovement / activeVoices : 0;
    const smoothness = Math.max(0, 100 - (averageMovement * 10) - (maxMovement * 5));

    // Generar recomendaciones
    const recommendations: string[] = [];
    
    if (commonTones === 0) {
      recommendations.push("Considera mantener al menos una nota común entre los acordes");
    }
    if (maxMovement > 4) {
      recommendations.push("Hay saltos grandes que podrían ser más suaves");
    }
    if (averageMovement > 3) {
      recommendations.push("El voice leading podría ser más eficiente con menos movimiento general");
    }
    if (smoothness > 80) {
      recommendations.push("¡Excelente voice leading! Muy suave y eficiente");
    }

    return {
      movements,
      smoothness,
      commonTones,
      maxMovement,
      recommendations
    };
  }, [voicing1, voicing2]);

  useEffect(() => {
    setAnalysis(analyzeVoiceLeading);
  }, [analyzeVoiceLeading]);

  // Renderizar conexión visual entre voicings
  const renderVoiceConnection = () => {
    if (!voicing1 || !voicing2 || !analysis) return null;

    return (
      <div className="relative">
        <div className="flex items-center gap-8">
          {/* Voicing 1 */}
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">{voicing1.name}</h4>
            <div className="space-y-2">
              {voicing1.notes.map((note, index) => (
                <motion.div
                  key={`v1-${index}`}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium text-center
                    ${note === 'x' 
                      ? 'bg-gray-200 text-gray-500' 
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }
                  `}
                  animate={animateConnections ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ delay: index * 0.1 }}
                >
                  {note === 'x' ? '×' : `${note} (${voicing1.intervals[index]})`}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Conexiones visuales */}
          <div className="flex flex-col items-center gap-2 min-w-[120px]">
            <ArrowRight className="h-6 w-6 text-gray-400" />
            {analysis.movements.map((movement, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-1"
                animate={animateConnections ? { opacity: [0.5, 1, 0.5] } : {}}
                transition={{ delay: index * 0.1, repeat: Infinity, duration: 2 }}
              >
                {movement.from !== 'x' && movement.to !== 'x' && (
                  <>
                    {movement.direction === 'up' && (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                    {movement.direction === 'down' && (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    {movement.direction === 'same' && (
                      <Minus className="h-4 w-4 text-blue-500" />
                    )}
                    <span className="text-xs text-gray-600">
                      {movement.commonTone ? '=' : `${movement.semitones}st`}
                    </span>
                  </>
                )}
              </motion.div>
            ))}
          </div>

          {/* Voicing 2 */}
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">{voicing2.name}</h4>
            <div className="space-y-2">
              {voicing2.notes.map((note, index) => (
                <motion.div
                  key={`v2-${index}`}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium text-center
                    ${note === 'x' 
                      ? 'bg-gray-200 text-gray-500' 
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }
                  `}
                  animate={animateConnections ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  {note === 'x' ? '×' : `${note} (${voicing2.intervals[index]})`}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar métricas de análisis
  const renderAnalysisMetrics = () => {
    if (!analysis) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Smoothness */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Suavidad</span>
              <Badge variant={analysis.smoothness > 70 ? "default" : analysis.smoothness > 40 ? "secondary" : "destructive"}>
                {Math.round(analysis.smoothness)}%
              </Badge>
            </div>
            <Progress value={analysis.smoothness} className="mb-2" />
            <p className="text-xs text-gray-500">
              {analysis.smoothness > 70 
                ? 'Voice leading muy suave' 
                : analysis.smoothness > 40 
                ? 'Voice leading moderado' 
                : 'Voice leading áspero'
              }
            </p>
          </CardContent>
        </Card>

        {/* Notas comunes */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Notas Comunes</span>
              <Badge variant="outline">
                {analysis.commonTones}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-amber-600 mb-1">
              {analysis.commonTones}
            </div>
            <p className="text-xs text-gray-500">
              Notas que se mantienen
            </p>
          </CardContent>
        </Card>

        {/* Movimiento máximo */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Max Movimiento</span>
              <Badge variant={analysis.maxMovement <= 2 ? "default" : analysis.maxMovement <= 4 ? "secondary" : "destructive"}>
                {analysis.maxMovement} st
              </Badge>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {analysis.maxMovement}
            </div>
            <p className="text-xs text-gray-500">
              Semitonos máximos
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Renderizar recomendaciones
  const renderRecommendations = () => {
    if (!analysis || !showRecommendations) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg"
              >
                <Target className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{rec}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!voicing1 || !voicing2) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Selecciona dos voicings para analizar el voice leading</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-600" />
              Analizador de Voice Leading
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAnimateConnections(!animateConnections)}
              >
                {animateConnections ? 'Detener Animación' : 'Animar Conexiones'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRecommendations(!showRecommendations)}
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                Consejos
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderVoiceConnection()}
        </CardContent>
      </Card>

      {/* Métricas de análisis */}
      {showAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {renderAnalysisMetrics()}
        </motion.div>
      )}

      {/* Recomendaciones */}
      <AnimatePresence>
        {renderRecommendations()}
      </AnimatePresence>
    </div>
  );
};

export default VoiceLeadingAnalyzer;