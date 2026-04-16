import React from 'react';
import { GlobalSearch } from './GlobalSearch';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Settings, User } from 'lucide-react';

interface TopBarProps {
  setActiveTab: (tab: string) => void;
}

const LANGUAGES_DICT: Record<string, any> = {
  "Tiếng Việt": {
    "role": "Học sinh"
  },
  "English": {
    "role": "Student"
  },
  "Français": {
    "role": "Étudiant"
  },
  "日本語": {
    "role": "学生"
  }
};

export function TopBar({ setActiveTab }: TopBarProps) {
  const [language, setLanguage] = React.useState('Tiếng Việt');
  const [username, setUsername] = React.useState('User');

  React.useEffect(() => {
    const savedSettings = localStorage.getItem('eduai_settings');
    if (savedSettings) {
      setLanguage(JSON.parse(savedSettings).language || 'Tiếng Việt');
    }

    const session = localStorage.getItem('eduai_session');
    if (session) {
      setUsername(JSON.parse(session).username || 'User');
    }
  }, []);

  const dict = LANGUAGES_DICT[language] || LANGUAGES_DICT['Tiếng Việt'];
  const [xp, setXp] = React.useState(0);

  React.useEffect(() => {
    const savedSettings = localStorage.getItem('eduai_settings');
    if (savedSettings) {
      setLanguage(JSON.parse(savedSettings).language || 'Tiếng Việt');
    }

    const session = localStorage.getItem('eduai_session');
    if (session) {
      setUsername(JSON.parse(session).username || 'User');
    }

    const updateXp = () => {
      const savedXp = localStorage.getItem('eduai_xp');
      if (savedXp) setXp(parseInt(savedXp));
    };

    updateXp();
    window.addEventListener('storage', updateXp);
    const interval = setInterval(updateXp, 2000); // Poll for changes if storage event doesn't fire in same tab

    return () => {
      window.removeEventListener('storage', updateXp);
      clearInterval(interval);
    };
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const progress = Math.min((xp / 5000) * 100, 100);

  return (
    <div className="h-20 border-b border-white/20 bg-white/60 backdrop-blur-2xl sticky top-0 z-40 px-10 flex items-center justify-between glass-morphism">
      <div className="flex-1 max-w-2xl flex items-center gap-8">
        <GlobalSearch setActiveTab={setActiveTab} />
        
        <div className="hidden xl:flex flex-col gap-1 w-48">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden border border-white/20">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-brand-400 to-brand-600 shadow-[0_0_10px_rgba(var(--brand-500),0.3)]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="p-3 text-slate-400 hover:text-brand-500 hover:bg-white/50 rounded-2xl transition-all relative shadow-sm border border-transparent hover:border-white/50">
          <Bell size={24} />
          <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className="p-3 text-slate-400 hover:text-brand-500 hover:bg-white/50 rounded-2xl transition-all shadow-sm border border-transparent hover:border-white/50"
        >
          <Settings size={24} />
        </button>
        <div className="h-10 w-px bg-slate-200/50 mx-2"></div>
        <button className="flex items-center gap-4 pl-4 pr-2 py-2 rounded-2xl hover:bg-white/50 transition-all group border border-transparent hover:border-white/50 shadow-sm">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800 leading-none">{username}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{dict.role}</p>
          </div>
          <div className="w-10 h-10 bg-brand-500 text-white rounded-xl flex items-center justify-center font-bold text-sm border-2 border-white shadow-xl group-hover:scale-110 transition-all rotate-3">
            {getInitials(username)}
          </div>
        </button>
      </div>
    </div>
  );
}
