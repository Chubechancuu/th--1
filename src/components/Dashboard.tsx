import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Target, 
  ChevronRight, 
  Zap, 
  Brain, 
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Bot,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  FileText,
  Lightbulb,
  Loader2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { generateMentorAdvice } from '@/src/lib/gemini';

interface Task {
  id: string;
  task: string;
  completed: boolean;
}

const LANGUAGES_DICT: Record<string, any> = {
  "Tiếng Việt": {
    "welcome": "Chào mừng bạn đến với EduAI",
    "hero_desc": "Hôm nay là một ngày tuyệt vời để chinh phục kiến thức mới. Bạn đã sẵn sàng chưa?",
    "btn_tutor": "Học với Gia sư AI",
    "btn_practice": "Luyện tập ngay",
    "pomodoro": "Đồng hồ Pomodoro",
    "start": "Bắt đầu",
    "pause": "Tạm dừng",
    "reset": "Đặt lại",
    "progress": "Tiến độ học tập",
    "performance_title": "Phân tích hiệu suất",
    "avg_score_label": "Điểm trung bình:",
    "status_label": "Đánh giá:",
    "status_excellent": "🌟 Xuất sắc",
    "status_effort": "📈 Cần cố gắng",
    "no_data": "Chưa có dữ liệu học tập.",
    "roadmap_title": "📍 Lộ trình của bạn:",
    "add_task_placeholder": "Thêm lộ trình mới...",
    "tip_title": "Mẹo học tập khoa học",
    "tip_desc": "Hãy thử kỹ thuật Feynman: Giải thích một khái niệm phức tạp bằng ngôn ngữ đơn giản nhất như đang dạy cho một đứa trẻ 5 tuổi.",
    "achievement": "Thành tích",
    "achievement_desc": "Bạn đã hoàn thành 5 buổi học liên tiếp!",
    "recall_title": "Active Recall",
    "recall_desc": "Bạn còn nhớ kiến thức về 'Kế toán định khoản' không? Hãy thử làm một bài tập nhỏ nhé!",
    "recall_btn": "Kiểm tra ngay",
    "socratic_msg": "🤖 Gia sư Socratic: 'Hôm nay bạn muốn chinh phục kiến thức Kế toán hay Luật nào?'"
  },
  "English": {
    "welcome": "Welcome to EduAI",
    "hero_desc": "Today is a great day to conquer new knowledge. Are you ready?",
    "btn_tutor": "Learn with AI Tutor",
    "btn_practice": "Practice Now",
    "pomodoro": "Pomodoro Timer",
    "start": "Start",
    "pause": "Pause",
    "reset": "Reset",
    "progress": "Learning Progress",
    "performance_title": "Performance Analysis",
    "avg_score_label": "Average Score:",
    "status_label": "Assessment:",
    "status_excellent": "🌟 Excellent",
    "status_effort": "📈 Needs Effort",
    "no_data": "No study data yet.",
    "roadmap_title": "📍 Your Roadmap:",
    "add_task_placeholder": "Add new roadmap...",
    "tip_title": "Scientific Study Tip",
    "tip_desc": "Try the Feynman Technique: Explain a complex concept in the simplest language as if you were teaching a 5-year-old.",
    "achievement": "Achievement",
    "achievement_desc": "You've completed 5 consecutive study sessions!",
    "recall_title": "Active Recall",
    "recall_desc": "Do you remember 'Accounting entries'? Let's try a quick exercise!",
    "recall_btn": "Test Now",
    "socratic_msg": "🤖 Socratic Tutor: 'Which Accounting or Law knowledge do you want to conquer today?'"
  }
};

export function Dashboard({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [language, setLanguage] = useState('Tiếng Việt');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [performance, setPerformance] = useState({ avg: 0, status: '' });
  const [streak, setStreak] = useState(0);
  const [mentorAdvice, setMentorAdvice] = useState('');
  const [adviceLoading, setAdviceLoading] = useState(false);

  const dict = LANGUAGES_DICT[language] || LANGUAGES_DICT['Tiếng Việt'];

  useEffect(() => {
    const savedSettings = localStorage.getItem('eduai_settings');
    if (savedSettings) {
      setLanguage(JSON.parse(savedSettings).language || 'Tiếng Việt');
    }

    const savedXp = parseInt(localStorage.getItem('eduai_xp') || '0');
    const savedNotes = JSON.parse(localStorage.getItem('eduai_notes') || '[]');
    const currentHistory = JSON.parse(localStorage.getItem('eduai_study_history') || '[]');

    const fetchAdvice = async () => {
      setAdviceLoading(true);
      const advice = await generateMentorAdvice({
        xp: savedXp,
        notesCount: savedNotes.length,
        historyCount: currentHistory.length,
        language: language
      });
      if (advice) setMentorAdvice(advice);
      setAdviceLoading(false);
    };

    fetchAdvice();

    const savedStreak = localStorage.getItem('eduai_streak');
    if (savedStreak) setStreak(parseInt(savedStreak));
    else {
      setStreak(5); // Default for demo
      localStorage.setItem('eduai_streak', '5');
    }

    const savedTasks = localStorage.getItem('eduai_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks([]);
      localStorage.setItem('eduai_tasks', JSON.stringify([]));
    }

    const savedHistory = localStorage.getItem('eduai_study_history');
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      if (history.length > 0) {
        // In this app, score is not always present in history, but we simulate it or use XP as proxy
        // For the sake of the request, let's assume some history items have scores or we use a default
        const scores = history.filter((h: any) => h.score !== undefined).map((h: any) => h.score);
        const avg = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 75;
        const status = avg >= 85 ? dict.status_excellent : dict.status_effort;
        setPerformance({ avg, status });
      } else {
        setPerformance({ avg: 0, status: dict.no_data });
      }
    } else {
      setPerformance({ avg: 0, status: dict.no_data });
    }
  }, [dict.status_excellent, dict.status_effort, dict.no_data]);

  const toggleTask = (id: string) => {
    const newTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(newTasks);
    localStorage.setItem('eduai_tasks', JSON.stringify(newTasks));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const task: Task = { id: Date.now().toString(), task: newTask, completed: false };
    const newTasks = [...tasks, task];
    setTasks(newTasks);
    localStorage.setItem('eduai_tasks', JSON.stringify(newTasks));
    setNewTask('');
  };

  const deleteTask = (id: string) => {
    const newTasks = tasks.filter(t => t.id !== id);
    setTasks(newTasks);
    localStorage.setItem('eduai_tasks', JSON.stringify(newTasks));
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-12 py-8 px-4 max-w-7xl mx-auto">
      <section className="relative overflow-hidden rounded-[4rem] bg-slate-900 p-16 lg:p-24 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-500/30 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-4xl space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <h1 className="text-6xl lg:text-8xl font-display font-bold tracking-tight leading-tight">
                Chào mừng bạn đến với EduAI
              </h1>
              <div className="px-6 py-3 bg-orange-500/20 border border-orange-500/30 rounded-2xl flex items-center gap-3 text-orange-400">
                <Zap size={24} fill="currentColor" />
                <span className="text-2xl font-bold">{streak} {language === 'Tiếng Việt' ? 'Ngày' : 'Days'}</span>
              </div>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 max-w-2xl">
              <p className="text-xl lg:text-2xl text-brand-300 italic font-medium">
                {dict.socratic_msg}
              </p>
            </div>
            <p className="text-2xl lg:text-3xl text-slate-300 leading-relaxed font-medium max-w-2xl">
              {dict.hero_desc}
            </p>
          </motion.div>
          
          <div className="flex flex-wrap gap-8">
            <button 
              onClick={() => setActiveTab('tutor')}
              className="px-12 py-6 bg-brand-500 hover:bg-brand-600 text-white rounded-[2rem] font-bold text-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-4 shadow-2xl shadow-brand-500/40"
            >
              <Bot size={36} />
              {dict.btn_tutor}
            </button>
            <button 
              onClick={() => setActiveTab('practice')}
              className="px-12 py-6 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white border border-white/20 rounded-[2rem] font-bold text-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-4"
            >
              <Target size={36} />
              {dict.btn_practice}
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[4rem] border border-white/20 shadow-2xl flex flex-col items-center justify-center space-y-8 glass-morphism">
          <div className="flex items-center gap-4 text-slate-400 font-bold uppercase tracking-widest text-sm">
            <div className="p-2 bg-brand-500/10 rounded-lg">
              <Clock size={24} className="text-brand-500" />
            </div>
            {dict.pomodoro}
          </div>
          <div className="text-8xl font-mono font-bold text-slate-800 tracking-tighter">
            {formatTime(timeLeft)}
          </div>
          <div className="flex gap-6 w-full">
            <button
              onClick={() => setIsActive(!isActive)}
              className={cn(
                "flex-[2] py-6 rounded-[2rem] font-bold text-xl transition-all flex items-center justify-center gap-3 shadow-xl",
                isActive ? "bg-amber-100 text-amber-600 shadow-amber-100" : "bg-brand-500 text-white shadow-brand-200"
              )}
            >
              {isActive ? <Pause size={28} /> : <Play size={28} />}
              {isActive ? dict.pause : dict.start}
            </button>
            <button
              onClick={() => { setIsActive(false); setTimeLeft(25 * 60); }}
              className="flex-1 py-6 bg-slate-100 text-slate-500 rounded-[2rem] hover:bg-slate-200 transition-all flex items-center justify-center shadow-sm"
            >
              <RotateCcw size={28} />
            </button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[4rem] border border-white/20 shadow-2xl space-y-8 glass-morphism">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-display font-bold text-slate-800 flex items-center gap-4">
              <div className="p-2 bg-brand-500/10 rounded-lg">
                <TrendingUp className="text-brand-500" size={24} />
              </div>
              {dict.performance_title}
            </h3>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold text-slate-500 uppercase tracking-widest">
                <span>{dict.avg_score_label}</span>
                <span className="text-brand-600">{performance.avg.toFixed(1)}</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${performance.avg}%` }}
                  className="h-full bg-brand-500 rounded-full"
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{dict.status_label}</p>
              <p className="text-lg font-bold text-slate-700">{performance.status}</p>
            </div>
          </div>
        </div>

        <div className="bg-brand-500 p-10 rounded-[4rem] text-white shadow-2xl shadow-brand-200 space-y-8 relative overflow-hidden group">
          <Sparkles className="absolute -right-8 -top-8 text-white/10 w-48 h-48 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10 space-y-6">
            <h3 className="text-2xl font-display font-bold flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Zap size={28} />
              </div>
              {dict.tip_title}
            </h3>
            <p className="text-brand-50 leading-relaxed text-xl italic font-medium">
              "{dict.tip_desc}"
            </p>
          </div>
        </div>
      </div>

      {/* AI Mentor Insight Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-orange-500/5 rounded-[4rem] blur-3xl" />
        <div className="relative bg-white/40 backdrop-blur-3xl border border-white/40 p-12 lg:p-16 rounded-[4rem] shadow-2xl glass-morphism overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <Bot size={200} />
          </div>
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="w-32 h-32 lg:w-48 lg:h-48 bg-gradient-to-br from-brand-400 to-brand-600 rounded-[3rem] flex items-center justify-center text-white shadow-2xl rotate-3 shrink-0">
              <Bot size={80} />
            </div>
            <div className="space-y-6 flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <h3 className="text-3xl lg:text-4xl font-display font-bold text-slate-800">
                  {language === 'Tiếng Việt' ? 'Lời khuyên từ Cố vấn AI' : 'AI Mentor Insight'}
                </h3>
                <div className="px-3 py-1 bg-brand-100 text-brand-600 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                  Personalized
                </div>
              </div>
              
              {adviceLoading ? (
                <div className="flex items-center justify-center lg:justify-start gap-4 py-4">
                  <Loader2 className="animate-spin text-brand-500" size={32} />
                  <p className="text-slate-400 text-xl font-medium animate-pulse">
                    {language === 'Tiếng Việt' ? 'Đang phân tích dữ liệu học tập của bạn...' : 'Analyzing your study data...'}
                  </p>
                </div>
              ) : (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl lg:text-3xl text-slate-600 leading-relaxed font-medium italic"
                >
                  "{mentorAdvice || (language === 'Tiếng Việt' ? 'Hãy tiếp tục nỗ lực, bạn đang đi đúng hướng!' : 'Keep up the great work, you are on the right track!')}"
                </motion.p>
              )}
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm font-bold text-slate-500">
                  <TrendingUp size={16} />
                  {language === 'Tiếng Việt' ? 'Dựa trên tiến độ' : 'Based on progress'}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm font-bold text-slate-500">
                  <Lightbulb size={16} />
                  {language === 'Tiếng Việt' ? 'Cập nhật hàng ngày' : 'Updated daily'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Saved Notes Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-3xl font-display font-bold text-slate-800 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600">
              <FileText size={32} />
            </div>
            {language === 'Tiếng Việt' ? 'Ghi chú đã lưu' : 'Saved Notes'}
          </h3>
          <button 
            onClick={() => setActiveTab('tutor')}
            className="text-brand-600 font-bold flex items-center gap-2 hover:gap-4 transition-all"
          >
            {language === 'Tiếng Việt' ? 'Xem tất cả' : 'View all'}
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {JSON.parse(localStorage.getItem('eduai_notes') || '[]').slice(0, 3).map((note: any) => (
            <div key={note.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles size={48} className="text-brand-500" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                    {note.topic || 'General'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{note.date}</span>
                </div>
                <p className="text-slate-600 line-clamp-3 text-lg leading-relaxed italic">
                  "{note.content}"
                </p>
              </div>
            </div>
          ))}
          {JSON.parse(localStorage.getItem('eduai_notes') || '[]').length === 0 && (
            <div className="col-span-full py-12 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 text-center">
              <p className="text-slate-400 font-medium">
                {language === 'Tiếng Việt' ? 'Chưa có ghi chú nào được lưu. Hãy học cùng AI để lưu lại kiến thức!' : 'No notes saved yet. Study with AI to save knowledge!'}
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[4rem] border border-white/20 shadow-2xl space-y-8 glass-morphism">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-display font-bold text-slate-800 flex items-center gap-4">
              <Target className="text-brand-500" size={28} />
              {dict.roadmap_title}
            </h3>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {tasks.map(task => (
              <div 
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "p-5 rounded-[2rem] border transition-all cursor-pointer flex items-center gap-4 group",
                  task.completed ? "bg-emerald-50 border-emerald-100" : "bg-white border-slate-100 hover:border-brand-200"
                )}
              >
                {task.completed ? (
                  <CheckCircle2 className="text-emerald-500" size={28} />
                ) : (
                  <Circle className="text-slate-300 group-hover:text-brand-400" size={28} />
                )}
                <span className={cn(
                  "text-lg font-medium flex-1",
                  task.completed ? "text-emerald-700 line-through opacity-60" : "text-slate-700"
                )}>
                  {task.task}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                  className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="relative">
            <input 
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              placeholder={dict.add_task_placeholder}
              className="w-full pl-6 pr-16 py-5 rounded-[2rem] bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-lg"
            />
            <button 
              onClick={addTask}
              className="absolute right-3 top-3 bottom-3 w-12 bg-brand-500 text-white rounded-2xl flex items-center justify-center hover:bg-brand-600 transition-all shadow-lg shadow-brand-200"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-white/80 backdrop-blur-2xl p-12 rounded-[4rem] border border-white/20 shadow-2xl flex items-center gap-10 glass-morphism hover:scale-[1.02] transition-all cursor-pointer group">
            <div className="w-28 h-28 bg-amber-100 rounded-[2.5rem] flex items-center justify-center text-amber-600 shadow-inner group-hover:rotate-6 transition-transform">
              <Trophy size={56} />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-display font-bold text-slate-800">{dict.achievement}</h3>
              <p className="text-slate-500 text-xl leading-relaxed">{dict.achievement_desc}</p>
            </div>
            <ChevronRight className="ml-auto text-slate-300 group-hover:translate-x-2 transition-transform" size={40} />
          </div>

          <div className="bg-slate-900 p-12 rounded-[4rem] shadow-2xl flex items-center gap-10 group cursor-pointer hover:bg-slate-800 transition-all">
            <div className="w-28 h-28 bg-brand-500/20 rounded-[2.5rem] flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform">
              <Brain size={56} />
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-4">
                <h3 className="text-3xl font-display font-bold text-white">{dict.recall_title}</h3>
                <span className="px-3 py-1 bg-brand-500 text-white text-xs font-bold uppercase rounded-lg shadow-lg shadow-brand-500/20">Hot</span>
              </div>
              <p className="text-slate-400 text-xl leading-relaxed">{dict.recall_desc}</p>
            </div>
            <button 
              onClick={() => setActiveTab('practice')}
              className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-lg hover:bg-brand-500 hover:text-white transition-all shadow-xl"
            >
              {dict.recall_btn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
