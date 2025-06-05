import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Music, Info, Star, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VoicingPosition {
  name: string;
  frets: (number | string)[];
  fingers: (number | string)[];
  notes: string[];
  intervals: string[];
}

interface VoicingGroup {
  name: string;
  description: string;
  positions: VoicingPosition[];
}

interface VoicingLibraryProps {
  voicings: Record<string, VoicingGroup>;
  onVoicingSelect?: (voicingKey: string, positionIndex: number) => void;
  onCompareVoicing?: (voicingKey: string, positionIndex: number) => void;
  favorites?: Set<string>;
  onToggleFavorite?: (voicingId: string) => void;
}

const VoicingLibrary: React.FC<VoicingLibraryProps> = ({
  voicings,
  onVoicingSelect,
  onCompareVoicing,
  favorites = new Set(),
  onToggleFavorite
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [compareMode, setCompareMode] = useState(false);
  const [comparedVoicings, setComparedVoicings] = useState<Array<{key: string, position: number}>>([]);

  // Alternar expansión de grupos
  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  // Seleccionar voicing
  const handleVoicingSelect = (voicingKey: string, positionIndex: number) => {
    if (compareMode) {
      const voicingId = `${voicingKey}-${positionIndex}`;
      if (comparedVoicings.length < 3 && !comparedVoicings.some(v => `${v.key}-${v.position}` === voicingId)) {
        setComparedVoicings([...comparedVoicings, { key: voicingKey, position: positionIndex }]);
        if (onCompareVoicing) {
          onCompareVoicing(voicingKey, positionIndex);
        }
      }
    } else {
      if (onVoicingSelect) {
        onVoicingSelect(voicingKey, positionIndex);
      }
    }
  };

  // Renderizar digitación visual
  const renderFingering = (position: VoicingPosition) => {
    const maxFret = Math.max(...position.frets.filter(f => typeof f === 'number') as number[]);
    const minFret = Math.min(...position.frets.filter(f => typeof f === 'number') as number[]);
    const fretRange = Math.max(4, maxFret - minFret + 1);

    return (
      <div className="fingering-diagram p-3 bg-gradient-to-b from-amber-50 to-amber-100 rounded-lg">
        <div className="relative">
          {/* Strings */}
          {position.frets.map((fret, stringIndex) => (
            <div key={stringIndex} className="flex items-center mb-2 last:mb-0">
              {/* String line */}
              <div className="flex-1 h-0.5 bg-gray-400 relative mr-2">
                {/* Note marker */}
                {fret !== 'x' && (
                  <div
                    className="absolute w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold -top-2.5"
                    style={{
                      left: fret === 0 ? '-12px' : `${((fret as number - minFret) / fretRange) * 100}%`,
                      transform: fret === 0 ? 'none' : 'translateX(-50%)'
                    }}
                  >
                    {position.fingers[stringIndex] !== 'x' ? position.fingers[stringIndex] : ''}
                  </div>
                )}
                {fret === 'x' && (
                  <div className="absolute w-6 h-6 flex items-center justify-center text-red-500 text-lg font-bold -top-3 -left-3">
                    ×
                  </div>
                )}
              </div>
              {/* String info */}
              <div className="text-xs text-gray-600 w-16 text-right">
                <div className="font-semibold">{position.notes[stringIndex]}</div>
                <div className="text-gray-500">{position.intervals[stringIndex]}</div>
              </div>
            </div>
          ))}
          
          {/* Fret markers */}
          <div className="absolute top-0 left-0 right-16 bottom-0">
            {Array.from({ length: fretRange + 1 }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-0.5 bg-gray-300"
                style={{ left: `${(i / fretRange) * 100}%` }}
              />
            ))}
          </div>
        </div>
        
        {/* Fret numbers */}
        <div className="flex justify-between mt-2 text-xs text-gray-500 pr-16">
          {Array.from({ length: fretRange + 1 }, (_, i) => (
            <span key={i}>{minFret + i}</span>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar posición individual
  const renderPosition = (voicingKey: string, position: VoicingPosition, positionIndex: number) => {
    const voicingId = `${voicingKey}-${positionIndex}`;
    const isFavorite = favorites.has(voicingId);
    const isCompared = comparedVoicings.some(v => `${v.key}-${v.position}` === voicingId);

    return (
      <motion.div
        key={`${voicingKey}-${positionIndex}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`
          border rounded-lg p-4 cursor-pointer transition-all duration-200
          ${isCompared 
            ? 'border-blue-500 bg-blue-50 shadow-md' 
            : 'border-gray-200 hover:border-amber-300 hover:shadow-sm'
          }
        `}
        onClick={() => handleVoicingSelect(voicingKey, positionIndex)}
      >
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-semibold text-gray-800">{position.name}</h4>
          <div className="flex gap-1">
            {compareMode && isCompared && (
              <Badge variant="secondary" className="text-xs">Comparando</Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleFavorite) {
                  onToggleFavorite(voicingId);
                }
              }}
              className={`p-1 h-6 w-6 ${isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}
            >
              <Star className="h-3 w-3" fill={isFavorite ? 'currentColor' : 'none'} />
            </Button>
          </div>
        </div>
        
        {/* Digitación visual */}
        {renderFingering(position)}
        
        {/* Información adicional */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            {position.intervals.map((interval, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="text-xs"
                style={{
                  backgroundColor: getIntervalColor(interval),
                  borderColor: getIntervalColor(interval),
                  color: 'white'
                }}
              >
                {interval}
              </Badge>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  // Renderizar grupo de voicings
  const renderVoicingGroup = (voicingKey: string, group: VoicingGroup) => {
    const isExpanded = expandedGroups.has(voicingKey);
    
    return (
      <Card key={voicingKey} className="mb-4">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleGroup(voicingKey)}
        >
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <Music className="h-4 w-4 text-amber-600" />
              {group.name}
            </div>
            <Badge variant="secondary">{group.positions.length} posiciones</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">{group.description}</p>
        </CardHeader>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {group.positions.map((position, index) => 
                    renderPosition(voicingKey, position, index)
                  )}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    );
  };

  // Obtener color para intervalo
  const getIntervalColor = (interval: string): string => {
    const colors: Record<string, string> = {
      '1': '#ef4444',
      'b3': '#3b82f6',
      '3': '#3b82f6',
      '5': '#10b981',
      'b6': '#8b5cf6',
      '6': '#8b5cf6',
      'b7': '#f59e0b',
      '7': '#f59e0b',
      '4': '#6b7280',
      'b5': '#78716c'
    };
    return colors[interval] || '#6b7280';
  };

  // Filtrar voicings
  const filteredVoicings = Object.entries(voicings).filter(([key, group]) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'favorites') {
      return group.positions.some((_, idx) => favorites.has(`${key}-${idx}`));
    }
    return key.includes(selectedCategory);
  });

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Music className="h-5 w-5" />
            Biblioteca de Voicings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-2 flex-wrap">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar categoría..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los voicings</SelectItem>
                <SelectItem value="favorites">Favoritos</SelectItem>
                <SelectItem value="minor6">Menor 6ta</SelectItem>
                <SelectItem value="diminished7">Disminuido 7ma</SelectItem>
                <SelectItem value="dominant7">Dominante 7ma</SelectItem>
                <SelectItem value="major7">Mayor 7ma</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant={compareMode ? "default" : "outline"}
              onClick={() => {
                setCompareMode(!compareMode);
                if (!compareMode) {
                  setComparedVoicings([]);
                }
              }}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {compareMode ? 'Salir Comparación' : 'Modo Comparación'}
            </Button>
          </div>
          
          {/* Panel de comparación */}
          {compareMode && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Modo Comparación Activo ({comparedVoicings.length}/3)
                </span>
              </div>
              <p className="text-xs text-blue-700">
                Haz clic en los voicings que quieres comparar. Máximo 3 voicings.
              </p>
              {comparedVoicings.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setComparedVoicings([])}
                  className="mt-2"
                >
                  Limpiar Comparación
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de voicings */}
      <div>
        {filteredVoicings.map(([key, group]) => renderVoicingGroup(key, group))}
        
        {filteredVoicings.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Music className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron voicings con los filtros seleccionados.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VoicingLibrary;