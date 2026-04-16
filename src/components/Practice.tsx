import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, BookOpen, PenTool, Archive, Sparkles, Loader2, ChevronRight, CheckCircle2, History, Trophy, Star, Award, Zap, Send, HelpCircle, ListOrdered, RefreshCw, Search, Filter, Trash2, Check, Clock, MessageSquare, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateExample, generateExercise, generateChallenge, generateQuizQuestion, getSocraticResponse, generateSocraticHint } from '@/src/lib/gemini';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  topic: string;
  content: string;
  type: string;
  date: string;
  level?: string;
}

const LANGUAGES_DICT: Record<string, any> = {
  "Tiếng Việt": {
    "header": "Trung tâm Ôn luyện",
    "desc": "Biến lý thuyết thành kỹ năng qua ví dụ và bài tập thực tế.",
    "tab_learn": "Học & Ví dụ",
    "tab_challenge": "Thử thách XP",
    "tab_streak": "Chuỗi 50 câu",
    "tab_sync": "Kho Ôn luyện Đồng bộ",
    "tab_archive": "Kho Lưu trữ",
    "search_placeholder": "Tìm kiếm câu hỏi hoặc chủ đề...",
    "filter_topic": "Lọc theo chủ đề",
    "filter_date": "Lọc theo ngày",
    "all_topics": "Tất cả chủ đề",
    "all_dates": "Tất cả ngày",
    "mark_reviewed": "Đánh dấu đã ôn tập",
    "delete_confirm": "Bạn có chắc chắn muốn xóa câu hỏi này?",
    "sync_desc": "Các câu hỏi dưới đây được tự động tạo ra từ những gì bạn đã trò chuyện với Gia sư.",
    "empty_sync": "Chưa có dữ liệu đồng bộ. Hãy trò chuyện với Gia sư trước!",
    "topic_label": "Chủ đề học tập",
    "topic_placeholder": "Ví dụ: Kế toán định khoản, AI...",
    "level_label": "Chọn cấp độ",
    "btn_example": "Tạo 5 Ví dụ chuyên sâu",
    "btn_challenge": "Bắt đầu Thử thách",
    "btn_streak": "Bắt đầu Chuỗi 50 câu",
    "tip_title": "Mẹo ôn tập",
    "tip_desc": "Sử dụng phương pháp Spaced Repetition: Xem lại các bài tập đã lưu sau 1 ngày, 3 ngày và 7 ngày để kiến thức khắc sâu vào trí nhớ dài hạn.",
    "empty_archive": "Bạn chưa có bài tập nào được lưu.",
    "ready_title": "Sẵn sàng tạo nội dung",
    "ready_desc": "Nhập chủ đề và nhấn nút để bắt đầu học tập thông minh.",
    "loading": "AI đang biên soạn nội dung...",
    "example_subtitle": "Ví dụ thực tế chuyên sâu",
    "challenge_subtitle": "Thử thách tư duy",
    "streak_subtitle": "Chuỗi câu hỏi liên tục",
    "toast_example": "Đã tạo 5 ví dụ thực tế!",
    "toast_challenge": "Đã tạo thử thách mới!",
    "toast_xp": "Chúc mừng! Bạn nhận được {xp} XP",
    "toast_desc": "Nội dung đã được lưu vào kho ôn tập.",
    "date_prefix": "Ngày tạo: ",
    "levels": ["Cơ bản", "Trung bình", "Nâng cao"],
    "achievement": "Thành tựu",
    "rank": "Hạng: ",
    "xp_label": "Kinh nghiệm",
    "submit": "Nộp bài",
    "next": "Câu tiếp theo",
    "your_answer": "Câu trả lời của bạn...",
    "correct_ans": "Đáp án đúng:",
    "explanation": "Phân tích chi tiết:",
    "streak_complete": "Chúc mừng! Bạn đã hoàn thành chuỗi 50 câu!",
    "ranks": {
      "beginner": "🌱 Tập sự",
      "warrior": "⚔️ Chiến binh",
      "scholar": "🎓 Học giả",
      "master": "🧙 Bậc thầy"
    }
  },
  "English": {
    "header": "Practice Center",
    "desc": "Turn theory into skills through real-world examples and exercises.",
    "tab_learn": "Learn & Examples",
    "tab_challenge": "XP Challenge",
    "tab_streak": "50-Question Streak",
    "tab_sync": "Synced Practice Store",
    "tab_archive": "Archive",
    "search_placeholder": "Search questions or topics...",
    "filter_topic": "Filter by topic",
    "filter_date": "Filter by date",
    "all_topics": "All topics",
    "all_dates": "All dates",
    "mark_reviewed": "Mark as reviewed",
    "delete_confirm": "Are you sure you want to delete this question?",
    "sync_desc": "These questions are automatically generated from your conversations with the Tutor.",
    "empty_sync": "No synced data yet. Chat with the Tutor first!",
    "topic_label": "Study Topic",
    "topic_placeholder": "e.g., Accounting, AI, Physics...",
    "level_label": "Select Level",
    "btn_example": "Generate 5 Deep Examples",
    "btn_challenge": "Start Challenge",
    "btn_streak": "Start 50-Question Streak",
    "tip_title": "Study Tip",
    "tip_desc": "Use Spaced Repetition: Review saved exercises after 1, 3, and 7 days to enhance long-term memory.",
    "empty_archive": "No exercises saved yet.",
    "ready_title": "Ready to Generate",
    "ready_desc": "Enter a topic and click the button to start smart learning.",
    "loading": "AI is composing content...",
    "example_subtitle": "Deep Real-world Case Study",
    "challenge_subtitle": "Thinking Challenge",
    "streak_subtitle": "Continuous Question Streak",
    "toast_example": "5 Examples generated!",
    "toast_challenge": "New challenge created!",
    "toast_xp": "Congrats! You earned {xp} XP",
    "toast_desc": "Content saved to archive.",
    "date_prefix": "Created: ",
    "levels": ["Basic", "Intermediate", "Advanced"],
    "achievement": "Achievement",
    "rank": "Rank: ",
    "xp_label": "Experience",
    "submit": "Submit Answer",
    "next": "Next Question",
    "your_answer": "Your answer...",
    "correct_ans": "Correct Answer:",
    "explanation": "Detailed Analysis:",
    "streak_complete": "Congrats! You completed the 50-question streak!",
    "ranks": {
      "beginner": "🌱 Beginner",
      "warrior": "⚔️ Warrior",
      "scholar": "🎓 Scholar",
      "master": "🧙 Grandmaster"
    }
  },
  "Deutsch": {
    "header": "Übungszentrum",
    "desc": "Verwandeln Sie Theorie in Fähigkeiten durch praxisnahe Beispiele und Übungen.",
    "tab_learn": "Lernen & Beispiele",
    "tab_challenge": "XP-Herausforderung",
    "tab_streak": "50-Fragen-Serie",
    "tab_archive": "Archiv",
    "topic_label": "Studienthema",
    "topic_placeholder": "z.B. Buchhaltung, KI, Physik...",
    "level_label": "Stufe wählen",
    "btn_example": "5 tiefe Beispiele generieren",
    "btn_challenge": "Herausforderung starten",
    "btn_streak": "50-Fragen-Serie starten",
    "tip_title": "Lerntipp",
    "tip_desc": "Nutzen Sie Spaced Repetition: Überprüfen Sie gespeicherte Übungen nach 1, 3 und 7 Tagen, um das Langzeitgedächtnis zu verbessern.",
    "empty_archive": "Noch keine Übungen gespeichert.",
    "ready_title": "Bereit zum Generieren",
    "ready_desc": "Geben Sie ein Thema ein und klicken Sie auf die Schaltfläche, um mit dem intelligenten Lernen zu beginnen.",
    "loading": "KI erstellt Inhalte...",
    "example_subtitle": "Tiefe praxisnahe Fallstudie",
    "challenge_subtitle": "Denkherausforderung",
    "streak_subtitle": "Kontinuierliche Fragenserie",
    "toast_example": "5 Beispiele generiert!",
    "toast_challenge": "Neue Herausforderung erstellt!",
    "toast_xp": "Glückwunsch! Sie haben {xp} XP verdient",
    "toast_desc": "Inhalt im Archiv gespeichert.",
    "date_prefix": "Erstellt am: ",
    "levels": ["Grundlagen", "Mittel", "Fortgeschritten"],
    "achievement": "Erfolg",
    "rank": "Rang: ",
    "xp_label": "Erfahrung",
    "submit": "Antwort absenden",
    "next": "Nächste Frage",
    "your_answer": "Ihre Antwort...",
    "correct_ans": "Richtige Antwort:",
    "explanation": "Detaillierte Analyse:",
    "streak_complete": "Glückwunsch! Sie haben die 50-Fragen-Serie abgeschlossen!",
    "ranks": {
      "beginner": "🌱 Anfänger",
      "warrior": "⚔️ Krieger",
      "scholar": "🎓 Gelehrter",
      "master": "🧙 Großmeister"
    }
  },
  "Español": {
    "header": "Centro de Práctica",
    "desc": "Convierte la teoría en habilidades a través de ejemplos y ejercicios del mundo real.",
    "tab_learn": "Aprender y Ejemplos",
    "tab_challenge": "Desafío de XP",
    "tab_streak": "Racha de 50 Preguntas",
    "tab_archive": "Archivo",
    "topic_label": "Tema de Estudio",
    "topic_placeholder": "p. ej., Contabilidad, IA, Física...",
    "level_label": "Seleccionar Nivel",
    "btn_example": "Generar 5 Ejemplos Profundos",
    "btn_challenge": "Iniciar Desafío",
    "btn_streak": "Iniciar Racha de 50 Preguntas",
    "tip_title": "Consejo de Estudio",
    "tip_desc": "Usa la Repetición Espaciada: Revisa los ejercicios guardados después de 1, 3 y 7 días para mejorar la memoria a largo plazo.",
    "empty_archive": "Aún no hay ejercicios guardados.",
    "ready_title": "Listo para Generar",
    "ready_desc": "Ingresa un tema y haz clic en el botón para comenzar el aprendizaje inteligente.",
    "loading": "La IA está componiendo contenido...",
    "example_subtitle": "Estudio de Caso Profundo del Mundo Real",
    "challenge_subtitle": "Desafío de Pensamiento",
    "streak_subtitle": "Racha Continua de Preguntas",
    "toast_example": "¡5 ejemplos generados!",
    "toast_challenge": "¡Nuevo desafío creado!",
    "toast_xp": "¡Felicidades! Ganaste {xp} XP",
    "toast_desc": "Contenido guardado en el archivo.",
    "date_prefix": "Creado: ",
    "levels": ["Básico", "Intermedio", "Avanzado"],
    "achievement": "Logro",
    "rank": "Rango: ",
    "xp_label": "Experiencia",
    "submit": "Enviar Respuesta",
    "next": "Siguiente Pregunta",
    "your_answer": "Tu respuesta...",
    "correct_ans": "Respuesta Correcta:",
    "explanation": "Análisis Detallado:",
    "streak_complete": "¡Felicidades! ¡Completaste la racha de 50 preguntas!",
    "ranks": {
      "beginner": "🌱 Principiante",
      "warrior": "⚔️ Guerrero",
      "scholar": "🎓 Erudito",
      "master": "🧙 Gran Maestro"
    }
  },
  "한국어": {
    "header": "연습 센터",
    "desc": "실제 사례와 연습 문제를 통해 이론을 기술로 바꾸세요.",
    "tab_learn": "학습 및 예시",
    "tab_challenge": "XP 챌린지",
    "tab_streak": "50문제 스트릭",
    "tab_archive": "아카이브",
    "topic_label": "학습 주제",
    "topic_placeholder": "예: 회계, AI, 물리학...",
    "level_label": "레벨 선택",
    "btn_example": "심화 예시 5개 생성",
    "btn_challenge": "챌린지 시작",
    "btn_streak": "50문제 스트릭 시작",
    "tip_title": "학습 팁",
    "tip_desc": "간격 반복법 사용: 저장된 연습 문제를 1일, 3일, 7일 후에 복습하여 장기 기억력을 높이세요.",
    "empty_archive": "저장된 연습 문제가 없습니다.",
    "ready_title": "생성 준비 완료",
    "ready_desc": "주제를 입력하고 버튼을 클릭하여 스마트 학습을 시작하세요.",
    "loading": "AI가 콘텐츠를 작성 중입니다...",
    "example_subtitle": "심화 실제 사례 연구",
    "challenge_subtitle": "사고력 챌린지",
    "streak_subtitle": "연속 질문 스트릭",
    "toast_example": "5개의 예시가 생성되었습니다!",
    "toast_challenge": "새로운 챌린지가 생성되었습니다!",
    "toast_xp": "축하합니다! {xp} XP를 획득했습니다",
    "toast_desc": "콘텐츠가 아카이브에 저장되었습니다.",
    "date_prefix": "생성일: ",
    "levels": ["기초", "중급", "고급"],
    "achievement": "업적",
    "rank": "등급: ",
    "xp_label": "경험치",
    "submit": "답변 제출",
    "next": "다음 질문",
    "your_answer": "답변을 입력하세요...",
    "correct_ans": "정답:",
    "explanation": "상세 분석:",
    "streak_complete": "축하합니다! 50문제 스트릭을 완료했습니다!",
    "ranks": {
      "beginner": "🌱 초보자",
      "warrior": "⚔️ 전사",
      "scholar": "🎓 학자",
      "master": "🧙 그랜드마스터"
    }
  }
};

export function Practice() {
  const [mode, setMode] = useState<'learn' | 'challenge' | 'streak' | 'archive' | 'sync'>('learn');
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Trung bình');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [syncQuestions, setSyncQuestions] = useState<any[]>([]);
  const [language, setLanguage] = useState('Tiếng Việt');
  
  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTopic, setFilterTopic] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  // XP System State
  const [xp, setXp] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [challengeData, setChallengeData] = useState<{q: string, a: string, exp: string} | null>(null);

  // Streak State
  const [streakCount, setStreakCount] = useState(0);
  const [quizData, setQuizData] = useState<{q: string, options: string[], a: string, exp: string} | null>(null);
  const [selectedOption, setSelectedOption] = useState('');

  // Timed Quiz State
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimed, setIsTimed] = useState(false);
  const [timerActive, setTimerActive] = useState(false);

  // Exercise Chat State
  const [exerciseChat, setExerciseChat] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [hint, setHint] = useState('');
  const [hintLoading, setHintLoading] = useState(false);

  useEffect(() => {
    let interval: any;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      setIsAnswered(true);
      toast.error(language === 'Tiếng Việt' ? 'Hết giờ!' : 'Time up!');
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, language]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('eduai_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setLanguage(parsed.language || 'Tiếng Việt');
      const lang = parsed.language || 'Tiếng Việt';
      setLevel(lang === 'English' ? 'Intermediate' : lang === '日本語' ? '中級' : lang === 'Français' ? 'Intermédiaire' : 'Trung bình');
    }

    const savedExercises = localStorage.getItem('eduai_exercises');
    if (savedExercises) {
      try { setExercises(JSON.parse(savedExercises)); } catch (e) {}
    }

    const savedXp = localStorage.getItem('eduai_xp');
    if (savedXp) setXp(parseInt(savedXp));

    const savedSync = localStorage.getItem('eduai_sync_practice');
    if (savedSync) {
      try { setSyncQuestions(JSON.parse(savedSync)); } catch (e) {}
    }
  }, []);

  const dict = LANGUAGES_DICT[language] || LANGUAGES_DICT['Tiếng Việt'];

  const toggleReviewed = (id: string) => {
    const updated = syncQuestions.map(q => q.id === id ? { ...q, reviewed: !q.reviewed } : q);
    setSyncQuestions(updated);
    localStorage.setItem('eduai_sync_practice', JSON.stringify(updated));
    toast.success(dict.mark_reviewed);
  };

  const deleteSyncQuestion = (id: string) => {
    if (confirm(dict.delete_confirm)) {
      const updated = syncQuestions.filter(q => q.id !== id);
      setSyncQuestions(updated);
      localStorage.setItem('eduai_sync_practice', JSON.stringify(updated));
    }
  };

  const filteredSyncQuestions = syncQuestions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = filterTopic === 'all' || q.topic === filterTopic;
    const matchesDate = filterDate === 'all' || q.date === filterDate;
    return matchesSearch && matchesTopic && matchesDate;
  });

  const uniqueTopics = Array.from(new Set(syncQuestions.map(q => q.topic)));
  const uniqueDates = Array.from(new Set(syncQuestions.map(q => q.date)));

  const getRank = (totalXp: number) => {
    if (totalXp < 500) return dict.ranks.beginner;
    if (totalXp < 2000) return dict.ranks.warrior;
    if (totalXp < 5000) return dict.ranks.scholar;
    return dict.ranks.master;
  };

  const saveExercise = (content: string, type: string, topicName: string, levelName?: string) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      topic: topicName,
      content,
      type,
      level: levelName,
      date: new Date().toLocaleDateString(language === 'Tiếng Việt' ? 'vi-VN' : 'en-US'),
    };
    // Memory optimization: limit to 50 items
    const updated = [newExercise, ...exercises].slice(0, 50);
    setExercises(updated);
    localStorage.setItem('eduai_exercises', JSON.stringify(updated));
  };

  const handleGenerateExample = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const res = await generateExample(topic, level, language);
      setResult(res);
      saveExercise(res, language === 'Tiếng Việt' ? 'Ví dụ' : 'Example', topic, level);
      toast.success(dict.toast_example, { description: dict.toast_desc });
    } catch (error) {
      toast.error('Error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateChallenge = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult('');
    setIsAnswered(false);
    setUserAnswer('');
    setChallengeData(null);
    setExerciseChat([]);
    setTimerActive(false);
    setHint('');
    try {
      const res = await generateChallenge(topic, level, language);
      setResult(res);
      
      const q = res.split('ANSWER:')[0].replace('QUESTION:', '').trim();
      const a = res.split('ANSWER:')[1].split('EXPLAIN:')[0].trim();
      const exp = res.split('EXPLAIN:')[1].trim();
      
      setChallengeData({ q, a, exp });
      
      if (isTimed) {
        setTimeLeft(60); // 60 seconds for challenge
        setTimerActive(true);
      }

      toast.success(dict.toast_challenge);
    } catch (error) {
      toast.error('AI formatting error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartStreak = async () => {
    if (!topic.trim()) return;
    setStreakCount(1);
    await generateNextQuiz();
  };

  const generateNextQuiz = async () => {
    setLoading(true);
    setIsAnswered(false);
    setSelectedOption('');
    setQuizData(null);
    try {
      const res = await generateQuizQuestion(topic, level, language);
      if (res === "Error") throw new Error();
      
      const q = res.split('OPTIONS:')[0].replace('QUESTION:', '').trim();
      const optsStr = res.split('OPTIONS:')[1].split('ANSWER:')[0].trim();
      const a = res.split('ANSWER:')[1].split('EXPLAIN:')[0].trim();
      const exp = res.split('EXPLAIN:')[1].trim();
      
      const options = optsStr.split(',').map(o => o.trim());
      
      setQuizData({ q, options, a, exp });
    } catch (error) {
      toast.error('AI formatting error.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim() || isAnswered) return;
    setIsAnswered(true);
    setTimerActive(false);
    
    let xpGain = 50;
    if (level === 'Trung bình' || level === 'Intermediate' || level === '中級' || level === 'Intermédiaire') xpGain = 150;
    if (level === 'Nâng cao' || level === 'Advanced' || level === '上級' || level === 'Avancé') xpGain = 300;
    
    // Bonus for timed mode
    if (isTimed && timeLeft > 0) {
      xpGain += 50;
      toast.success(language === 'Tiếng Việt' ? '+50 XP Thưởng thời gian!' : '+50 Bonus XP for speed!');
    }

    const newXp = xp + xpGain;
    setXp(newXp);
    localStorage.setItem('eduai_xp', newXp.toString());
    
    toast.success(dict.toast_xp.replace('{xp}', xpGain.toString()), {
      icon: <Zap className="text-amber-500" size={18} />
    });

    if (challengeData) {
      const archiveContent = `**Question:** ${challengeData.q}\n\n**Your Answer:** ${userAnswer}\n\n**Correct Answer:** ${challengeData.a}\n\n**Explanation:** ${challengeData.exp}`;
      saveExercise(archiveContent, language === 'Tiếng Việt' ? 'Thử thách' : 'Challenge', topic, level);
    }
  };

  const handleExerciseChat = async () => {
    if (!chatInput.trim() || chatLoading || !challengeData) return;
    
    const userMsg = { role: 'user' as const, content: chatInput };
    setExerciseChat(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const history = exerciseChat.map(m => ({ role: m.role, content: m.content }));
      // Context: current question and explanation
      const context = `Context: The user is working on this exercise: "${challengeData.q}". The correct answer is "${challengeData.a}" and the explanation is "${challengeData.exp}".`;
      const response = await getSocraticResponse(chatInput, [{ role: 'assistant', content: context }, ...history], level, language);
      
      setExerciseChat(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      toast.error('Error connecting to AI');
    } finally {
      setChatLoading(false);
    }
  };

  const handleGetHint = async () => {
    if (!challengeData || isAnswered || hintLoading) return;
    setHintLoading(true);
    try {
      const res = await generateSocraticHint(challengeData.q, challengeData.a, language);
      if (res) setHint(res);
    } catch (error) {
      toast.error('Error getting hint');
    } finally {
      setHintLoading(false);
    }
  };

  const handleSubmitQuiz = () => {
    if (!selectedOption || isAnswered) return;
    setIsAnswered(true);
    
    const isCorrect = selectedOption.startsWith(quizData?.a || '');
    const xpGain = isCorrect ? 100 : 20;
    
    const newXp = xp + xpGain;
    setXp(newXp);
    localStorage.setItem('eduai_xp', newXp.toString());

    // Record study history
    const history = JSON.parse(localStorage.getItem('eduai_study_history') || '[]');
    history.unshift({
      date: new Date().toISOString(),
      activity: language === 'Tiếng Việt' ? `Luyện tập: ${mode}` : `Practice: ${mode}`,
      duration: 20,
      result: isCorrect ? (language === 'Tiếng Việt' ? 'Chính xác' : 'Correct') : (language === 'Tiếng Việt' ? 'Chưa đúng' : 'Incorrect'),
      xp: xpGain
    });
    localStorage.setItem('eduai_study_history', JSON.stringify(history.slice(0, 50)));
    
    if (isCorrect) {
      toast.success(dict.toast_xp.replace('{xp}', xpGain.toString()));
    } else {
      toast.info(`+${xpGain} XP (Keep trying!)`);
    }
  };

  const handleNextStreak = () => {
    if (streakCount >= 50) {
      toast.success(dict.streak_complete);
      setStreakCount(0);
      setMode('learn');
    } else {
      setStreakCount(prev => prev + 1);
      generateNextQuiz();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-8 px-4">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-display font-bold text-slate-800 flex items-center gap-4">
            <div className="p-3 bg-brand-500 text-white rounded-2xl shadow-lg shadow-brand-200">
              <Target size={36} />
            </div>
            {dict.header}
          </h2>
          <p className="text-slate-500 text-xl ml-16">{dict.desc}</p>
        </div>
        
        <div className="flex bg-white/60 backdrop-blur-xl p-2 rounded-3xl self-start shadow-xl border border-white/20 glass-morphism overflow-x-auto max-w-full">
          <button
            onClick={() => { setMode('learn'); setResult(''); setStreakCount(0); }}
            className={cn(
              "px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              mode === 'learn' ? "bg-brand-500 text-white shadow-lg" : "text-slate-500 hover:text-brand-600 hover:bg-brand-50/50"
            )}
          >
            <BookOpen size={18} />
            {dict.tab_learn}
          </button>
          <button
            onClick={() => { setMode('challenge'); setResult(''); setStreakCount(0); }}
            className={cn(
              "px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              mode === 'challenge' ? "bg-brand-500 text-white shadow-lg" : "text-slate-500 hover:text-brand-600 hover:bg-brand-50/50"
            )}
          >
            <Zap size={18} />
            {dict.tab_challenge}
          </button>
          <button
            onClick={() => { setMode('streak'); setResult(''); }}
            className={cn(
              "px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              mode === 'streak' ? "bg-brand-500 text-white shadow-lg" : "text-slate-500 hover:text-brand-600 hover:bg-brand-50/50"
            )}
          >
            <ListOrdered size={18} />
            {dict.tab_streak}
          </button>
          <button
            onClick={() => { setMode('sync'); setResult(''); setStreakCount(0); }}
            className={cn(
              "px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              mode === 'sync' ? "bg-brand-500 text-white shadow-lg" : "text-slate-500 hover:text-brand-600 hover:bg-brand-50/50"
            )}
          >
            <RefreshCw size={18} />
            {dict.tab_sync}
          </button>
          <button
            onClick={() => { setMode('archive'); setResult(''); setStreakCount(0); }}
            className={cn(
              "px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              mode === 'archive' ? "bg-brand-500 text-white shadow-lg" : "text-slate-500 hover:text-brand-600 hover:bg-brand-50/50"
            )}
          >
            <Archive size={18} />
            {dict.tab_archive}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
          {/* Achievement Card */}
          <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-8 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
              <Trophy size={120} />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <Award size={24} />
                <h3 className="font-bold uppercase tracking-widest text-sm">{dict.achievement}</h3>
              </div>
              <div>
                <p className="text-lg font-medium opacity-90">{dict.rank} {getRank(xp)}</p>
                <p className="text-5xl font-display font-bold mt-1 tracking-tighter">{xp} XP</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-80">
                  <span>{dict.xp_label}</span>
                  <span>{xp} / 5000</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2.5 backdrop-blur-sm">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((xp / 5000) * 100, 100)}%` }}
                    className="bg-white h-full rounded-full shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white/20 shadow-2xl space-y-8 glass-morphism">
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-2">{dict.topic_label}</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={dict.topic_placeholder}
                className="w-full px-8 py-5 rounded-[2rem] border border-slate-200 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all bg-slate-50/50 text-xl shadow-inner"
              />
            </div>
 
            {(mode === 'challenge' || mode === 'learn' || mode === 'streak') && (
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-2">{dict.level_label}</label>
                <div className="relative">
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-8 py-5 rounded-[2rem] border border-slate-200 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all bg-white text-xl appearance-none cursor-pointer shadow-inner"
                  >
                    {dict.levels.map((l: string) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={24} />
                </div>
              </div>
            )}

            {mode === 'challenge' && (
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-brand-500" />
                  <span className="text-sm font-bold text-slate-700">{language === 'Tiếng Việt' ? 'Chế độ tính giờ' : 'Timed Mode'}</span>
                </div>
                <button 
                  onClick={() => setIsTimed(!isTimed)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    isTimed ? "bg-brand-500" : "bg-slate-300"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    isTimed ? "right-1" : "left-1"
                  )} />
                </button>
              </div>
            )}
 
            <button
              onClick={mode === 'learn' ? handleGenerateExample : mode === 'challenge' ? handleGenerateChallenge : handleStartStreak}
              disabled={!topic.trim() || loading || mode === 'archive'}
              className="w-full py-6 rounded-[2rem] bg-brand-500 text-white font-bold text-xl hover:bg-brand-600 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-2xl shadow-brand-200 flex items-center justify-center gap-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={32} />
              ) : (
                <>
                  <Sparkles size={32} />
                  {mode === 'learn' ? dict.btn_example : mode === 'challenge' ? dict.btn_challenge : dict.btn_streak}
                </>
              )}
            </button>
          </div>

          <div className="bg-amber-50/50 backdrop-blur-sm p-10 rounded-[3.5rem] border border-amber-100/50 space-y-4 shadow-lg">
            <h4 className="text-xl font-bold text-amber-900 flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                <Star size={24} />
              </div>
              {dict.tip_title}
            </h4>
            <p className="text-lg text-amber-800 leading-relaxed">
              {dict.tip_desc}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {mode === 'sync' ? (
              <motion.div
                key="sync"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 shadow-xl glass-morphism space-y-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        type="text"
                        placeholder={dict.search_placeholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                      />
                    </div>
                    <div className="flex gap-4">
                      <select 
                        value={filterTopic}
                        onChange={(e) => setFilterTopic(e.target.value)}
                        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm font-medium"
                      >
                        <option value="all">{dict.all_topics}</option>
                        {uniqueTopics.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <select 
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm font-medium"
                      >
                        <option value="all">{dict.all_dates}</option>
                        {uniqueDates.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm italic">{dict.sync_desc}</p>
                </div>

                {filteredSyncQuestions.length === 0 ? (
                  <div className="bg-white/80 backdrop-blur-xl p-24 rounded-[3.5rem] border border-dashed border-slate-200 text-center space-y-6 glass-morphism">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <RefreshCw className="text-slate-300" size={56} />
                    </div>
                    <p className="text-slate-400 text-xl font-medium">{dict.empty_sync}</p>
                  </div>
                ) : (
                  filteredSyncQuestions.map((q) => (
                    <div key={q.id} className="bg-white/80 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white/20 shadow-xl hover:shadow-2xl transition-all group glass-morphism relative">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl">
                            <RefreshCw size={24} />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-slate-800">{q.topic}</h3>
                            <p className="text-sm text-slate-400">{q.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => toggleReviewed(q.id)}
                            className={cn(
                              "p-3 rounded-xl transition-all border",
                              q.reviewed ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-50 border-slate-100 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50"
                            )}
                            title={dict.mark_reviewed}
                          >
                            <Check size={20} />
                          </button>
                          <button 
                            onClick={() => deleteSyncQuestion(q.id)}
                            className="p-3 bg-slate-50 border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Question</p>
                          <p className="text-xl text-slate-800 font-medium">{q.question}</p>
                        </div>
                        <div className="p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100/50">
                          <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-2">Answer</p>
                          <p className="text-xl text-emerald-800 font-bold">{q.answer}</p>
                        </div>
                      </div>
                      {q.reviewed && (
                        <div className="absolute top-6 right-6">
                          <div className="bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                            <Check size={16} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </motion.div>
            ) : mode === 'archive' ? (
              <motion.div
                key="archive"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {exercises.length === 0 ? (
                  <div className="bg-white/80 backdrop-blur-xl p-24 rounded-[3.5rem] border border-dashed border-slate-200 text-center space-y-6 glass-morphism">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <Archive className="text-slate-300" size={56} />
                    </div>
                    <p className="text-slate-400 text-xl font-medium">{dict.empty_archive}</p>
                  </div>
                ) : (
                  exercises.map((ex) => (
                    <div key={ex.id} className="bg-white/80 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white/20 shadow-xl hover:shadow-2xl transition-all group glass-morphism">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            "px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-sm",
                            ex.type === 'Ví dụ' || ex.type === 'Example' ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                          )}>
                            {ex.type}
                          </span>
                          <h3 className="text-2xl font-bold text-slate-800">{ex.topic}</h3>
                          {ex.level && (
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-widest">
                              {ex.level}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-slate-400 font-bold flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full">
                          <History size={16} />
                          {dict.date_prefix}{ex.date}
                        </span>
                      </div>
                      <div className="markdown-body prose-xl max-w-none line-clamp-4 group-hover:line-clamp-none transition-all duration-500">
                        <ReactMarkdown>{ex.content}</ReactMarkdown>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            ) : mode === 'streak' && streakCount > 0 ? (
              <motion.div
                key="streak"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/80 backdrop-blur-xl p-12 rounded-[4rem] border border-white/20 shadow-2xl min-h-[600px] relative overflow-hidden glass-morphism"
              >
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-6">
                    <div className="p-5 rounded-3xl shadow-lg bg-brand-500 text-white shadow-brand-100">
                      <ListOrdered size={36} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-slate-800">{topic}</h3>
                      <p className="text-lg text-slate-500 mt-1">{dict.streak_subtitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Progress</p>
                    <p className="text-4xl font-display font-bold text-brand-500">{streakCount}/50</p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-8">
                    <Loader2 className="animate-spin text-brand-500" size={80} />
                    <p className="text-slate-800 text-2xl font-bold animate-pulse">{dict.loading}</p>
                  </div>
                ) : quizData ? (
                  <div className="space-y-10">
                    <div className="bg-slate-50/80 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <HelpCircle size={16} />
                        Question {streakCount}
                      </h4>
                      <div className="text-2xl text-slate-800 font-medium leading-relaxed">
                        {quizData.q}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {quizData.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => !isAnswered && setSelectedOption(opt)}
                          disabled={isAnswered}
                          className={cn(
                            "p-6 rounded-3xl border-2 text-left transition-all text-lg font-medium",
                            selectedOption === opt ? "border-brand-500 bg-brand-50 text-brand-700 shadow-lg" : "border-slate-100 bg-white text-slate-600 hover:border-brand-200",
                            isAnswered && opt.startsWith(quizData.a) ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "",
                            isAnswered && selectedOption === opt && !opt.startsWith(quizData.a) ? "border-red-500 bg-red-50 text-red-700" : ""
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-end gap-4">
                      {!isAnswered ? (
                        <button
                          onClick={handleSubmitQuiz}
                          disabled={!selectedOption}
                          className="px-12 py-5 rounded-[2rem] bg-brand-500 text-white font-bold text-xl hover:bg-brand-600 transition-all shadow-xl disabled:opacity-50"
                        >
                          {dict.submit}
                        </button>
                      ) : (
                        <button
                          onClick={handleNextStreak}
                          className="px-12 py-5 rounded-[2rem] bg-slate-900 text-white font-bold text-xl hover:bg-slate-800 transition-all shadow-xl flex items-center gap-3"
                        >
                          {dict.next}
                          <ChevronRight size={24} />
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {isAnswered && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100"
                        >
                          <h4 className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-2">{dict.explanation}</h4>
                          <div className="text-lg text-amber-900 leading-relaxed">
                            {quizData.exp}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : null}
              </motion.div>
            ) : (
              <motion.div
                key={mode}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/80 backdrop-blur-xl p-12 rounded-[4rem] border border-white/20 shadow-2xl min-h-[600px] relative overflow-hidden glass-morphism"
              >
                {!result && !loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-16 space-y-8">
                    <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 shadow-inner">
                      {mode === 'learn' ? <BookOpen size={64} /> : <Zap size={64} />}
                    </div>
                    <div>
                      <h3 className="text-3xl font-display font-bold text-slate-800">{dict.ready_title}</h3>
                      <p className="text-slate-500 text-xl mt-4 max-w-md mx-auto">{dict.ready_desc}</p>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md z-10">
                    <div className="relative">
                      <Loader2 className="animate-spin text-brand-500" size={80} />
                      <Sparkles className="absolute -top-2 -right-2 text-amber-400 animate-bounce" size={32} />
                    </div>
                    <p className="text-slate-800 text-2xl font-bold mt-8 animate-pulse">{dict.loading}</p>
                  </div>
                )}

                {result && mode === 'learn' && (
                  <div className="space-y-10">
                    <div className="flex items-center gap-6 pb-8 border-b border-slate-100/50">
                      <div className="p-5 rounded-3xl shadow-lg bg-emerald-500 text-white shadow-emerald-100">
                        <CheckCircle2 size={36} />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-slate-800">{topic}</h3>
                        <p className="text-lg text-slate-500 mt-1">{dict.example_subtitle}</p>
                      </div>
                    </div>
                    <div className="markdown-body prose-2xl max-w-none">
                      <ReactMarkdown>{result}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {result && mode === 'challenge' && challengeData && (
                  <div className="space-y-10">
                    <div className="flex items-center gap-6 pb-8 border-b border-slate-100/50">
                      <div className="p-5 rounded-3xl shadow-lg bg-orange-500 text-white shadow-orange-100">
                        <Zap size={36} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-3xl font-bold text-slate-800">{topic}</h3>
                        <p className="text-lg text-slate-500 mt-1">{dict.challenge_subtitle} • {level}</p>
                      </div>
                      {timerActive && (
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Time Left</span>
                          <span className={cn(
                            "text-3xl font-display font-bold",
                            timeLeft < 10 ? "text-red-500 animate-pulse" : "text-brand-500"
                          )}>
                            {timeLeft}s
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-8">
                      <div className="bg-slate-50/80 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <HelpCircle size={16} />
                          Question
                        </h4>
                        <div className="text-2xl text-slate-800 font-medium leading-relaxed">
                          {challengeData.q}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="relative">
                          <input 
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            disabled={isAnswered}
                            placeholder={dict.your_answer}
                            className="w-full px-8 py-6 rounded-[2.5rem] border border-slate-200 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all bg-white text-xl shadow-lg pr-40"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            {!isAnswered && (
                              <button 
                                onClick={handleGetHint}
                                disabled={hintLoading}
                                className="p-4 bg-amber-100 text-amber-600 rounded-full hover:bg-amber-200 transition-all disabled:opacity-50"
                                title="Gợi ý từ AI"
                              >
                                {hintLoading ? <Loader2 className="animate-spin" size={24} /> : <Lightbulb size={24} />}
                              </button>
                            )}
                            <button 
                              onClick={handleSubmitAnswer}
                              disabled={isAnswered || !userAnswer.trim()}
                              className="p-4 bg-brand-500 text-white rounded-full hover:bg-brand-600 transition-all disabled:opacity-50"
                            >
                              <Send size={24} />
                            </button>
                          </div>
                        </div>
                        {hint && !isAnswered && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="px-8 py-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-800 italic font-medium flex items-center gap-3"
                          >
                            <Sparkles className="text-amber-500 shrink-0" size={18} />
                            <span>{hint}</span>
                          </motion.div>
                        )}
                      </div>

                      <AnimatePresence>
                        {isAnswered && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                          >
                            <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100">
                              <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-2">{dict.correct_ans}</h4>
                              <p className="text-2xl font-bold text-emerald-800">{challengeData.a}</p>
                            </div>
                            <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100">
                              <h4 className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-2">{dict.explanation}</h4>
                              <div className="text-lg text-amber-900 leading-relaxed">
                                {challengeData.exp}
                              </div>
                            </div>

                            {/* Exercise Chat Interface */}
                            <div className="mt-12 space-y-6 border-t border-slate-100 pt-10">
                              <h4 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                <MessageSquare className="text-brand-500" size={24} />
                                {language === 'Tiếng Việt' ? 'Hỏi thêm về bài tập này' : 'Ask about this exercise'}
                              </h4>
                              
                              <div className="space-y-4 max-h-[300px] overflow-y-auto p-4 bg-slate-50/50 rounded-3xl border border-slate-100">
                                {exerciseChat.length === 0 && (
                                  <p className="text-slate-400 text-center py-4 italic">
                                    {language === 'Tiếng Việt' ? 'Bạn có thắc mắc gì về lời giải không?' : 'Any questions about the solution?'}
                                  </p>
                                )}
                                {exerciseChat.map((msg, i) => (
                                  <div key={i} className={cn(
                                    "flex gap-3",
                                    msg.role === 'user' ? "flex-row-reverse" : ""
                                  )}>
                                    <div className={cn(
                                      "p-4 rounded-2xl text-sm leading-relaxed",
                                      msg.role === 'user' ? "bg-slate-900 text-white rounded-tr-none" : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
                                    )}>
                                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                  </div>
                                ))}
                                {chatLoading && (
                                  <div className="flex gap-3">
                                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 flex items-center gap-2">
                                      <Loader2 className="animate-spin text-brand-500" size={16} />
                                      <span className="text-xs text-slate-400">Thinking...</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="relative">
                                <input 
                                  type="text"
                                  value={chatInput}
                                  onChange={(e) => setChatInput(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleExerciseChat()}
                                  placeholder={language === 'Tiếng Việt' ? 'Nhập câu hỏi của bạn...' : 'Type your question...'}
                                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all bg-white shadow-sm pr-16"
                                />
                                <button 
                                  onClick={handleExerciseChat}
                                  disabled={chatLoading || !chatInput.trim()}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all disabled:opacity-50"
                                >
                                  <Send size={18} />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
