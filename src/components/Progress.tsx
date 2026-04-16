import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Calendar, PieChart, BarChart3, Target, Zap, Clock, Trophy, Award, Map as MapIcon, Sparkles, Brain } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend
} from 'recharts';
import { cn } from '@/src/lib/utils';

const LANGUAGES_DICT: Record<string, any> = {
  "Tiếng Việt": {
    "header": "Phân tích hiệu suất",
    "desc": "Theo dõi tiến độ học tập chuyên sâu của bạn.",
    "weekly_stats": "Thống kê theo tuần",
    "avg_score": "Điểm tiếp thu trung bình",
    "total_time": "Tổng thời gian học",
    "xp_gain": "XP đạt được",
    "minutes": "Phút",
    "no_data": "Chưa có dữ liệu học tập. Hãy bắt đầu học để xem phân tích!",
    "delta_text": "so với tuần trước",
    "qualitative_title": "Đánh giá Năng lực",
    "qualitative_desc": "Phân tích chuyên sâu về kỹ năng và tư duy của bạn.",
    "daily_analysis": "Phân tích Học tập Hàng ngày",
    "daily_desc": "Theo dõi sự tập trung và hiệu quả qua từng ngày.",
    "ai_companion_title": "Lời khuyên từ AI Đồng hành",
    "ai_companion_desc": "AI phân tích dữ liệu của bạn để đưa ra lời khuyên cá nhân hóa.",
    "skills": {
      "logic": "Logic",
      "language": "Ngôn ngữ",
      "memory": "Ghi nhớ",
      "creative": "Sáng tạo",
      "speed": "Tốc độ"
    },
    "ranks": {
      "beginner": "🌱 Tập sự (Bronze)",
      "warrior": "🛡️ Chiến binh (Silver)",
      "scholar": "🎓 Học giả (Gold)",
      "master": "🧙 Bậc thầy (Diamond)"
    }
  },
  "English": {
    "header": "Performance Analytics",
    "desc": "Track your in-depth learning progress.",
    "weekly_stats": "Weekly Activity",
    "avg_score": "Average Score",
    "total_time": "Total Study Time",
    "xp_gain": "XP Earned",
    "minutes": "Mins",
    "no_data": "No study data yet. Start learning to see analytics!",
    "delta_text": "vs last week",
    "qualitative_title": "Competency Assessment",
    "qualitative_desc": "In-depth analysis of your skills and mindset.",
    "daily_analysis": "Daily Learning Analysis",
    "daily_desc": "Track focus and efficiency day by day.",
    "ai_companion_title": "AI Companion Insights",
    "ai_companion_desc": "AI analyzes your data to provide personalized advice.",
    "skills": {
      "logic": "Logic",
      "language": "Language",
      "memory": "Memory",
      "creative": "Creative",
      "speed": "Speed"
    },
    "ranks": {
      "beginner": "🌱 Beginner (Bronze)",
      "warrior": "🛡️ Warrior (Silver)",
      "scholar": "🎓 Scholar (Gold)",
      "master": "🧙 Grandmaster (Diamond)"
    }
  },
  "Deutsch": {
    "header": "Leistungsanalyse",
    "desc": "Verfolgen Sie Ihren detaillierten Lernfortschritt.",
    "weekly_stats": "Wöchentliche Aktivität",
    "avg_score": "Durchschnittliche Punktzahl",
    "total_time": "Gesamte Lernzeit",
    "xp_gain": "Verdiente XP",
    "minutes": "Min.",
    "no_data": "Noch keine Lerndaten. Beginnen Sie mit dem Lernen, um Analysen zu sehen!",
    "delta_text": "vs. letzte Woche",
    "qualitative_title": "Kompetenzbewertung",
    "qualitative_desc": "Detaillierte Analyse Ihrer Fähigkeiten und Denkweise.",
    "skills": {
      "logic": "Logik",
      "language": "Sprache",
      "memory": "Gedächtnis",
      "creative": "Kreativität",
      "speed": "Geschwindigkeit"
    },
    "ranks": {
      "beginner": "🌱 Anfänger (Bronze)",
      "warrior": "🛡️ Krieger (Silver)",
      "scholar": "🎓 Gelehrter (Gold)",
      "master": "🧙 Großmeister (Diamond)"
    }
  },
  "Español": {
    "header": "Análisis de Rendimiento",
    "desc": "Sigue tu progreso de aprendizaje en profundidad.",
    "weekly_stats": "Actividad Semanal",
    "avg_score": "Puntuación Promedio",
    "total_time": "Tiempo Total de Estudio",
    "xp_gain": "XP Ganada",
    "minutes": "Mins",
    "no_data": "Aún no hay datos de estudio. ¡Empieza a aprender para ver las analíticas!",
    "delta_text": "vs la semana pasada",
    "qualitative_title": "Evaluación de Competencias",
    "qualitative_desc": "Análisis profundo de tus habilidades y mentalidad.",
    "skills": {
      "logic": "Lógica",
      "language": "Idioma",
      "memory": "Memoria",
      "creative": "Creatividad",
      "speed": "Velocidad"
    },
    "ranks": {
      "beginner": "🌱 Principiante (Bronce)",
      "warrior": "🛡️ Guerrero (Plata)",
      "scholar": "🎓 Erudito (Oro)",
      "master": "🧙 Gran Maestro (Diamante)"
    }
  },
  "한국어": {
    "header": "성과 분석",
    "desc": "심층적인 학습 진행 상황을 추적하세요.",
    "weekly_stats": "주간 활동",
    "avg_score": "평균 점수",
    "total_time": "총 학습 시간",
    "xp_gain": "획득한 XP",
    "minutes": "분",
    "no_data": "학습 데이터가 아직 없습니다. 분석을 보려면 학습을 시작하세요!",
    "delta_text": "지난주 대비",
    "qualitative_title": "역량 평가",
    "qualitative_desc": "기술과 사고방식에 대한 심층 분석입니다.",
    "skills": {
      "logic": "논리",
      "language": "언어",
      "memory": "기억력",
      "creative": "창의성",
      "speed": "속도"
    },
    "ranks": {
      "beginner": "🌱 초보자 (브론즈)",
      "warrior": "🛡️ 전사 (실버)",
      "scholar": "🎓 학자 (골드)",
      "master": "🧙 그랜드마스터 (다이아몬드)"
    }
  }
};

export function Progress() {
  const [language, setLanguage] = useState('Tiếng Việt');
  const [xp, setXp] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [tasks, setTasks] = useState<any[]>([]);
  const [avgScore, setAvgScore] = useState(0);

  useEffect(() => {
    const savedSettings = localStorage.getItem('eduai_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setLanguage(parsed.language || 'Tiếng Việt');
    }

    const savedXp = localStorage.getItem('eduai_xp');
    if (savedXp) setXp(parseInt(savedXp));

    const savedTasks = localStorage.getItem('eduai_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    const savedHistory = localStorage.getItem('eduai_study_history');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory);
        
        // Calculate average score
        const scores = parsedHistory.filter((h: any) => h.score !== undefined).map((h: any) => h.score);
        const avg = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 75;
        setAvgScore(avg);

        // Aggregate data for Daily Pulse (Analytics 2.0)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().split('T')[0];
        });

        const aggregated = last7Days.map(dateStr => {
          const dayData = parsedHistory.filter((h: any) => h.date.startsWith(dateStr));
          const dayXp = dayData.reduce((sum: number, h: any) => sum + (h.xp || 0), 0);
          const dayTime = dayData.reduce((sum: number, h: any) => sum + (h.duration || 0), 0);
          const dayName = new Date(dateStr).toLocaleDateString(language === 'Tiếng Việt' ? 'vi-VN' : 'en-US', { weekday: 'short' });
          return { name: dayName, xp: dayXp, time: dayTime, date: dateStr };
        });

        setChartData(aggregated);
        setTotalTime(parsedHistory.reduce((sum: number, h: any) => sum + (h.duration || 0), 0));
      } catch (e) {}
    }
  }, [language]);

  const toggleTask = (id: string) => {
    const newTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(newTasks);
    localStorage.setItem('eduai_tasks', JSON.stringify(newTasks));
  };

  const dict = LANGUAGES_DICT[language] || LANGUAGES_DICT['Tiếng Việt'];

  const getStatus = (score: number) => {
    if (score >= 85) return "🌟 Xuất sắc";
    if (score >= 70) return "📈 Khá tốt";
    return "💡 Cần cố gắng";
  };

  const roadmapProgress = tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;

  const getRank = (totalXp: number) => {
    const r = dict.ranks;
    if (totalXp < 1000) return r.beginner;
    if (totalXp < 3000) return r.warrior;
    if (totalXp < 7000) return r.scholar;
    return r.master;
  };

  const radarData = [
    { subject: dict.skills.logic, A: Math.min(100 + (xp / 100), 150), fullMark: 150 },
    { subject: dict.skills.language, A: Math.min(90 + (xp / 120), 150), fullMark: 150 },
    { subject: dict.skills.memory, A: Math.min(110 + (xp / 80), 150), fullMark: 150 },
    { subject: dict.skills.creative, A: Math.min(80 + (xp / 150), 150), fullMark: 150 },
    { subject: dict.skills.speed, A: Math.min(85 + (xp / 130), 150), fullMark: 150 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-8 px-4">
      <header className="space-y-2">
        <h2 className="text-4xl font-display font-bold text-slate-800 flex items-center gap-4">
          <div className="p-3 bg-brand-500 text-white rounded-2xl shadow-lg shadow-brand-200">
            <TrendingUp size={36} />
          </div>
          {dict.header}
        </h2>
        <p className="text-slate-500 text-xl ml-16">{dict.desc}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-2xl flex items-center gap-10 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 opacity-10 group-hover:scale-110 transition-transform">
            <Trophy size={240} />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <Award className="text-amber-400" size={24} />
              <h3 className="font-bold uppercase tracking-widest text-sm opacity-60">{getRank(xp)}</h3>
            </div>
            <div>
              <p className="text-6xl font-display font-bold tracking-tighter">{xp} XP</p>
              <p className="text-slate-400 text-lg mt-2">{dict.xp_gain}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-12 rounded-[4rem] border border-white/20 shadow-2xl flex items-center gap-10 glass-morphism">
          <div className="p-8 bg-emerald-50 text-emerald-600 rounded-[2.5rem] shadow-inner">
            <Clock size={48} />
          </div>
          <div className="space-y-2">
            <p className="text-5xl font-display font-bold text-slate-800 tracking-tighter">{totalTime} {dict.minutes}</p>
            <p className="text-slate-500 text-lg">{dict.total_time}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Daily Activity Chart */}
        <div className="lg:col-span-8 bg-white/80 backdrop-blur-xl p-10 rounded-[4rem] border border-white/20 shadow-2xl glass-morphism space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-200">
                <Calendar size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-slate-800">{dict.daily_analysis} (Daily Pulse)</h3>
                <p className="text-slate-500 text-sm">{dict.daily_desc}</p>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.length > 0 ? chartData : [{name: '...', xp: 0}]}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '15px' }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="xp" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorXp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Companion Assessment */}
        <div className="lg:col-span-4 bg-slate-900 p-10 rounded-[4rem] text-white shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <Sparkles size={200} />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-500 text-white rounded-2xl shadow-lg">
                <Brain size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{dict.ai_companion_title}</h3>
                <p className="text-slate-400 text-xs">{dict.ai_companion_desc}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-2">
                  {language === 'Tiếng Việt' ? 'Đánh giá tổng quan' : 'Overall Assessment'}
                </p>
                <p className="text-sm leading-relaxed text-slate-300">
                  {language === 'Tiếng Việt' 
                    ? 'Bạn đang duy trì một nhịp độ học tập rất ổn định. Kỹ năng Ghi nhớ của bạn đạt mức xuất sắc (90%), nhưng hãy chú ý dành thêm thời gian cho các bài tập Logic để cân bằng năng lực.'
                    : 'You are maintaining a very steady learning pace. Your Memory skills are excellent (90%), but pay attention to spending more time on Logic exercises to balance your abilities.'}
                </p>
              </div>
              <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">
                  {language === 'Tiếng Việt' ? 'Lời khuyên từ bạn đồng hành' : 'Companion Advice'}
                </p>
                <p className="text-sm leading-relaxed text-slate-300 italic">
                  {language === 'Tiếng Việt'
                    ? '"Chào bạn! Hôm nay mình thấy bạn học rất chăm chỉ. Đừng quên nghỉ ngơi 5 phút sau mỗi 25 phút học nhé. Mình tin bạn sẽ sớm làm chủ được môn Kế toán này!"'
                    : '"Hi there! I see you studied very hard today. Don\'t forget to rest for 5 minutes after every 25 minutes of study. I believe you will soon master this Accounting subject!"'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200">
            <PieChart size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-display font-bold text-slate-800">{dict.qualitative_title}</h3>
            <p className="text-slate-500 text-lg">{dict.qualitative_desc}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Radar Chart - Skill Profile */}
          <div className="lg:col-span-4 bg-white/80 backdrop-blur-xl p-10 rounded-[4rem] border border-white/20 shadow-2xl glass-morphism flex flex-col items-center justify-center min-h-[500px]">
            <h4 className="text-xl font-bold text-slate-800 mb-8 self-start flex items-center gap-3">
              <Zap className="text-brand-500" size={24} />
              {language === 'Tiếng Việt' ? 'Hồ sơ kỹ năng' : 'Skill Profile'}
            </h4>
            <div className="h-[350px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                  <Radar
                    name="Skills"
                    dataKey="A"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Learning Roadmap */}
          <div className="lg:col-span-4 bg-white/80 backdrop-blur-xl p-10 rounded-[4rem] border border-white/20 shadow-2xl glass-morphism space-y-8 ring-4 ring-brand-500/5">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-display font-bold text-slate-800 flex items-center gap-4">
                <MapIcon className="text-brand-500" size={28} />
                {language === 'Tiếng Việt' ? 'Lộ trình cá nhân' : 'Personal Roadmap'}
              </h3>
              <span className="px-4 py-1 bg-brand-50 text-brand-600 text-[10px] font-bold rounded-full border border-brand-100">{roadmapProgress}%</span>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 shadow-inner max-h-[300px] overflow-y-auto custom-scrollbar">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  {language === 'Tiếng Việt' ? 'Danh sách mục tiêu' : 'Goal List'}
                </p>
                <div className="space-y-4">
                  {tasks.map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => toggleTask(task.id)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[8px] transition-all",
                        task.completed ? "bg-emerald-500 text-white" : "border-2 border-slate-200 group-hover:border-brand-400"
                      )}>
                        {task.completed && "✓"}
                      </div>
                      <span className={cn(
                        "text-sm font-medium transition-all",
                        task.completed ? "text-slate-400 line-through" : "text-slate-600"
                      )}>
                        {task.task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${roadmapProgress}%` }}
                  className="h-full bg-brand-500 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Lesson Assessment */}
          <div className="lg:col-span-4 bg-white/80 backdrop-blur-xl p-10 rounded-[4rem] border border-white/20 shadow-2xl glass-morphism space-y-8 ring-4 ring-amber-500/5">
            <h3 className="text-2xl font-display font-bold text-slate-800 flex items-center gap-4">
              <Target className="text-amber-500" size={28} />
              {language === 'Tiếng Việt' ? 'Đánh giá tổng thể' : 'Overall Assessment'}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-amber-50/50 rounded-[2rem] border border-amber-100 shadow-sm">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Score</p>
                <p className="text-3xl font-display font-bold text-amber-700">{avgScore.toFixed(1)}</p>
              </div>
              <div className="p-5 bg-brand-50/50 rounded-[2rem] border border-brand-100 shadow-sm">
                <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1">Status</p>
                <p className="text-lg font-bold text-brand-700 leading-tight">{getStatus(avgScore)}</p>
              </div>
            </div>

            <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 shadow-inner">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">AI Qualitative Insight</p>
              <p className="text-sm text-slate-600 italic leading-relaxed font-medium">
                {language === 'Tiếng Việt' 
                  ? (avgScore >= 85 
                      ? '"Bạn đang thể hiện tư duy phản biện rất tốt thông qua các câu hỏi gợi mở. Hãy tiếp tục đào sâu vào các ví dụ thực tế để củng cố độ sâu kiến thức."'
                      : '"Bạn đang có tiến bộ, nhưng hãy chú ý dành thêm thời gian cho các bài tập gợi mở từ AI để rèn luyện tư duy Socratic sâu sắc hơn."')
                  : (avgScore >= 85
                      ? '"You are demonstrating excellent critical thinking through Socratic dialogue. Continue diving into real-world examples to strengthen your knowledge depth."'
                      : '"You are making progress, but pay attention to spending more time on AI-guided exercises to develop deeper Socratic thinking."')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
