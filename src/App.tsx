import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './components/Dashboard';
import { LearningPathwayGenerator } from './components/LearningPathwayGenerator';
import { Tutor } from './components/Tutor';
import { Solver } from './components/Solver';
import { Settings } from './components/Settings';
import { Logs } from './components/Logs';
import { Progress } from './components/Progress';
import { Pomodoro } from './components/Pomodoro';
import { FloatingPomodoro } from './components/FloatingPomodoro';
import { Practice } from './components/Practice';
import { Login } from './components/Login';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Construction } from 'lucide-react';
import { cn } from './lib/utils';
import { Toaster } from 'sonner';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const session = localStorage.getItem('eduai_session');
    return session ? JSON.parse(session).loggedIn : false;
  });

  // --- HỆ THỐNG BIẾN & BỘ NHỚ ---
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState([]);
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const quickTags = ["Định khoản nợ/có", "Luật thương mại 2005", "Thuế TNCN"];

  // Tải nhật ký cũ từ máy khi mở App
  useEffect(() => {
    const saved = localStorage.getItem('edu_logs');
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        console.error("Lỗi đọc nhật ký:", e);
      }
    }
  }, []);

  // Lưu nhật ký mới mỗi khi có thay đổi
  useEffect(() => {
    localStorage.setItem('edu_logs', JSON.stringify(logs));
  }, [logs]);

  // --- HÀM XỬ LÝ AI THẬT ---
  const handleAskAI = async () => {
    if (!input) return;
    setIsAiLoading(true);
    setAiResponse("Đang truy xuất dữ liệu Luật & Kế toán...");

    try {
      // Lấy Key từ Environment Variables trên Vercel
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Bạn là chuyên gia Luật và Kế toán Việt Nam. Hãy trả lời ngắn gọn: ${input}` }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const result = data.candidates[0].content.parts[0].text;
        setAiResponse(result);
        
        // Tự động lưu vào tab Nhật ký (Logs)
        const newEntry = { 
          id: Date.now(), 
          content: `Hỏi: ${input} | Đáp: ${result.substring(0, 50)}...`, 
          time: new Date().toLocaleString('vi-VN') 
        };
        setLogs(prevLogs => [newEntry, ...prevLogs]);
      } else {
        throw new Error("Không nhận được phản hồi");
      }

    } catch (error) {
      setAiResponse("Lỗi kết nối AI. Hãy đảm bảo bạn đã thêm API Key vào Vercel Settings.");
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- ĐIỀU KIỆN ĐĂNG NHẬP ---
  if (!isLoggedIn) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <Login onLogin={() => setIsLoggedIn(true)} />
      </>
    );
  }

  // --- ĐIỀU HƯỚNG NỘI DUNG ---
  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <Dashboard setActiveTab={setActiveTab} />;
      case 'pathway': return <LearningPathwayGenerator />;
      case 'tutor': return <Tutor />;
      case 'practice': return <Practice />;
      case 'solver': return <Solver />;
      case 'logs': return <Logs setActiveTab={setActiveTab} logs={logs} setLogs={setLogs} />;
      case 'progress': return <Progress />;
      case 'pomodoro': return <Pomodoro />;
      case 'settings': return <Settings />;
      default: return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Toaster position="top-right" richColors />
      <FloatingPomodoro />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AnimatePresence>
          {activeTab !== 'tutor' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 64, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden z-30"
            >
              <TopBar setActiveTab={setActiveTab} />
            </motion.div>
          )}
        </AnimatePresence>
        
        <main className={cn(
          "flex-1 overflow-y-auto transition-all duration-300",
          activeTab === 'tutor' ? "p-0" : "p-8 lg:p-12"
        )}>
          <div className={cn(
            "mx-auto transition-all duration-300",
            activeTab === 'tutor' ? "max-w-none h-full" : "max-w-6xl"
          )}>
            
            {/* THANH TRA CỨU NHANH AI (Chỉ hiện khi không ở tab Tutor) */}
            {activeTab !== 'tutor' && (
              <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="flex gap-2 mb-3 flex-wrap">
                  {quickTags.map(tag => (
                    <button 
                      key={tag} 
                      onClick={() => setInput(tag)}
                      className="text-[10px] md:text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors border border-blue-100"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Hỏi nhanh về Luật thương mại, định khoản..." 
                    className="flex-1 text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button 
                    onClick={handleAskAI}
                    disabled={isAiLoading || !input}
                    className={cn(
                      "text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md",
                      isAiLoading || !input ? "bg-slate-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                    )}
                  >
                    {isAiLoading ? '...' : 'Hỏi AI'}
                  </button>
                </div>
                {aiResponse && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-slate-700 border-l-4 border-blue-500"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <strong className="text-blue-700">Trợ lý AI phản hồi:</strong>
                      <button onClick={() => setAiResponse('')} className="text-slate-400 hover:text-slate-600">×</button>
                    </div>
                    {aiResponse}
                  </motion.div>
                )}
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
