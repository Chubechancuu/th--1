import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, User, Bot, Loader2, X, Mic, MicOff, Volume2, VolumeX, Trash2, Sparkles, TrendingUp, Clock, Target, RefreshCw, FileText, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getSocraticResponse, generateSyncQuestion, generateConversationSummary } from '@/src/lib/gemini';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const LANGUAGES_DICT: Record<string, any> = {
  "Tiếng Việt": {
    "welcome": "Chào mừng bạn đến với EduAI!",
    "tutor_header": "Gia sư Socratic",
    "input_placeholder": "Hỏi gia sư về bài học hôm nay...",
    "status": "Đang soạn bài giảng...",
    "tts_lang": "vi-VN",
    "stt_lang": "vi-VN",
    "zen_mode": "Zen Mode",
    "zen_desc": "Môi trường học tập tập trung cao độ.",
    "start_lesson": "Bắt đầu buổi học",
    "start_desc": "Hãy đặt một câu hỏi về bài học của bạn. Tôi sẽ đồng hành cùng bạn tìm ra lời giải.",
    "ai_speaking": "AI đang nói",
    "assessment": "Đánh giá bài học",
    "understanding": "Mức độ hiểu bài",
    "advice": "Bạn nên tập trung hơn vào các câu hỏi gợi mở từ AI.",
    "clear_confirm": "Bạn có chắc chắn muốn xóa lịch sử trò chuyện?",
    "clear_success": "Đã xóa lịch sử trò chuyện",
    "pathway_title": "Lộ trình học tập",
    "phase1": "Giai đoạn 1: Nắm bắt khái niệm",
    "phase1_desc": "Hiểu định nghĩa cơ bản",
    "phase2": "Giai đoạn 2: Vận dụng thực tế",
    "phase2_desc": "Giải bài tập ví dụ",
    "phase3": "Giai đoạn 3: Tổng hợp & Đánh giá",
    "phase3_desc": "Hoàn thành bài kiểm tra tuần",
    "complete_session": "Hoàn thành phiên học",
    "session_recorded": "Đã ghi nhận tiến độ!",
    "ai_tone": "Tông giọng",
    "tone_friendly": "Thân thiện",
    "tone_formal": "Trang trọng",
    "tone_encouraging": "Khích lệ",
    "sync_success": "Đã đồng bộ kiến thức vào Kho ôn luyện!"
  },
  "English": {
    "welcome": "Welcome to EduAI!",
    "tutor_header": "Socratic Tutor",
    "input_placeholder": "Ask the tutor about today's lesson...",
    "status": "Thinking...",
    "tts_lang": "en-US",
    "stt_lang": "en-US",
    "zen_mode": "Zen Mode",
    "zen_desc": "High-focus learning environment.",
    "start_lesson": "Start Lesson",
    "start_desc": "Ask a question about your lesson. I'll help you find the answer.",
    "ai_speaking": "AI is speaking",
    "assessment": "Lesson Assessment",
    "understanding": "Understanding Level",
    "advice": "You should focus more on the guiding questions from the AI.",
    "clear_confirm": "Are you sure you want to clear chat history?",
    "clear_success": "Chat history cleared",
    "pathway_title": "Learning Pathway",
    "phase1": "Phase 1: Concept Mastery",
    "phase1_desc": "Understand basic definitions",
    "phase2": "Phase 2: Practical Application",
    "phase2_desc": "Solve example exercises",
    "phase3": "Phase 3: Synthesis & Evaluation",
    "phase3_desc": "Complete weekly assessment",
    "complete_session": "Complete Session",
    "session_recorded": "Progress recorded!",
    "ai_tone": "AI Tone",
    "tone_friendly": "Friendly",
    "tone_formal": "Formal",
    "tone_encouraging": "Encouraging",
    "sync_success": "Knowledge synced to Practice Center!"
  },
  "Français": {
    "welcome": "Bienvenue sur EduAI !",
    "tutor_header": "Tuteur Socratique",
    "input_placeholder": "Demandez au tuteur sur la leçon d'aujourd'hui...",
    "status": "En train de réfléchir...",
    "tts_lang": "fr-FR",
    "stt_lang": "fr-FR",
    "zen_mode": "Mode Zen",
    "zen_desc": "Environnement d'apprentissage à haute concentration.",
    "start_lesson": "Commencer la leçon",
    "start_desc": "Posez une question sur votre leçon. Je vous aiderai à trouver la réponse.",
    "ai_speaking": "L'IA parle",
    "assessment": "Évaluation de la leçon",
    "understanding": "Niveau de compréhension",
    "advice": "Bạn nên tập trung hơn vào các câu hỏi gợi mở từ AI.",
    "clear_confirm": "Êtes-vous sûr de vouloir effacer l'historique ?",
    "clear_success": "Historique effacé",
    "sync_success": "Connaissances synchronisées avec le centre de pratique !"
  },
  "日本語": {
    "welcome": "EduAIへようこそ！",
    "tutor_header": "ソクラテス式チューター",
    "input_placeholder": "今日のレッスンについてチューターに聞いてください...",
    "status": "考え中...",
    "tts_lang": "ja-JP",
    "stt_lang": "ja-JP",
    "zen_mode": "禅モード",
    "zen_desc": "集中力の高い学習環境。",
    "start_lesson": "レッスン開始",
    "start_desc": "レッスンについて質問してください。答えを見つけるお手伝いをします。",
    "ai_speaking": "AIが話しています",
    "assessment": "レッスン評価",
    "understanding": "理解度",
    "advice": "AIからの誘導的な質問にもっと集中する必要があります。",
    "clear_confirm": "チャット履歴を消去してもよろしいですか？",
    "clear_success": "チャット履歴が消 cư されました",
    "sync_success": "知識が練習センターに同期されました！"
  },
  "Deutsch": {
    "welcome": "Willkommen bei EduAI!",
    "tutor_header": "Sokratischer Tutor",
    "input_placeholder": "Fragen Sie den Tutor nach der heutigen Lektion...",
    "status": "Überlegen...",
    "tts_lang": "de-DE",
    "stt_lang": "de-DE",
    "zen_mode": "Zen-Modus",
    "zen_desc": "Hochkonzentrierte Lernumgebung.",
    "start_lesson": "Lektion starten",
    "start_desc": "Stellen Sie eine Frage zu Ihrer Lektion. Ich helfe Ihnen, die Antwort zu finden.",
    "ai_speaking": "KI spricht",
    "assessment": "Lektionsbewertung",
    "understanding": "Verständnisniveau",
    "advice": "Sie sollten sich mehr auf die leitenden Fragen der KI konzentrieren.",
    "clear_confirm": "Sind Sie sicher, dass Sie den Chat-Verlauf löschen möchten?",
    "clear_success": "Chat-Verlauf gelöscht",
    "pathway_title": "Lernpfad",
    "phase1": "Phase 1: Konzeptbeherrschung",
    "phase1_desc": "Grundlegende Definitionen verstehen",
    "phase2": "Phase 2: Praktische Anwendung",
    "phase2_desc": "Beispielaufgaben lösen",
    "phase3": "Phase 3: Synthese & Auswertung",
    "phase3_desc": "Wöchentliche Bewertung abschließen",
    "complete_session": "Sitzung abschließen",
    "session_recorded": "Fortschritt aufgezeichnet!",
    "ai_tone": "KI-Tonfall",
    "tone_friendly": "Freundlich",
    "tone_formal": "Formal",
    "tone_encouraging": "Ermutigend",
    "sync_success": "Wissen mit dem Practice Center synchronisiert!"
  },
  "Español": {
    "welcome": "¡Bienvenido a EduAI!",
    "tutor_header": "Tutor Socrático",
    "input_placeholder": "Pregunta al tutor sobre la lección de hoy...",
    "status": "Pensando...",
    "tts_lang": "es-ES",
    "stt_lang": "es-ES",
    "zen_mode": "Modo Zen",
    "zen_desc": "Entorno de aprendizaje de alta concentración.",
    "start_lesson": "Iniciar lección",
    "start_desc": "Haz una pregunta sobre tu lección. Te ayudaré a encontrar la respuesta.",
    "ai_speaking": "La IA está hablando",
    "assessment": "Evaluación de la lección",
    "understanding": "Nivel de comprensión",
    "advice": "Deberías concentrarte más en las preguntas orientadoras de la IA.",
    "clear_confirm": "¿Estás seguro de que quieres borrar el historial de chat?",
    "clear_success": "Historial de chat borrado",
    "pathway_title": "Ruta de aprendizaje",
    "phase1": "Fase 1: Dominio del concepto",
    "phase1_desc": "Comprender definiciones básicas",
    "phase2": "Fase 2: Aplicación práctica",
    "phase2_desc": "Resolver ejercicios de ejemplo",
    "phase3": "Fase 3: Síntesis y evaluación",
    "phase3_desc": "Completar evaluación semanal",
    "complete_session": "Completar sesión",
    "session_recorded": "¡Progreso registrado!",
    "ai_tone": "Tono de IA",
    "tone_friendly": "Amistoso",
    "tone_formal": "Formal",
    "tone_encouraging": "Alentador",
    "sync_success": "¡Conocimiento sincronizado con el Centro de Práctica!"
  },
  "한국어": {
    "welcome": "EduAI에 오신 것을 환영합니다!",
    "tutor_header": "소크라테스식 튜터",
    "input_placeholder": "오늘 레슨에 대해 튜터에게 물어보세요...",
    "status": "생각 중...",
    "tts_lang": "ko-KR",
    "stt_lang": "ko-KR",
    "zen_mode": "젠 모드",
    "zen_desc": "고도의 집중력을 발휘할 수 있는 학습 환경.",
    "start_lesson": "레슨 시작",
    "start_desc": "레슨에 대해 질문해 주세요. 답을 찾을 수 있도록 도와드리겠습니다.",
    "ai_speaking": "AI가 말하고 있습니다",
    "assessment": "레슨 평가",
    "understanding": "이해도 수준",
    "advice": "AI의 유도 질문에 더 집중해야 합니다.",
    "clear_confirm": "채팅 기록을 삭제하시겠습니까?",
    "clear_success": "채팅 기록이 삭제되었습니다",
    "pathway_title": "학습 경로",
    "phase1": "1단계: 개념 마스터",
    "phase1_desc": "기본 정의 이해",
    "phase2": "2단계: 실전 적용",
    "phase2_desc": "예제 문제 풀이",
    "phase3": "3단계: 종합 및 평가",
    "phase3_desc": "주간 평가 완료",
    "complete_session": "세션 완료",
    "session_recorded": "진도가 기록되었습니다!",
    "ai_tone": "AI 톤",
    "tone_friendly": "친절함",
    "tone_formal": "격식 있음",
    "tone_encouraging": "격려함",
    "sync_success": "지식이 연습 센터에 동기화되었습니다!"
  }
};

export function Tutor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('Tiếng Việt');
  const [aiTone, setAiTone] = useState('Friendly');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const dict = LANGUAGES_DICT[language] || LANGUAGES_DICT['Tiếng Việt'];

  useEffect(() => {
    const savedSettings = localStorage.getItem('eduai_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setLanguage(parsed.language || 'Tiếng Việt');
      setAiTone(parsed.aiTone || 'Friendly');
      setDifficulty(parsed.difficulty || 'Intermediate');
    }

    const savedChat = localStorage.getItem('eduai_tutor_chat');
    if (savedChat) {
      try {
        setMessages(JSON.parse(savedChat));
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('eduai_tutor_chat', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const syncToPractice = async (content: string) => {
    try {
      const syncResult = await generateSyncQuestion(content, language);
      if (syncResult && syncResult.includes('|')) {
        const [q, a] = syncResult.split('|').map(s => s.trim());
        const syncPractice = JSON.parse(localStorage.getItem('eduai_sync_practice') || '[]');
        syncPractice.unshift({
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          topic: messages.length > 0 ? messages[0].content.slice(0, 30) : 'General',
          question: q,
          answer: a,
          reviewed: false
        });
        localStorage.setItem('eduai_sync_practice', JSON.stringify(syncPractice.slice(0, 100)));
        toast.success(dict.sync_success, { icon: <RefreshCw className="text-green-500" size={18} /> });
      }
    } catch (error) {
      console.error('Sync Error:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { role: 'user', content: input, timestamp };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    try {
      const response = await getSocraticResponse(input, updatedMessages, difficulty, language, aiTone);
      const assistantMsg: Message = { role: 'assistant', content: response, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, assistantMsg]);

      // Record study history and XP
      const currentXp = parseInt(localStorage.getItem('eduai_xp') || '0');
      const newXp = currentXp + 50;
      localStorage.setItem('eduai_xp', newXp.toString());

      const history = JSON.parse(localStorage.getItem('eduai_study_history') || '[]');
      history.unshift({
        date: new Date().toISOString(),
        activity: language === 'Tiếng Việt' ? 'Học cùng AI' : 'Study with AI',
        duration: 30,
        result: language === 'Tiếng Việt' ? 'Hoàn thành tốt' : 'Well completed',
        xp: 50
      });
      localStorage.setItem('eduai_study_history', JSON.stringify(history.slice(0, 50)));

      // Sync to Practice Center
      syncToPractice(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (confirm(dict.clear_confirm)) {
      setMessages([]);
      setSummary('');
      setShowSummary(false);
      localStorage.removeItem('eduai_tutor_chat');
      toast.info(dict.clear_success);
    }
  };

  const handleGenerateSummary = async () => {
    if (messages.length < 2) return;
    setSummaryLoading(true);
    setShowSummary(true);
    try {
      const res = await generateConversationSummary(messages.map(m => ({ role: m.role, content: m.content })), language);
      if (res) setSummary(res);
    } catch (error) {
      toast.error('Error generating summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Trình duyệt không hỗ trợ nhận diện giọng nói');
      return;
    }
    if (isListening) {
      setIsListening(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = dict.stt_lang;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        toast.success('Đã nhận diện', { description: transcript });
      };
      recognition.start();
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-transparent overflow-hidden relative p-4 lg:p-10 gap-10">
      <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-[20px] border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[4rem] overflow-hidden relative glass-morphism">
        <header className="p-8 lg:p-10 border-b border-white/20 bg-white/30 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-brand-200 rotate-3">
              <Bot size={40} />
            </div>
            <div>
              <div className="flex items-center gap-4">
                <h2 className="font-display font-bold text-3xl text-slate-800 tracking-tight">{dict.tutor_header}</h2>
                <span className="px-3 py-1 bg-white/50 backdrop-blur-sm text-brand-600 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-white/50 shadow-sm">v3.0 Master OS</span>
              </div>
              <p className="text-lg text-slate-500/80 mt-1 font-medium">{dict.zen_desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-slate-50/50 p-2 rounded-2xl border border-slate-100/50 shadow-inner">
              {messages.length >= 4 && (
                <button 
                  onClick={handleGenerateSummary}
                  className="px-4 py-2 bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-200"
                >
                  <Lightbulb size={14} />
                  {language === 'Tiếng Việt' ? 'Tóm tắt bài học' : 'Smart Summary'}
                </button>
              )}
              <div className="flex items-center gap-2 px-3">
                <Sparkles size={18} className="text-brand-500" />
                <select 
                  value={aiTone}
                  onChange={(e) => {
                    const newTone = e.target.value;
                    setAiTone(newTone);
                    const savedSettings = localStorage.getItem('eduai_settings');
                    const settings = savedSettings ? JSON.parse(savedSettings) : {};
                    localStorage.setItem('eduai_settings', JSON.stringify({ ...settings, aiTone: newTone }));
                    toast.success(`${dict.ai_tone}: ${e.target.options[e.target.selectedIndex].text}`);
                  }}
                  className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer"
                >
                  <option value="Friendly">{dict.tone_friendly}</option>
                  <option value="Formal">{dict.tone_formal}</option>
                  <option value="Encouraging">{dict.tone_encouraging}</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleClear}
              className="p-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm border border-transparent hover:border-red-100"
              title="Xóa lịch sử chat"
            >
              <Trash2 size={28} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 lg:p-16 space-y-12 bg-white/40 scroll-smooth custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-10 opacity-50">
              <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-2xl border border-white/20">
                <MessageSquare size={96} className="text-slate-200" />
              </div>
              <div className="max-w-lg">
                <p className="text-4xl font-display font-bold text-slate-800">{dict.start_lesson}</p>
                <p className="text-xl text-slate-500 mt-4 leading-relaxed">{dict.start_desc}</p>
              </div>
            </div>
          )}
          
          <AnimatePresence initial={false}>
            {showSummary && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="max-w-[90%] mx-auto mb-12"
              >
                <div className="bg-amber-50/80 backdrop-blur-xl p-10 rounded-[3.5rem] border border-amber-200 shadow-xl relative overflow-hidden">
                  <button 
                    onClick={() => setShowSummary(false)}
                    className="absolute top-6 right-6 p-2 text-amber-400 hover:text-amber-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                      <Lightbulb size={28} />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-amber-900">
                      {language === 'Tiếng Việt' ? 'Tóm tắt kiến thức cốt lõi' : 'Core Knowledge Summary'}
                    </h3>
                  </div>
                  {summaryLoading ? (
                    <div className="flex items-center gap-4 py-8">
                      <Loader2 className="animate-spin text-amber-500" size={32} />
                      <p className="text-amber-700 text-xl font-medium animate-pulse">AI đang đúc kết kiến thức...</p>
                    </div>
                  ) : (
                    <div className="markdown-body prose-xl text-amber-900">
                      <ReactMarkdown>{summary}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-10 max-w-[90%] mx-auto",
                  msg.role === 'user' ? "flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl",
                  msg.role === 'user' ? "bg-slate-900 text-white" : "bg-brand-500 text-white"
                )}>
                  {msg.role === 'user' ? <User size={28} /> : <Bot size={28} />}
                </div>
                <div className={cn(
                  "p-10 rounded-[3.5rem] text-xl leading-relaxed shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] group relative flex-1",
                  msg.role === 'user' 
                    ? "bg-slate-900/90 backdrop-blur-md text-white rounded-tr-none border border-white/10" 
                    : "bg-white/60 backdrop-blur-xl text-slate-700 border border-white/40 rounded-tl-none"
                )}>
                  <div className="markdown-body prose-2xl max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  <div className={cn(
                    "mt-4 flex items-center justify-between",
                    msg.role === 'user' ? "flex-row-reverse" : ""
                  )}>
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                      {msg.timestamp}
                    </div>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => {
                          const savedNotes = JSON.parse(localStorage.getItem('eduai_notes') || '[]');
                          const newNote = {
                            id: Date.now().toString(),
                            content: msg.content,
                            date: new Date().toLocaleDateString(language === 'Tiếng Việt' ? 'vi-VN' : 'en-US'),
                            topic: messages[0]?.content.slice(0, 30) || 'General'
                          };
                          localStorage.setItem('eduai_notes', JSON.stringify([newNote, ...savedNotes].slice(0, 50)));
                          toast.success(language === 'Tiếng Việt' ? 'Đã lưu vào ghi chú' : 'Saved to notes');
                        }}
                        className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                        title="Lưu vào ghi chú"
                      >
                        <Sparkles size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {loading && (
            <div className="flex gap-8 max-w-[90%] mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-brand-500 text-white flex items-center justify-center animate-pulse shadow-xl">
                <Bot size={28} />
              </div>
              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] rounded-tl-none border border-white/20 shadow-2xl flex items-center gap-4">
                <Loader2 className="animate-spin text-brand-500" size={32} />
                <span className="text-slate-600 text-xl font-bold animate-pulse">{dict.status}</span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <div className="p-10 lg:p-14 bg-white/60 border-t border-white/20 relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-4 py-1 bg-white/80 backdrop-blur-md rounded-full border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest shadow-sm">
            Session started at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="relative max-w-5xl mx-auto flex gap-8">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Đang nghe..." : dict.input_placeholder}
                className={cn(
                  "w-full pl-12 pr-28 py-8 rounded-[3rem] border border-slate-200 focus:ring-[12px] focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all shadow-2xl text-2xl bg-white/90",
                  isListening && "border-brand-500 ring-[12px] ring-brand-500/10 bg-white"
                )}
              />
              <button
                onClick={toggleListening}
                className={cn(
                  "absolute right-6 top-4 bottom-4 w-20 rounded-[2rem] flex items-center justify-center transition-all shadow-sm",
                  isListening 
                    ? "bg-red-500 text-white animate-pulse" 
                    : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-200"
                )}
                title={isListening ? "Dừng nghe" : "Nói để nhập văn bản"}
              >
                {isListening ? <MicOff size={36} /> : <Mic size={36} />}
              </button>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="w-28 bg-brand-500 text-white rounded-[3rem] flex items-center justify-center hover:bg-brand-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-2xl shadow-brand-200"
            >
              <Send size={40} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
