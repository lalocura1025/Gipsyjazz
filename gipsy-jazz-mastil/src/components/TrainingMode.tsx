import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Target,
  Trophy,
  Clock,
  Star,
  BookOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Exercise {
  id: string;
  question: string;
  voicing?: string;
  position?: number;
  scale?: string;
  root?: string;
  progression?: string;
  options?: string[];
  correct?: number;
  pattern?: number[];
  explanation: string;
}

interface ExerciseCategory {
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: Exercise[];
}

interface TrainingSession {
  startTime: number;
  currentExerciseIndex: number;
  correctAnswers: number;
  totalAnswers: number;
  timeSpent: number;
}

interface TrainingModeProps {
  exercises: Record<string, ExerciseCategory>;
  onExerciseStart?: (exercise: Exercise) => void;
  onExerciseComplete?: (exercise: Exercise, correct: boolean) => void;
  onShowPattern?: (pattern: any) => void;
}

const TrainingMode: React.FC<TrainingModeProps> = ({
  exercises,
  onExerciseStart,
  onExerciseComplete,
  onShowPattern
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentCategory, setCurrentCategory] = useState<ExerciseCategory | null>(null);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    averageScore: 0,
    bestStreak: 0,
    currentStreak: 0
  });

  // Inicializar sesión de entrenamiento
  const startSession = useCallback((categoryKey: string) => {
    const category = exercises[categoryKey];
    if (!category) return;

    setCurrentCategory(category);
    setCurrentExercise(category.exercises[0]);
    setSession({
      startTime: Date.now(),
      currentExerciseIndex: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      timeSpent: 0
    });
    setSelectedAnswer(null);
    setShowResult(false);
    setShowExplanation(false);

    // Notificar inicio del ejercicio
    if (onExerciseStart) {
      onExerciseStart(category.exercises[0]);
    }
  }, [exercises, onExerciseStart]);

  // Verificar respuesta
  const checkAnswer = useCallback(() => {
    if (!currentExercise || !session || selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentExercise.correct;
    setShowResult(true);

    // Actualizar sesión
    setSession(prev => ({
      ...prev!,
      totalAnswers: prev!.totalAnswers + 1,
      correctAnswers: prev!.correctAnswers + (isCorrect ? 1 : 0),
      timeSpent: Date.now() - prev!.startTime
    }));

    // Actualizar racha
    setSessionStats(prev => ({
      ...prev,
      currentStreak: isCorrect ? prev.currentStreak + 1 : 0,
      bestStreak: isCorrect ? Math.max(prev.bestStreak, prev.currentStreak + 1) : prev.bestStreak
    }));

    // Notificar resultado
    if (onExerciseComplete) {
      onExerciseComplete(currentExercise, isCorrect);
    }
  }, [currentExercise, session, selectedAnswer, onExerciseComplete]);

  // Siguiente ejercicio
  const nextExercise = useCallback(() => {
    if (!currentCategory || !session) return;

    const nextIndex = session.currentExerciseIndex + 1;
    
    if (nextIndex < currentCategory.exercises.length) {
      const nextEx = currentCategory.exercises[nextIndex];
      setCurrentExercise(nextEx);
      setSession(prev => ({
        ...prev!,
        currentExerciseIndex: nextIndex
      }));
      setSelectedAnswer(null);
      setShowResult(false);
      setShowExplanation(false);

      if (onExerciseStart) {
        onExerciseStart(nextEx);
      }
    } else {
      // Sesión completada
      finishSession();
    }
  }, [currentCategory, session, onExerciseStart]);

  // Finalizar sesión
  const finishSession = useCallback(() => {
    if (!session) return;

    const score = (session.correctAnswers / session.totalAnswers) * 100;
    
    setSessionStats(prev => ({
      ...prev,
      totalSessions: prev.totalSessions + 1,
      averageScore: ((prev.averageScore * prev.totalSessions) + score) / (prev.totalSessions + 1)
    }));

    // Resetear estado
    setCurrentCategory(null);
    setCurrentExercise(null);
    setSession(null);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowExplanation(false);
  }, [session]);

  // Reiniciar ejercicio actual
  const restartExercise = useCallback(() => {
    setSelectedAnswer(null);
    setShowResult(false);
    setShowExplanation(false);
  }, []);

  // Mostrar patrón/voicing del ejercicio
  const showExercisePattern = useCallback(() => {
    if (!currentExercise || !onShowPattern) return;

    const pattern = {
      type: currentExercise.voicing ? 'voicing' : currentExercise.scale ? 'scale' : 'progression',
      name: currentExercise.voicing || currentExercise.scale || currentExercise.progression,
      root: currentExercise.root || 'C',
      position: currentExercise.position || 0
    };

    onShowPattern(pattern);
  }, [currentExercise, onShowPattern]);

  // Renderizar selector de categoría
  const renderCategorySelector = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <Brain className="h-5 w-5" />
          Modo Entrenamiento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una categoría de ejercicios..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(exercises).map(([key, category]) => (
              <SelectItem key={key} value={key}>
                {category.name} - {category.exercises.length} ejercicios
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedCategory && exercises[selectedCategory] && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-amber-50 rounded-lg border border-amber-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-amber-600" />
              <span className="font-semibold text-amber-800">
                {exercises[selectedCategory].name}
              </span>
              <Badge variant={exercises[selectedCategory].difficulty === 'beginner' ? 'default' : 
                              exercises[selectedCategory].difficulty === 'intermediate' ? 'secondary' : 'destructive'}>
                {exercises[selectedCategory].difficulty}
              </Badge>
            </div>
            <p className="text-sm text-amber-700 mb-3">
              {exercises[selectedCategory].description}
            </p>
            <Button onClick={() => startSession(selectedCategory)} className="w-full">
              Comenzar Entrenamiento
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );

  // Renderizar estadísticas de sesión
  const renderSessionStats = () => {
    if (!session) return null;

    const progressPercent = currentCategory 
      ? ((session.currentExerciseIndex + 1) / currentCategory.exercises.length) * 100
      : 0;
    
    const accuracy = session.totalAnswers > 0 
      ? (session.correctAnswers / session.totalAnswers) * 100
      : 0;

    return (
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {session.currentExerciseIndex + 1}
              </div>
              <div className="text-xs text-gray-500">Ejercicio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(accuracy)}%
              </div>
              <div className="text-xs text-gray-500">Precisión</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {sessionStats.currentStreak}
              </div>
              <div className="text-xs text-gray-500">Racha</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.floor(session.timeSpent / 60000)}m
              </div>
              <div className="text-xs text-gray-500">Tiempo</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progreso</span>
              <span>{session.currentExerciseIndex + 1} / {currentCategory?.exercises.length}</span>
            </div>
            <Progress value={progressPercent} />
          </div>
        </CardContent>
      </Card>
    );
  };

  // Renderizar ejercicio actual
  const renderCurrentExercise = () => {
    if (!currentExercise || !session) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-600" />
              Ejercicio {session.currentExerciseIndex + 1}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={showExercisePattern}
                disabled={!onShowPattern}
              >
                <Play className="h-4 w-4 mr-1" />
                Mostrar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={restartExercise}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pregunta */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-lg font-medium text-gray-800">
              {currentExercise.question}
            </p>
          </div>

          {/* Opciones de respuesta */}
          {currentExercise.options && (
            <div className="space-y-2">
              {currentExercise.options.map((option, index) => (
                <motion.button
                  key={index}
                  className={`
                    w-full p-3 text-left rounded-lg border-2 transition-all
                    ${selectedAnswer === index 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                    ${showResult && index === currentExercise.correct
                      ? 'border-green-500 bg-green-50'
                      : ''
                    }
                    ${showResult && selectedAnswer === index && index !== currentExercise.correct
                      ? 'border-red-500 bg-red-50'
                      : ''
                    }
                  `}
                  onClick={() => !showResult && setSelectedAnswer(index)}
                  disabled={showResult}
                  whileHover={{ scale: showResult ? 1 : 1.02 }}
                  whileTap={{ scale: showResult ? 1 : 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showResult && index === currentExercise.correct && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {showResult && selectedAnswer === index && index !== currentExercise.correct && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Controles */}
          <div className="flex gap-2 justify-center">
            {!showResult && selectedAnswer !== null && (
              <Button onClick={checkAnswer}>
                Verificar Respuesta
              </Button>
            )}
            
            {showResult && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowExplanation(!showExplanation)}
                >
                  {showExplanation ? 'Ocultar' : 'Ver'} Explicación
                </Button>
                <Button onClick={nextExercise}>
                  <SkipForward className="h-4 w-4 mr-1" />
                  Siguiente
                </Button>
              </div>
            )}
          </div>

          {/* Explicación */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex items-start gap-2">
                  <Star className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">Explicación</h4>
                    <p className="text-sm text-blue-700">{currentExercise.explanation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    );
  };

  // Renderizar estadísticas generales
  const renderGeneralStats = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Estadísticas Generales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">
              {sessionStats.totalSessions}
            </div>
            <div className="text-sm text-gray-500">Sesiones</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">
              {Math.round(sessionStats.averageScore)}%
            </div>
            <div className="text-sm text-gray-500">Promedio</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-amber-600">
              {sessionStats.bestStreak}
            </div>
            <div className="text-sm text-gray-500">Mejor Racha</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">
              {sessionStats.currentStreak}
            </div>
            <div className="text-sm text-gray-500">Racha Actual</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Selector de categoría o sesión activa */}
      {!session ? renderCategorySelector() : renderSessionStats()}
      
      {/* Ejercicio actual */}
      {session && renderCurrentExercise()}
      
      {/* Estadísticas generales */}
      {!session && renderGeneralStats()}
    </div>
  );
};

export default TrainingMode;