import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Map, MessageSquare, Camera, BarChart3, GraduationCap, X, History, Settings, Timer, Target } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'pathway', label: 'Lộ trình Cá nhân', icon: Map },
  { id: 'tutor', label: 'Gia sư Socratic', icon: MessageSquare },
  { id: 'practice', label: 'Trung tâm Ôn luyện', icon: Target },
  { id: 'solver', label: 'Giải bài AI', icon: Camera },
  { id: 'pomodoro', label: 'Bộ đếm Pomodoro', icon: Timer },
  { id: 'progress', label: 'Phân tích tiến độ', icon: BarChart3 },
  { id: 'logs', label: 'Lịch sử học tập', icon: History },
  { id: 'settings', label: 'Cài đặt', icon: Settings },
];

const LANGUAGES_DICT: Record<string, any> = {
  "Tiếng Việt": {
    "overview": "Tổng quan",
    "pathway": "Lộ trình Cá nhân",
    "tutor": "Gia sư Socratic",
    "practice": "Trung tâm Ôn luyện",
    "solver": "Giải bài AI",
    "pomodoro": "Bộ đếm Pomodoro",
    "progress": "Phân tích tiến độ",
    "logs": "Lịch sử học tập",
    "settings": "Cài đặt",
    "level": "Trình độ hiện tại",
    "clear_cache": "Xóa bộ nhớ tạm",
    "clear_chat": "Xóa lịch sử trò chuyện",
    "clear_confirm": "Bạn có chắc chắn muốn xóa bộ nhớ tạm và bắt đầu lại?",
    "clear_chat_confirm": "Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện?"
  },
  "English": {
    "overview": "Overview",
    "pathway": "Personal Pathway",
    "tutor": "Socratic Tutor",
    "practice": "Practice Center",
    "solver": "AI Solver",
    "pomodoro": "Pomodoro Timer",
    "progress": "Progress Analysis",
    "logs": "Learning Logs",
    "settings": "Settings",
    "level": "Current Level",
    "clear_cache": "Clear Cache",
    "clear_chat": "Clear Chat History",
    "clear_confirm": "Are you sure you want to clear cache and restart?",
    "clear_chat_confirm": "Are you sure you want to clear all chat history?"
  },
  "Français": {
    "overview": "Aperçu",
    "pathway": "Parcours personnel",
    "tutor": "Tuteur socratique",
    "practice": "Centre d'entraînement",
    "solver": "Solveur IA",
    "pomodoro": "Minuteur Pomodoro",
    "progress": "Analyse des progrès",
    "logs": "Journaux d'apprentissage",
    "settings": "Paramètres",
    "level": "Niveau actuel",
    "clear_cache": "Effacer le cache",
    "clear_confirm": "Êtes-vous sûr de vouloir effacer le cache et redémarrer ?"
  },
  "日本語": {
    "overview": "概要",
    "pathway": "パーソナルパスウェイ",
    "tutor": "ソクラテス式チューター",
    "practice": "練習センター",
    "solver": "AIソルバー",
    "pomodoro": "ポモドーロタイマー",
    "progress": "進捗分析",
    "logs": "学習ログ",
    "settings": "設定",
    "level": "現在のレベル",
    "clear_cache": "キャッシュを消去",
    "clear_confirm": "キャッシュを消去して再起動してもよろしいですか？"
  }
};

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [language, setLanguage] = React.useState('Tiếng Việt');
  const [difficulty, setDifficulty] = React.useState('Intermediate');
  const [xp, setXp] = React.useState(0);

  React.useEffect(() => {
    const savedSettings = localStorage.getItem('eduai_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setLanguage(parsed.language || 'Tiếng Việt');
      setDifficulty(parsed.difficulty || 'Intermediate');
    }

    const savedXp = localStorage.getItem('eduai_xp');
    if (savedXp) setXp(parseInt(savedXp));
  }, []);

  const dict = LANGUAGES_DICT[language] || LANGUAGES_DICT['Tiếng Việt'];

  const getRank = (totalXp: number) => {
    const ranks = {
      "Tiếng Việt": {
        beginner: "🌱 Tập sự",
        warrior: "⚔️ Chiến binh",
        scholar: "🎓 Học giả",
        master: "🧙 Bậc thầy"
      },
      "English": {
        beginner: "🌱 Beginner",
        warrior: "⚔️ Warrior",
        scholar: "🎓 Scholar",
        master: "🧙 Master"
      },
      "Français": {
        beginner: "🌱 Débutant",
        warrior: "⚔️ Guerrier",
        scholar: "🎓 Érudit",
        master: "🧙 Maître"
      },
      "日本語": {
        beginner: "🌱 初心者",
        warrior: "⚔️ 戦士",
        scholar: "🎓 学者",
        master: "🧙 マスター"
      }
    };
    const r = ranks[language as keyof typeof ranks] || ranks["Tiếng Việt"];
    if (totalXp < 500) return r.beginner;
    if (totalXp < 2000) return r.warrior;
    if (totalXp < 5000) return r.scholar;
    return r.master;
  };

  const navItems = [
    { id: 'overview', label: dict.overview, icon: LayoutDashboard },
    { id: 'pathway', label: dict.pathway, icon: Map },
    { id: 'tutor', label: dict.tutor, icon: MessageSquare },
    { id: 'practice', label: dict.practice, icon: Target },
    { id: 'solver', label: dict.solver, icon: Camera },
    { id: 'pomodoro', label: dict.pomodoro, icon: Timer },
    { id: 'progress', label: dict.progress, icon: BarChart3 },
    { id: 'logs', label: dict.logs, icon: History },
    { id: 'settings', label: dict.settings, icon: Settings },
  ];

  const handleClearCache = () => {
    if (window.confirm(dict.clear_confirm)) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleClearChat = () => {
    if (window.confirm(dict.clear_chat_confirm)) {
      localStorage.removeItem('eduai_tutor_chat');
      window.location.reload();
    }
  };

  return (
    <div className="w-72 bg-white/80 backdrop-blur-2xl border-r border-white/20 flex flex-col h-screen sticky top-0 z-50 glass-morphism">
      <div className="p-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-brand-200 rotate-3">
          <GraduationCap size={32} />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tighter text-slate-800">EduAI</h1>
          <span className="text-[10px] font-bold bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full uppercase tracking-widest">Master OS v3.0</span>
        </div>
      </div>

      <nav className="flex-1 px-6 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-bold transition-all duration-300 group",
              activeTab === item.id
                ? "bg-brand-500 text-white shadow-xl shadow-brand-100 scale-[1.02]"
                : "text-slate-500 hover:bg-brand-50 hover:text-brand-600"
            )}
          >
            <item.icon size={24} className={cn(
              "transition-transform duration-300 group-hover:scale-110",
              activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-brand-500"
            )} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-100/50 space-y-4">
        <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100/50 shadow-inner">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{dict.level}</p>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-700">{getRank(xp)}</span>
            <span className="text-[10px] font-bold text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">{xp} XP</span>
          </div>
          <div className="w-full bg-slate-200/50 rounded-full h-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((xp / 5000) * 100, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-brand-500 h-2 rounded-full shadow-sm"
            ></motion.div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={handleClearChat}
            className="flex items-center justify-center gap-2 py-3 text-[10px] font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
            title={dict.clear_chat}
          >
            <History size={14} />
            {language === 'Tiếng Việt' ? 'Xóa Chat' : 'Clear Chat'}
          </button>
          <button 
            onClick={handleClearCache}
            className="flex items-center justify-center gap-2 py-3 text-[10px] font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
            title={dict.clear_cache}
          >
            <X size={14} />
            {language === 'Tiếng Việt' ? 'Xóa Cache' : 'Clear Cache'}
          </button>
        </div>
      </div>
    </div>
  );
}
