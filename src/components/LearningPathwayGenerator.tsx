import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map, Sparkles, Loader2, Brain, Calendar, Target, Clock, Trophy, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generatePathway } from '@/src/lib/gemini';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';

const LANGUAGES_DICT: Record<string, any> = {
  "Tiếng Việt": {
    "header": "Lộ trình học tập Chuyên sâu",
    "desc": "Sử dụng AI để thiết kế kế hoạch học tập cá nhân hóa, tối ưu theo thời gian và trình độ của bạn.",
    "goal_label": "Mục tiêu học tập",
    "goal_placeholder": "Ví dụ: Học Kế toán trong 30 ngày, Ôn thi Luật kinh tế...",
    "duration_label": "Thời gian cam kết",
    "duration_placeholder": "Ví dụ: 2 tiếng/ngày, 10 tiếng/tuần...",
    "level_label": "Trình độ hiện tại",
    "generate_btn": "Thiết kế Lộ trình",
    "clear_btn": "Xóa lộ trình hiện tại",
    "generating": "Đang thiết kế lộ trình...",
    "status_thinking": "Đang phân tích mục tiêu...",
    "status_structuring": "Đang cấu trúc nội dung...",
    "status_scheduling": "Đang lập thời gian biểu...",
    "status_finalizing": "Đang hoàn thiện...",
    "companion_title": "Lời khuyên từ AI Đồng hành",
    "roadmap_title": "Lộ trình học tập chi tiết",
    "timetable_title": "Thời gian biểu đề xuất",
    "xp_earned": "Chúc mừng! Bạn nhận được 100 XP cho việc lập kế hoạch."
  },
  "English": {
    "header": "Pro Learning Pathway",
    "desc": "Use AI to design a personalized study plan, optimized for your time and level.",
    "goal_label": "Learning Goal",
    "goal_placeholder": "e.g., Learn Accounting in 30 days, Review Economic Law...",
    "duration_label": "Time Commitment",
    "duration_placeholder": "e.g., 2 hours/day, 10 hours/week...",
    "level_label": "Current Level",
    "generate_btn": "Design Pathway",
    "clear_btn": "Clear current pathway",
    "generating": "Designing pathway...",
    "status_thinking": "Analyzing goals...",
    "status_structuring": "Structuring content...",
    "status_scheduling": "Scheduling timetable...",
    "status_finalizing": "Finalizing...",
    "companion_title": "AI Companion's Advice",
    "roadmap_title": "Detailed Roadmap",
    "timetable_title": "Proposed Timetable",
    "xp_earned": "Congrats! You earned 100 XP for planning."
  }
};

export const LearningPathwayGenerator = () => {
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [status, setStatus] = useState<string[]>([]);
  const [language, setLanguage] = useState('Tiếng Việt');

  const dict = LANGUAGES_DICT[language] || LANGUAGES_DICT["Tiếng Việt"];

  // Hàm helper để tách nội dung Markdown dựa trên tiêu đề mà không sợ lỗi split
  const extractSection = (text: string, sectionTitle: string, nextSectionTitle?: string) => {
    if (!text) return "";
    const startIndex = text.indexOf(sectionTitle);
    if (startIndex === -1) return "";

    const contentStart = startIndex + sectionTitle.length;
    if (!nextSectionTitle) return text.substring(contentStart).trim();

    const endIndex = text.indexOf(nextSectionTitle);
    return endIndex !== -1 
      ? text.substring(contentStart, endIndex).trim() 
      : text.substring(contentStart).trim();
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('eduai_language') || 'Tiếng Việt';
    setLanguage(savedLanguage);
    const savedPathway = localStorage.getItem('eduai_pathway_pro');
    if (savedPathway) setResult(savedPathway);
  }, []);

  const handleGenerate = async () => {
    if (!goal.trim() || !duration.trim()) {
      toast.error(language === 'Tiếng Việt' ? 'Vui lòng nhập đầy đủ thông tin!' : 'Please fill in all fields!');
      return;
    }

    setLoading(true);
    setStatus([dict.status_thinking]);
    
    try {
      // Hiệu ứng chuyển trạng thái giả lập cho UX
      const statusTimers = [
        setTimeout(() => setStatus(prev => [...prev, dict.status_structuring]), 1500),
        setTimeout(() => setStatus(prev => [...prev, dict.status_scheduling]), 3500),
        setTimeout(() => setStatus(prev => [...prev, dict.status_finalizing]), 5500)
      ];

      const pathway = await generatePathway(goal, duration, level, language);
      
      if (!pathway) throw new Error("No data received");

      setResult(pathway);
      localStorage.setItem('eduai_pathway_pro', pathway);

      // Cập nhật XP an toàn
      const currentXP = parseInt(localStorage.getItem('eduai_xp') || '0');
      localStorage.setItem('eduai_xp', (currentXP + 100).toString());
      toast.success(dict.xp_earned);

      // Lưu lịch sử
      const history = JSON.parse(localStorage.getItem('eduai_study_history') || '[]');
      history.unshift({
        id: Date.now(),
        date: new Date().toISOString(),
        activity: language === 'Tiếng Việt' ? 'Lập lộ trình học tập' : 'Created Learning Pathway',
        result: goal.substring(0, 50) + "...",
        xp: 100
      });
      localStorage.setItem('eduai_study_history', JSON.stringify(history.slice(0, 50)));

      statusTimers.forEach(clearTimeout);
    } catch (error) {
      console.error(error);
      toast.error(language === 'Tiếng Việt' ? 'Lỗi kết nối AI, vui lòng thử lại!' : 'AI Connection Error!');
    } finally {
      setLoading(false);
      setStatus([]);
    }
  };

  const handleClear = () => {
    if (window.confirm(language === 'Tiếng Việt' ? "Xóa lộ trình này?" : "Clear this pathway?")) {
      setResult('');
      localStorage.removeItem('eduai_pathway_pro');
      setGoal('');
      setDuration('');
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex p-4 bg-brand-500 text-white rounded-3xl shadow-xl shadow-brand-200"
        >
          <Map size={40} />
        </motion.div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{dict.header}</h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">{dict.desc}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
        {/* Input Form */}
        <aside className="lg:col-span-4">
          <div className="bg-white/90 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-2xl sticky top-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Target size={16} className="text-brand-500" /> {dict.goal_label}
                </label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder={dict.goal_placeholder}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 min-h-[120px] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Clock size={16} className="text-brand-500" /> {dict.duration_label}
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder={dict.duration_placeholder}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Trophy size={16} className="text-brand-500" /> {dict.level_label}
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="Beginner">{language === 'Tiếng Việt' ? 'Mới bắt đầu' : 'Beginner'}</option>
                  <option value="Intermediate">{language === 'Tiếng Việt' ? 'Trung bình' : 'Intermediate'}</option>
                  <option value="Advanced">{language === 'Tiếng Việt' ? 'Nâng cao' : 'Advanced'}</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-4 bg-brand-500 text-white rounded-2xl font-bold shadow-xl shadow-brand-200 hover:bg-brand-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> {dict.generate_btn}</>}
              </button>

              {result && (
                <button onClick={handleClear} className="w-full py-2 text-slate-400 hover:text-red-500 text-sm font-medium transition-colors">
                  {dict.clear_btn}
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Result Display */}
        <main className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-white/80 border border-white/30 rounded-[2.5rem] p-12 shadow-2xl flex flex-col items-center justify-center min-h-[500px] space-y-6"
              >
                <Loader2 size={48} className="text-brand-500 animate-spin" />
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-slate-800">{dict.generating}</h3>
                  {status.map((s, i) => (
                    <p key={i} className="text-slate-400 text-sm flex items-center gap-2 justify-center italic">
                      <Sparkles size={14} className="text-brand-400" /> {s}
                    </p>
                  ))}
                </div>
              </motion.div>
            ) : result ? (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                
                {/* 1. Lời khuyên AI */}
                <section className="bg-brand-50 border border-brand-100 rounded-[2rem] p-8 relative overflow-hidden">
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-2 text-brand-600 font-bold">
                      <Brain size={20} /> {dict.companion_title}
                    </div>
                    <div className="prose prose-brand max-w-none italic text-brand-900/70">
                      <ReactMarkdown>
                        {extractSection(result, "### AI Companion's Encouragement") || "Hãy bắt đầu kế hoạch của bạn!"}
                      </ReactMarkdown>
                    </div>
                  </div>
                </section>

                {/* 2. Lộ trình chi tiết */}
                <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6 text-slate-800 font-bold text-xl">
                    <Calendar size={24} className="text-brand-500" /> {dict.roadmap_title}
                  </div>
                  <div className="prose prose-slate max-w-none prose-table:rounded-xl prose-table:overflow-hidden prose-th:bg-slate-50">
                    <ReactMarkdown>
                      {extractSection(result, "### Learning Roadmap", "### Weekly Timetable")}
                    </ReactMarkdown>
                  </div>
                </section>

                {/* 3. Thời gian biểu */}
                <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6 text-slate-800 font-bold text-xl">
                    <Clock size={24} className="text-brand-500" /> {dict.timetable_title}
                  </div>
                  <div className="prose prose-slate max-w-none">
                    <ReactMarkdown>
                      {extractSection(result, "### Weekly Timetable", "### AI Companion's Encouragement")}
                    </ReactMarkdown>
                  </div>
                </section>
              </motion.div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center text-slate-400">
                <Map size={48} className="mx-auto mb-4 opacity-20" />
                <p>Chưa có lộ trình nào. Hãy nhập mục tiêu để EduAI giúp bạn!</p>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
