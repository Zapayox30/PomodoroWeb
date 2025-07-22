// ==================== HOOKS PERSONALIZADOS ====================

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, X, Coins, Flame, Music } from 'lucide-react';

// Hook para manejar el localStorage
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// Hook para el temporizador
const useTimer = (initialTime, onComplete) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      onComplete();
      setIsActive(false);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft, onComplete]);

  const start = () => setIsActive(true);
  const pause = () => setIsActive(false);
  const toggle = () => setIsActive(!isActive);
  const reset = (newTime) => {
    setIsActive(false);
    setTimeLeft(newTime);
  };

  return { timeLeft, isActive, start, pause, toggle, reset };
};

// ==================== UTILIDADES ====================

const TIMER_MODES = {
  POMODORO: 'pomodoro',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak'
};

const DEFAULT_SETTINGS = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15
};

const MOTIVATIONAL_PHRASES = [
  "¡Excelente trabajo! 🍅 Sigue así.",
  "¡Domate está orgulloso de ti! 🌟",
  "Un Pomodoro más cerca de tus metas 🚀",
  "¡Fantástico! Tu concentración es increíble 💪",
  "¡Bien hecho! Mereces una pausa 😊",
  "¡Domate te felicita por tu dedicación! 🎉",
  "¡Increíble! Cada Pomodoro cuenta 🔥",
  "¡Sigue cosechando éxitos! 🌱"
];

const CELEBRATION_PHRASES = [
  "¡Pomodoro completado! 🎯",
  "¡Misión cumplida! 🏆",
  "¡Excelente sesión! ⭐",
  "¡Tiempo bien invertido! 💎"
];

const getRandomPhrase = (phrases) => {
  return phrases[Math.floor(Math.random() * phrases.length)];
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getModeStyles = (mode) => {
  const styles = {
    pomodoro: {
      bg: 'bg-red-500',
      text: 'text-red-600',
      hover: 'hover:bg-red-50'
    },
    shortBreak: {
      bg: 'bg-green-500',
      text: 'text-green-600',
      hover: 'hover:bg-green-50'
    },
    longBreak: {
      bg: 'bg-orange-500',
      text: 'text-orange-600',
      hover: 'hover:bg-orange-50'
    }
  };
  return styles[mode] || styles.pomodoro;
};

// ==================== COMPONENTES ====================

// Componente Header
const Header = ({ coins, dailyStreak, onSettingsClick }) => (
  <header className="text-center mb-6">
    <h1 className="text-3xl font-bold text-red-600 mb-2">🍅 Pomodomate</h1>
    <div className="flex justify-center items-center gap-4 text-sm">
      <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
        <Coins className="w-4 h-4 text-yellow-600" />
        <span className="text-yellow-700 font-semibold">{coins}</span>
      </div>
      <div className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full">
        <Flame className="w-4 h-4 text-orange-600" />
        <span className="text-orange-700 font-semibold">{dailyStreak} días</span>
      </div>
      <button
        onClick={onSettingsClick}
        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Configuración"
      >
        <Settings className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  </header>
);

// Componente ModeSelector
const ModeSelector = ({ currentMode, onModeChange }) => {
  const modes = [
    { key: TIMER_MODES.POMODORO, label: 'Pomodoro' },
    { key: TIMER_MODES.SHORT_BREAK, label: 'Descanso Corto' },
    { key: TIMER_MODES.LONG_BREAK, label: 'Descanso Largo' }
  ];

  return (
    <div className="flex gap-2 mb-6">
      {modes.map(({ key, label }) => {
        const styles = getModeStyles(key);
        const isActive = currentMode === key;
        
        return (
          <button
            key={key}
            onClick={() => onModeChange(key)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              isActive 
                ? `${styles.bg} text-white` 
                : `bg-white ${styles.text} ${styles.hover}`
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

// Componente TimerDisplay
const TimerDisplay = ({ timeLeft, isActive, currentMode, settings, onToggle, onReset }) => {
  const styles = getModeStyles(currentMode);
  const totalTime = settings[currentMode] * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="bg-white rounded-2xl p-8 mb-6 shadow-lg text-center">
      <div className={`text-6xl font-bold mb-6 ${styles.text}`}>
        {formatTime(timeLeft)}
      </div>
      
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={onToggle}
          className={`flex items-center justify-center w-16 h-16 rounded-full ${styles.bg} text-white shadow-lg hover:opacity-90 transition-opacity`}
          aria-label={isActive ? "Pausar" : "Iniciar"}
        >
          {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-400 text-white shadow-lg hover:bg-gray-500 transition-colors"
          aria-label="Reiniciar"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>
      
      {/* Barra de progreso */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${styles.bg}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// Componente Mascota Domate
const DomateMascot = ({ motivationalPhrase }) => (
  <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg text-center">
    <div className="text-6xl mb-4" role="img" aria-label="Domate">🍅</div>
    <h3 className="text-xl font-bold text-red-600 mb-2">Domate</h3>
    <p className="text-gray-600 text-sm">{motivationalPhrase}</p>
  </div>
);

// Componente MusicPlayer
const MusicPlayer = () => (
  <div className="bg-white rounded-2xl p-4 mb-6 shadow-lg">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-purple-100 rounded-full">
        <Music className="w-5 h-5 text-purple-600" />
      </div>
      <div>
        <div className="text-sm font-medium text-gray-800">Escuchando:</div>
        <div className="text-xs text-gray-500">Lofi Beats para concentración</div>
      </div>
    </div>
  </div>
);

// Componente SettingsModal
const SettingsModal = ({ isOpen, settings, onClose, onSave }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(localSettings);
  };

  const updateSetting = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: parseInt(value) || 1
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Configuración</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pomodoro (minutos)
            </label>
            <input
              type="number"
              value={localSettings.pomodoro}
              onChange={(e) => updateSetting('pomodoro', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min="1"
              max="60"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descanso Corto (minutos)
            </label>
            <input
              type="number"
              value={localSettings.shortBreak}
              onChange={(e) => updateSetting('shortBreak', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="1"
              max="30"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descanso Largo (minutos)
            </label>
            <input
              type="number"
              value={localSettings.longBreak}
              onChange={(e) => updateSetting('longBreak', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              min="1"
              max="60"
            />
          </div>
        </div>
        
        <button
          onClick={handleSave}
          className="w-full mt-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Guardar
        </button>
      </div>
    </div>
  );
};

// Componente CelebrationModal
const CelebrationModal = ({ isOpen, currentMode, phrase }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full animate-bounce">
        <div className="text-6xl mb-4" role="img" aria-label="Celebración">🎉</div>
        <h3 className="text-2xl font-bold text-red-600 mb-2">
          {phrase}
        </h3>
        {currentMode === TIMER_MODES.POMODORO && (
          <div className="flex items-center justify-center gap-2 text-yellow-600">
            <Coins className="w-5 h-5" />
            <span className="font-bold">+1 Moneda ganada!</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== COMPONENTE PRINCIPAL ====================

const Pomodomate = () => {
  // Estados principales
  const [currentMode, setCurrentMode] = useState(TIMER_MODES.POMODORO);
  const [showSettings, setShowSettings] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationPhrase, setCelebrationPhrase] = useState('');
  const [motivationalPhrase, setMotivationalPhrase] = useState('');

  // Estados persistentes
  const [settings, setSettings] = useLocalStorage('pomodomate-settings', DEFAULT_SETTINGS);
  const [coins, setCoins] = useLocalStorage('pomodomate-coins', 0);
  const [dailyStreak, setDailyStreak] = useLocalStorage('pomodomate-streak', 0);
  const [lastCompletionDate, setLastCompletionDate] = useLocalStorage('pomodomate-last-date', '');

  // Hook del temporizador
  const timer = useTimer(settings[currentMode] * 60, handleTimerComplete);

  // Inicializar frase motivadora
  useEffect(() => {
    setMotivationalPhrase(getRandomPhrase(MOTIVATIONAL_PHRASES));
  }, []);

  // Actualizar timer cuando cambia el modo o configuración
  useEffect(() => {
    timer.reset(settings[currentMode] * 60);
  }, [currentMode, settings]);

  function handleTimerComplete() {
    if (currentMode === TIMER_MODES.POMODORO) {
      // Recompensar al usuario
      setCoins(prev => prev + 1);
      
      // Actualizar racha diaria
      const today = new Date().toDateString();
      if (lastCompletionDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const newStreak = lastCompletionDate === yesterday ? dailyStreak + 1 : 1;
        setDailyStreak(newStreak);
        setLastCompletionDate(today);
      }
      
      // Nueva frase motivadora
      setMotivationalPhrase(getRandomPhrase(MOTIVATIONAL_PHRASES));
    }
    
    // Mostrar celebración
    setCelebrationPhrase(getRandomPhrase(CELEBRATION_PHRASES));
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  }

  const handleModeChange = (mode) => {
    setCurrentMode(mode);
    if (mode === TIMER_MODES.POMODORO) {
      setMotivationalPhrase(getRandomPhrase(MOTIVATIONAL_PHRASES));
    }
  };

  const handleSettingsSave = (newSettings) => {
    setSettings(newSettings);
    setShowSettings(false);
  };

  const handleReset = () => {
    timer.reset(settings[currentMode] * 60);
  };

  return (
    <div className="min-h-screen bg-amber-50 p-4">
      <div className="max-w-md mx-auto">
        <Header 
          coins={coins}
          dailyStreak={dailyStreak}
          onSettingsClick={() => setShowSettings(true)}
        />

        <ModeSelector 
          currentMode={currentMode}
          onModeChange={handleModeChange}
        />

        <TimerDisplay 
          timeLeft={timer.timeLeft}
          isActive={timer.isActive}
          currentMode={currentMode}
          settings={settings}
          onToggle={timer.toggle}
          onReset={handleReset}
        />

        <DomateMascot motivationalPhrase={motivationalPhrase} />

        <MusicPlayer />

        <SettingsModal 
          isOpen={showSettings}
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={handleSettingsSave}
        />

        <CelebrationModal 
          isOpen={showCelebration}
          currentMode={currentMode}
          phrase={celebrationPhrase}
        />
      </div>
    </div>
  );
};

export default Pomodomate;