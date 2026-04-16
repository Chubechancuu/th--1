import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map, Sparkles, Loader2, X, Brain, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generatePathway } from '@/src/lib/gemini';
import { toast } from 'sonner';

const LANGUAGES_DICT: Record<string, any> = {
  "Tiếng Việt": {
    "header": "Thiết kế lộ trình học tập",
    "desc": "AI sẽ xây dựng kế hoạch học tập chi tiết dựa trên mục tiêu và thời gian của bạn.",
    "goal_label": "Môn học / Mục tiêu",
    "goal_placeholder": "Ví dụ: Kế toán tài chính, Luật kinh tế...",
    "days_label": "Số ngày học",
    "level_label": "Trình độ",
    "level_beginner": "Mới bắt đầu",
    "level_intermediate": "Trung bình",
    "level_advanced": "Nâng cao",
    "btn_generate": "Tạo lộ trình ngay",
    "status_analyzing": "Đang phân tích mục tiêu...",
    "status_optimizing": "Đang tối ưu trình độ",
    "status_building": "Đang xây dựng nội dung...",
    "status_done": "Lộ trình đã sẵn sàng!",
    "status_error": "Không thể tạo lộ trình lúc này.",
    "clear_tooltip": "Xóa lộ trình",
    "companion_note": "Lời nhắn từ AI Đồng hành"
  },
  "English": {
    "header": "Learning Pathway",
    "desc": "AI builds a detailed study plan based on your goals and timeline.",
    "goal_label": "Subject / Goal",
    "goal_placeholder": "e.g., Financial Accounting, Economic Law...",
    "days_label": "Days",
    "level_label": "Level",
    "level_beginner": "Beginner",
    "level_intermediate": "Intermediate",
    "level_advanced": "Advanced",
    "btn_generate": "Generate Pathway",
    "status_analyzing": "Analyzing goal...",
    "status_optimizing": "Optimizing level...",
    "status_building": "Building content...",
    "status_done": "Roadmap is ready!",
    "status_error": "Failed to generate pathway.",
    "clear_tooltip": "Clear roadmap",
    "companion_note": "AI Companion's Note"
  },
  "한국어": {
    "header": "학습 경로 설계",
    "desc": "AI가 목표와 일정에 맞춰 상세한 학습 계획을 세워드립니다.",
    "goal_label": "과목 / 목표",
    "goal_placeholder": "예: 재무회계, 경제법...",
    "days_label": "학습 일수",
    "level_label": "수준",
    "level_beginner": "초보자",
    "level_intermediate": "중급자",
    "level_advanced": "상급자",
    "btn_generate": "경로 생성하기",
    "status_analyzing": "목표 분석 중...",
    "status_optimizing": "수준 최적화 중...",
    "status_building": "콘텐츠 구축 중...",
    "status_done": "학습 경로가 준비되었습니다!",
    "status_error": "경로를 생성할 수 없습니다.",
    "clear_tooltip": "경로 지우기",
    "companion_note": "AI 학습 도우미의 메시지"
  }
};

export function Pathway() {
  const [goal, setGoal] = useState('');
  const [days, setDays] = useState(7);
  const [level, setLevel] = useState('Beginner');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [status, setStatus] = useState<string[]>([]);
  const [language, setLanguage] = useState('Tiếng Việt');

  const dict = LANGUAGES_DICT[language] || LANGUAGES_DICT['Tiếng Việt'];

  useEffect(() => {
    const savedPathway = localStorage.getItem('eduai_pathway');
    if (savedPathway) setResult(savedPathway);

    const savedSettings = localStorage.getItem('eduai_settings');
    if (savedSettings) {
      setLanguage(JSON.parse(savedSettings).language || 'Tiếng Việt');
    }
  }, []);

  const handleGenerate = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    setStatus([dict.status_analyzing]);
    
    try {
      setTimeout(() => setStatus(prev => [...prev, dict.status_optimizing]), 1500);
      setTimeout(() => setStatus(prev => [...prev, dict.status_building]), 3000);
      
      const res = await generatePathway(goal, days.toString(), level, language);
      setResult(res);
      localStorage.setItem('eduai_pathway', res);
      
      // Record study history and XP
      const currentXp = parseInt(localStorage.getItem('eduai_xp') || '0');
      const newXp = currentXp + 100;
      localStorage.setItem('eduai_xp', newXp.toString());

      const history = JSON.parse(localStorage.getItem('eduai_study_history') || '[]');
      history.unshift({
        date: new Date().toISOString(),
        activity: language === 'Tiếng Việt' ? 'Tạo lộ trình học' : 'Create Learning Pathway',
        duration: 10,
        result: language === 'Tiếng Việt' ? 'Thành công' : 'Success',
        xp: 100
      });
      localStorage.setItem('eduai_study_history', JSON.stringify(history.slice(0, 50)));

      toast.success(dict.status_done);
    } catch (error) {
      toast.error(dict.status_error);
    } finally {
      setLoading(false);
      setStatus([]);
    }
  };

  const clearPathway = () => {
    setResult('');
    localStorage.removeItem('eduai_pathway');
  };

  const extractSection = (content: string, sectionName: string) => {
    const lines = content.split('\n');
    let section = '';
    let found = false;
    for (const line of lines) {
      if (line.toLowerCase().includes(sectionName.toLowerCase())) {
        found = true;
        continue;
      }
      if (found && line.startsWith('#')) break;
      if (found) section += line + '\n';
    }
    return section.trim();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-8 px-4">
      <header className="space-y-4">
        <h2 className="text-4xl font-display font-bold text-slate-800 flex items-center gap-4">
          <div className="p-3 bg-brand-500 text-white rounded-2xl shadow-lg shadow-brand-200">
            <Map size={36} />
          </div>
          {dict.header}
        </h2>
        <p className="text-slate-500 text-xl ml-16 max-w-2xl">{dict.desc}</p>
      </header>

      {!result ? (
        <div className="bg-white/80 backdrop-blur-2xl p-12 rounded-[4rem] border border-white/20 shadow-2xl space-y-10 glass-morphism">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-2">{dict.goal_label}</label>
              <input 
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder={dict.goal_placeholder}
                className="w-full px-8 py-5 rounded-[2rem] border border-slate-100 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all bg-slate-50/50 text-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-2">{dict.days_label}</label>
                <input 
                  type="number"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  min="1"
                  max="30"
                  className="w-full px-8 py-5 rounded-[2rem] border border-slate-100 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all bg-slate-50/50 text-xl"
                />
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-2">{dict.level_label}</label>
                <select 
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-8 py-5 rounded-[2rem] border border-slate-100 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all bg-slate-50/50 text-xl appearance-none cursor-pointer"
                >
                  <option value="Beginner">{dict.level_beginner}</option>
                  <option value="Intermediate">{dict.level_intermediate}</option>
                  <option value="Advanced">{dict.level_advanced}</option>
                </select>
              </div>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !goal.trim()}
            className="w-full py-6 bg-brand-500 text-white rounded-[2rem] font-bold text-2xl hover:bg-brand-600 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-2xl shadow-brand-200 flex items-center justify-center gap-4"
          >
            {loading ? <Loader2 className="animate-spin" size={32} /> : <Sparkles size={32} />}
            {dict.btn_generate}
          </button>

          {loading && (
            <div className="space-y-4">
              {status.map((s, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 text-slate-500 font-medium"
                >
                  <div className="w-2 h-2 bg-brand-500 rounded-full animate-ping" />
                  {s}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          <div className="flex justify-end">
            <button 
              onClick={clearPathway}
              className="p-4 bg-white text-slate-400 hover:text-red-500 rounded-2xl shadow-xl border border-white/20 transition-all flex items-center gap-2 font-bold"
              title={dict.clear_tooltip}
            >
              <X size={24} />
              {language === 'Tiếng Việt' ? 'Xóa lộ trình' : 'Clear Roadmap'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <div className="bg-white/80 backdrop-blur-2xl p-12 rounded-[4rem] border border-white/20 shadow-2xl glass-morphism">
                <div className="markdown-body prose-2xl max-w-none">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="bg-brand-500 p-10 rounded-[4rem] text-white shadow-2xl shadow-brand-200 space-y-6 relative overflow-hidden group">
                <Brain className="absolute -right-8 -top-8 text-white/10 w-48 h-48 group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10 space-y-4">
                  <h3 className="text-2xl font-display font-bold flex items-center gap-3">
                    <Sparkles size={28} />
                    {dict.companion_note}
                  </h3>
                  <p className="text-brand-50 leading-relaxed text-xl italic font-medium">
                    {extractSection(result, 'Advice') || extractSection(result, 'Lời nhắn') || "Hãy kiên trì theo đuổi lộ trình này, bạn sẽ thấy sự khác biệt!"}
                  </p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[4rem] border border-white/20 shadow-2xl glass-morphism space-y-6">
                <h3 className="text-2xl font-display font-bold text-slate-800 flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-500" size={28} />
                  {language === 'Tiếng Việt' ? 'Mục tiêu tuần' : 'Weekly Goals'}
                </h3>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full border-2 border-slate-200" />
                      <span className="text-slate-600 font-medium">Hoàn thành bài học {i}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
