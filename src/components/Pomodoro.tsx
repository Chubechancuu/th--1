import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Coffee, Brain, Bell, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';

// Thêm ngôn ngữ tiếng Hàn cho đồng bộ với các trang khác của bạn
const LANGUAGES_DICT: Record<string, any> = {
  "Tiếng Việt": {
    "header": "Bộ đếm Pomodoro",
    "desc": "Tập trung cao độ, nghỉ ngơi khoa học.",
    "work": "Tập trung",
    "break": "Nghỉ ngơi",
    "sessions": "Phiên hoàn thành",
    "total_time": "Tổng thời gian",
    "tip_title": "Mẹo nhỏ",
    "tip_desc": "Hãy đứng dậy vươn vai hoặc uống nước khi nghỉ. Tránh màn hình để não bộ phục hồi.",
    "toast_work_complete": "Tuyệt vời! Hoàn thành phiên tập trung.",
    "toast_work_desc": "Nghỉ ngơi 5 phút nhé.",
    "toast_break_complete": "Hết giờ nghỉ!",
    "toast_break_desc": "Sẵn sàng tập trung tiếp chưa?"
  },
  "English": {
    "header": "Pomodoro Timer",
    "desc": "Focus deeply, rest scientifically.",
    "work": "Focus",
    "break": "Break",
    "sessions": "Sessions",
    "total_time": "Total Time",
    "tip_title": "Quick Tip",
    "tip_desc": "Stand up and stretch during breaks. Stay away from screens to recover.",
    "toast_work_complete": "Great job! Focus session done.",
    "toast_work_desc": "Take a 5-minute break.",
    "toast_break_complete": "Break over!",
    "toast_break_desc": "Ready for the next session?"
  },
  "한국어": {
    "header": "포모도로 타이머",
    "desc": "집중은 깊게, 휴식은 과학적으로.",
    "work": "집중",
    "break": "휴식",
    "sessions": "완료된 세션",
    "total_time": "총 시간",
    "tip_title": "작은 팁",
    "tip_desc": "휴식 시간에는 일어나서 스트레칭을 하거나 물을 마셔보세요.",
    "toast_work_complete": "수고하셨습니다! 집중 세션이 끝났습니다.",
    "toast_work_desc": "5분간 휴식을 취하세요.",
    "toast_break_complete": "휴식 종료!",
    "toast_break_desc": "다음 세션을 시작할 준비가 되셨나요?"
  }
};

export function Pomodoro() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [sessions, setSessions] = useState(0);
  const [language, setLanguage] = useState('Tiếng Việt');
  const [pomoWork, setPomoWork] = useState(25);
  const [pomoBreak, setPomoBreak] = useState(5);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dict = LANGUAGES_DICT[language] || LANGUAGES_DICT['Tiếng Việt'];

  // Đồng bộ ngôn ngữ và cài đặt từ LocalStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('eduai_language') || 'Tiếng Việt';
    setLanguage(savedLang);

    const savedSettings = localStorage.getItem('eduai_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      const w = parsed.pomoWork || 25;
      const b = parsed.pomoBreak || 5;
      setPomoWork(w);
      setPomoBreak(b);
      setMinutes(mode === 'work' ? w : b);
    }
  }, []);

  // Logic đếm ngược tối ưu
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds(prevSec => {
          if (prevSec > 0) return prevSec - 1;
          
          setMinutes(prevMin => {
            if (prevMin > 0) {
              return prevMin - 1;
            } else {
              // Timer hoàn thành khi cả min và sec về 0
              handleTimerComplete();
              return 0;
            }
          });
          return 59;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, mode]); // Chỉ phụ thuộc vào isActive và mode

  const handleTimerComplete = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    const nextMode = mode === 'work' ? 'break' : 'work';
    const nextTime = nextMode === 'work' ? pomoWork : pomoBreak;

    if (mode === 'work') {
      setSessions(s => s + 1);
      toast.success(dict.toast_work_complete, { description: dict.toast_work_desc });
      
      // Ghi nhận XP vào hệ thống EduAI của bạn
      const currentXp = parseInt(localStorage.getItem('eduai_xp') || '0');
      localStorage.setItem('eduai_xp', (currentXp + 20).toString());
    } else {
      toast.info(dict.toast_break_complete, { description: dict.toast_break_desc });
    }

    setMode(nextMode);
    setMinutes(nextTime);
    setSeconds(0);
    
    // Phát âm thanh báo hiệu
    new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setMode('work');
    setMinutes(pomoWork);
    setSeconds(0);
  };

  // Tính toán progress cho vòng tròn SVG
  const totalSeconds = (mode === 'work' ? pomoWork : pomoBreak) * 60;
  const remainingSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  const strokeDashoffset = 301.59 * (1 - progress / 100);

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8 px-4">
      <header className="text-center space-y-4">
        <h2 className="text-5xl font-bold text-slate-800 tracking-tight">{dict.header}</h2>
        <p className="text-slate-500 text-xl">{dict.desc}</p>
      </header>

      <div className="relative flex flex-col items-center">
        {/* Timer Circle */}
        <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle cx="50%" cy="50%" r="48%" className="fill-none stroke-slate-100 stroke-[12px]" />
            <motion.circle
              cx="50%" cy="50%" r="48%"
              className={`fill-none stroke-[12px] transition-colors duration-500 ${mode === 'work' ? 'stroke-brand-500' : 'stroke-emerald-500'}`}
              strokeDasharray="301.59"
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-xl rounded-full m-8 border border-white/50 shadow-inner">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2 mb-2"
              >
                {mode === 'work' ? <Brain className="text-brand-500" size={20} /> : <Coffee className="text-emerald-500" size={20} />}
                <span className={`text-sm font-black uppercase tracking-widest ${mode === 'work' ? 'text-brand-600' : 'text-emerald-600'}`}>
                  {mode === 'work' ? dict.work : dict.break}
                </span>
              </motion.div>
            </AnimatePresence>
            <span className="text-7xl md:text-8xl font-mono font-bold text-slate-800 tabular-nums">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 mt-12">
          <button onClick={resetTimer} className="p-4 rounded-2xl bg-white shadow-lg text-slate-400 hover:text-slate-600 transition-all active:scale-90">
            <RotateCcw size={28} />
          </button>
          
          <button 
            onClick={toggleTimer}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 ${isActive ? 'bg-slate-800 text-white' : 'bg-brand-500 text-white'}`}
          >
            {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} className="ml-2" fill="currentColor" />}
          </button>
          
          <button className="p-4 rounded-2xl bg-white shadow-lg text-slate-400 hover:text-slate-600 transition-all active:scale-90">
            <SettingsIcon size={28} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-50 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{dict.sessions}</p>
          <p className="text-4xl font-bold text-slate-800">{sessions}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-50 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{dict.total_time}</p>
          <p className="text-4xl font-bold text-slate-800">{sessions * pomoWork}m</p>
        </div>
      </div>
    </div>
  );
}
