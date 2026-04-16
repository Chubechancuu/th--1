import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Search, Calendar, MessageSquare, ArrowRight, Trophy } from 'lucide-react';

interface ChatLog {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

const LANGUAGES_DICT: Record<string, any> = {
  "Tiếng Việt": {
    "header": "Nhật ký học tập",
    "desc": "Xem lại toàn bộ lịch sử tương tác của bạn với AI.",
    "search_placeholder": "Tìm kiếm nội dung...",
    "no_logs": "Không tìm thấy lịch sử trò chuyện nào.",
    "table_role": "Vai trò",
    "table_content": "Nội dung",
    "table_action": "Hành động",
    "role_user": "Người dùng",
    "role_ai": "Gia sư AI",
    "details": "Chi tiết",
    "tab_chat": "Trò chuyện",
    "tab_history": "Thành tích",
    "table_date": "Ngày",
    "table_activity": "Hoạt động",
    "table_duration": "Thời lượng",
    "table_result": "Kết quả",
    "table_xp": "XP"
  },
  "English": {
    "header": "Learning Logs",
    "desc": "Review your entire interaction history with AI.",
    "search_placeholder": "Search content...",
    "no_logs": "No chat history found.",
    "table_role": "Role",
    "table_content": "Content",
    "table_action": "Action",
    "role_user": "User",
    "role_ai": "AI Tutor",
    "details": "Details",
    "tab_chat": "Chat",
    "tab_history": "Milestones",
    "table_date": "Date",
    "table_activity": "Activity",
    "table_duration": "Duration",
    "table_result": "Result",
    "table_xp": "XP"
  },
  "한국어": {
    "header": "학습 로그",
    "desc": "AI와의 전체 상호작용 기록을 검토하세요.",
    "search_placeholder": "콘텐츠 검색...",
    "no_logs": "채팅 기록을 찾을 수 없습니다.",
    "table_role": "역할",
    "table_content": "내용",
    "table_action": "작업",
    "role_user": "사용자",
    "role_ai": "AI 튜터",
    "details": "상세 정보",
    "tab_chat": "채팅",
    "tab_history": "학습 기록",
    "table_date": "날짜",
    "table_activity": "활동",
    "table_duration": "기간",
    "table_result": "결과",
    "table_xp": "XP"
  }
};

export function Logs({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [studyHistory, setStudyHistory] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'history'>('chat');
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState('Tiếng Việt');

  useEffect(() => {
    // Thống nhất key lấy ngôn ngữ
    const savedSettings = localStorage.getItem('eduai_settings');
    if (savedSettings) {
      setLanguage(JSON.parse(savedSettings).language || 'Tiếng Việt');
    }

    const savedLogs = localStorage.getItem('eduai_tutor_chat');
    if (savedLogs) setLogs(JSON.parse(savedLogs));

    const savedHistory = localStorage.getItem('eduai_study_history');
    if (savedHistory) setStudyHistory(JSON.parse(savedHistory));
  }, []);

  const dict = LANGUAGES_DICT[language] || LANGUAGES_DICT['Tiếng Việt'];

  // Logic lọc dữ liệu thông minh theo tab
  const filteredChat = logs.filter(log => 
    log.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHistory = studyHistory.filter(item => 
    item.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.result.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-8 px-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-display font-bold text-slate-800 flex items-center gap-4">
            <div className="p-3 bg-brand-500 text-white rounded-2xl shadow-lg shadow-brand-200">
              <History size={36} />
            </div>
            {dict.header}
          </h2>
          <p className="text-slate-500 text-xl ml-16">{dict.desc}</p>
        </div>
        
        <div className="flex bg-white/60 backdrop-blur-xl p-2 rounded-3xl shadow-xl border border-white/20 glass-morphism">
          <button
            onClick={() => setActiveSubTab('chat')}
            className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'chat' ? "bg-brand-500 text-white shadow-lg" : "text-slate-500 hover:text-brand-600"
            }`}
          >
            <MessageSquare size={18} />
            {dict.tab_chat}
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'history' ? "bg-brand-500 text-white shadow-lg" : "text-slate-500 hover:text-brand-600"
            }`}
          >
            <Trophy size={18} />
            {dict.tab_history}
          </button>
        </div>
      </header>

      <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[3.5rem] border border-white/20 shadow-2xl space-y-8 glass-morphism">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder={dict.search_placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-lg"
          />
        </div>

        <div className="overflow-x-auto rounded-[2rem] border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {activeSubTab === 'chat' ? (
                  <>
                    <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest">{dict.table_role}</th>
                    <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest">{dict.table_content}</th>
                    <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest text-right">{dict.table_action}</th>
                  </>
                ) : (
                  <>
                    <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest">{dict.table_date}</th>
                    <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest">{dict.table_activity}</th>
                    <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest">{dict.table_duration}</th>
                    <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest">{dict.table_result}</th>
                    <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest text-right">{dict.table_xp}</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {activeSubTab === 'chat' ? (
                filteredChat.length > 0 ? (
                  filteredChat.map((log, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                          log.role === 'user' ? "bg-slate-100 text-slate-600" : "bg-brand-100 text-brand-600"
                        }`}>
                          {log.role === 'user' ? dict.role_user : dict.role_ai}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-slate-600 line-clamp-2 max-w-2xl text-lg">{log.content}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => setActiveTab('tutor')}
                          className="p-3 text-slate-300 hover:text-brand-500 hover:bg-white rounded-xl transition-all"
                        >
                          <ArrowRight size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center text-slate-400 italic text-xl">{dict.no_logs}</td>
                  </tr>
                )
              ) : (
                filteredHistory.length > 0 ? (
                  filteredHistory.map((item, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-6 text-slate-500 font-medium">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="px-8 py-6 text-slate-800 font-bold">{item.activity}</td>
                      <td className="px-8 py-6 text-slate-500">{item.duration} min</td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
                          {item.result}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-brand-600 font-bold">+{item.xp} XP</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic text-xl">Chưa có thành tích nào được ghi nhận.</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
