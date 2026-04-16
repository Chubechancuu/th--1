import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Brain, Coffee, X, Maximize2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function FloatingPomodoro() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(true);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('eduai_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      const workTime = parsed.pomoWork || 25;
      setMinutes(workTime);
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          handleTimerComplete();
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    const savedSettings = localStorage.getItem('eduai_settings');
    const parsed = savedSettings ? JSON.parse(savedSettings) : {};
    const workTime = parsed.pomoWork || 25;
    const breakTime = parsed.pomoBreak || 5;

    if (mode === 'work') {
      setMode('break');
      setMinutes(breakTime);
    } else {
      setMode('work');
      setMinutes(workTime);
    }
    setSeconds(0);
    
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play();
    } catch (e) {}
  };

  const formatTime = (m: number, s: number) => {
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <motion.div 
      drag
      dragConstraints={{ left: -window.innerWidth + 200, right: 0, top: 0, bottom: window.innerHeight - 100 }}
      initial={{ x: -20, y: -20 }}
      className="fixed bottom-6 right-6 z-[100] cursor-move"
    >
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.button
            key="minimized"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsMinimized(false)}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-xl transition-all hover:scale-110",
              mode === 'work' ? "bg-brand-500 text-white" : "bg-emerald-500 text-white"
            )}
          >
            <div className="flex flex-col items-center">
              {mode === 'work' ? <Brain size={16} /> : <Coffee size={16} />}
              <span className="text-[10px] font-bold font-mono">{formatTime(minutes, seconds)}</span>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="bg-white/80 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/40 shadow-2xl w-64 glass-morphism"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {mode === 'work' ? <Brain className="text-brand-500" size={20} /> : <Coffee className="text-emerald-500" size={20} />}
                <span className={cn(
                  "text-xs font-bold uppercase tracking-widest",
                  mode === 'work' ? "text-brand-600" : "text-emerald-600"
                )}>
                  {mode === 'work' ? 'Focus' : 'Break'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsMinimized(true)} className="p-1.5 text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="text-center mb-6">
              <span className="text-4xl font-mono font-bold text-slate-800 tabular-nums">
                {formatTime(minutes, seconds)}
              </span>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={() => setIsActive(!isActive)}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95",
                  isActive ? "bg-slate-800 text-white" : "bg-brand-500 text-white"
                )}
              >
                {isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
              </button>
              <button 
                onClick={() => {
                  setIsActive(false);
                  const savedSettings = localStorage.getItem('eduai_settings');
                  const workTime = savedSettings ? JSON.parse(savedSettings).pomoWork || 25 : 25;
                  setMinutes(workTime);
                  setSeconds(0);
                  setMode('work');
                }}
                className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-all"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
