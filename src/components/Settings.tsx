import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Bell, Zap, Trash2, Save, ShieldCheck, Clock } from 'lucide-react';
import { toast } from 'sonner';

const LANGUAGES_DICT: Record<string, any> = {
  "Tiếng Việt": {
    "header": "Cài đặt hệ thống",
    "desc": "Tùy chỉnh trải nghiệm AI và quản lý dữ liệu của bạn.",
    "ai_personalization": "Cá nhân hóa AI",
    "ai_speed": "Tốc độ phản hồi AI",
    "ai_voice": "Giọng nói AI (TTS)",
    "voice_enabled": "Bật giọng nói AI",
    "voice_rate": "Tốc độ giọng nói",
    "ai_tone": "Tông giọng AI",
    "tone_friendly": "Thân thiện",
    "tone_formal": "Trang trọng",
    "tone_encouraging": "Khích lệ",
    "speed_eco": "Tiết kiệm",
    "speed_balanced": "Cân bằng",
    "speed_optimal": "Tối ưu",
    "difficulty": "Độ khó mặc định",
    "diff_beginner": "Mới bắt đầu",
    "diff_intermediate": "Trung bình",
    "diff_advanced": "Nâng cao",
    "language": "Ngôn ngữ / Quốc gia",
    "notifications": "Thông báo",
    "push_notif": "Bật thông báo đẩy",
    "push_notif_desc": "Nhận thông báo khi AI hoàn thành tác vụ.",
    "pomodoro": "Tùy chỉnh Pomodoro",
    "pomo_work": "Thời gian tập trung (phút)",
    "pomo_break": "Thời gian nghỉ (phút)",
    "reminder": "Giờ nhắc học bài",
    "reminder_desc": "Đặt lịch nhắc nhở hàng ngày.",
    "data": "Dữ liệu",
    "clear_history": "Xóa sạch lịch sử trò chuyện",
    "clear_confirm": "Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện?",
    "clear_success": "Đã xóa toàn bộ lịch sử!",
    "save": "Lưu cài đặt",
    "save_success": "Đã cập nhật cài đặt thành công!"
  },
  "English": {
    "header": "System Settings",
    "desc": "Customize your AI experience and manage your data.",
    "ai_personalization": "AI Personalization",
    "ai_speed": "AI Response Speed",
    "ai_voice": "AI Voice (TTS)",
    "voice_enabled": "Enable AI Voice",
    "voice_rate": "Voice Speed (Rate)",
    "ai_tone": "AI Response Tone",
    "tone_friendly": "Friendly",
    "tone_formal": "Formal",
    "tone_encouraging": "Encouraging",
    "speed_eco": "Eco",
    "speed_balanced": "Balanced",
    "speed_optimal": "Optimal",
    "difficulty": "Default Difficulty",
    "diff_beginner": "Beginner",
    "diff_intermediate": "Intermediate",
    "diff_advanced": "Advanced",
    "language": "Language / Region",
    "notifications": "Notifications",
    "push_notif": "Enable Push Notifications",
    "push_notif_desc": "Get notified when AI completes a task.",
    "pomodoro": "Pomodoro Customization",
    "pomo_work": "Focus Time (mins)",
    "pomo_break": "Break Time (mins)",
    "reminder": "Study Reminder Time",
    "reminder_desc": "Set a daily reminder schedule.",
    "data": "Data Management",
    "clear_history": "Clear Chat History",
    "clear_confirm": "Are you sure you want to clear all chat history?",
    "clear_success": "All history cleared!",
    "save": "Save Settings",
    "save_success": "Settings updated successfully!"
  },
  "Français": {
    "header": "Paramètres du système",
    "desc": "Personnalisez votre expérience IA et gérez vos données.",
    "ai_personalization": "Personnalisation de l'IA",
    "ai_speed": "Vitesse de réponse de l'IA",
    "speed_eco": "Éco",
    "speed_balanced": "Équilibré",
    "speed_optimal": "Optimal",
    "difficulty": "Difficulté par défaut",
    "diff_beginner": "Débutant",
    "diff_intermediate": "Intermédiaire",
    "diff_advanced": "Avancé",
    "language": "Langue / Région",
    "notifications": "Notifications",
    "push_notif": "Activer les notifications push",
    "push_notif_desc": "Recevoir une notification lorsque l'IA termine une tâche.",
    "reminder": "Heure de rappel d'étude",
    "reminder_desc": "Définissez un programme de rappel quotidien.",
    "data": "Gestion des données",
    "clear_history": "Effacer l'historique des discussions",
    "clear_confirm": "Êtes-vous sûr de vouloir effacer tout l'historique des discussions ?",
    "clear_success": "Tout l'historique a été effacé !",
    "save": "Enregistrer les paramètres",
    "save_success": "Paramètres mis à jour avec succès !"
  },
  "日本語": {
    "header": "システム設定",
    "desc": "AI体験をカスタマイズし、データを管理します。",
    "ai_personalization": "AIのパーソナライズ",
    "ai_speed": "AIの応答速度",
    "speed_eco": "省エネ",
    "speed_balanced": "バランス",
    "speed_optimal": "最適",
    "difficulty": "デフォルトの難易度",
    "diff_beginner": "初心者",
    "diff_intermediate": "中級者",
    "diff_advanced": "上級者",
    "language": "言語 / 地域",
    "notifications": "通知",
    "push_notif": "プッシュ通知を有効にする",
    "push_notif_desc": "AIがタスクを完了したときに通知を受け取ります。",
    "reminder": "学習リマインダー時間",
    "reminder_desc": "毎日のリマインダースケジュールを設定します。",
    "data": "データ管理",
    "clear_history": "チャット履歴を消去する",
    "clear_confirm": "すべてのチャット履歴を消去してもよろしいですか？",
    "clear_success": "すべての履歴が消去されました！",
    "save": "設定を保存する",
    "save_success": "設定が正常に更新されました！"
  },
  "Deutsch": {
    "header": "Systemeinstellungen",
    "desc": "Passen Sie Ihr KI-Erlebnis an und verwalten Sie Ihre Daten.",
    "ai_personalization": "KI-Personalisierung",
    "ai_speed": "KI-Reaktionsgeschwindigkeit",
    "ai_tone": "KI-Tonfall",
    "tone_friendly": "Freundlich",
    "tone_formal": "Formal",
    "tone_encouraging": "Ermutigend",
    "speed_eco": "Öko",
    "speed_balanced": "Ausgeglichen",
    "speed_optimal": "Optimal",
    "difficulty": "Standard-Schwierigkeit",
    "diff_beginner": "Anfänger",
    "diff_intermediate": "Mittel",
    "diff_advanced": "Fortgeschritten",
    "language": "Sprache / Region",
    "notifications": "Benachrichtigungen",
    "push_notif": "Push-Benachrichtigungen aktivieren",
    "push_notif_desc": "Benachrichtigung erhalten, wenn die KI eine Aufgabe abschließt.",
    "pomodoro": "Pomodoro-Anpassung",
    "pomo_work": "Fokuszeit (Min.)",
    "pomo_break": "Pause (Min.)",
    "reminder": "Lern-Erinnerungszeit",
    "reminder_desc": "Täglichen Erinnerungsplan festlegen.",
    "data": "Datenverwaltung",
    "clear_history": "Chat-Verlauf löschen",
    "clear_confirm": "Sind Sie sicher, dass Sie den gesamten Chat-Verlauf löschen möchten?",
    "clear_success": "Verlauf gelöscht!",
    "save": "Einstellungen speichern",
    "save_success": "Einstellungen erfolgreich aktualisiert!"
  },
  "Español": {
    "header": "Configuración del Sistema",
    "desc": "Personaliza tu experiencia con la IA y gestiona tus datos.",
    "ai_personalization": "Personalización de IA",
    "ai_speed": "Velocidad de respuesta de IA",
    "ai_tone": "Tono de respuesta de IA",
    "tone_friendly": "Amistoso",
    "tone_formal": "Formal",
    "tone_encouraging": "Alentador",
    "speed_eco": "Eco",
    "speed_balanced": "Equilibrado",
    "speed_optimal": "Óptimo",
    "difficulty": "Dificultad predeterminada",
    "diff_beginner": "Principiante",
    "diff_intermediate": "Intermedio",
    "diff_advanced": "Avanzado",
    "language": "Idioma / Región",
    "notifications": "Notificaciones",
    "push_notif": "Activar notificaciones push",
    "push_notif_desc": "Recibe notificaciones cuando la IA complete una tarea.",
    "pomodoro": "Personalización Pomodoro",
    "pomo_work": "Tiempo de enfoque (min)",
    "pomo_break": "Tiempo de descanso (min)",
    "reminder": "Hora de recordatorio de estudio",
    "reminder_desc": "Establece un horario de recordatorio diario.",
    "data": "Gestión de datos",
    "clear_history": "Borrar historial de chat",
    "clear_confirm": "¿Estás seguro de que quieres borrar todo el historial de chat?",
    "clear_success": "¡Historial borrado!",
    "save": "Guardar configuración",
    "save_success": "¡Configuración actualizada con éxito!"
  },
  "한국어": {
    "header": "시스템 설정",
    "desc": "AI 경험을 맞춤 설정하고 데이터를 관리하세요.",
    "ai_personalization": "AI 개인화",
    "ai_speed": "AI 응답 속도",
    "ai_tone": "AI 응답 톤",
    "tone_friendly": "친절함",
    "tone_formal": "격식 있음",
    "tone_encouraging": "격려함",
    "speed_eco": "절전",
    "speed_balanced": "균형",
    "speed_optimal": "최적",
    "difficulty": "기본 난이도",
    "diff_beginner": "초보자",
    "diff_intermediate": "중급자",
    "diff_advanced": "상급자",
    "language": "언어 / 지역",
    "notifications": "알림",
    "push_notif": "푸시 알림 활성화",
    "push_notif_desc": "AI가 작업을 완료하면 알림을 받습니다.",
    "pomodoro": "뽀모도로 맞춤 설정",
    "pomo_work": "집중 시간 (분)",
    "pomo_break": "휴식 시간 (분)",
    "reminder": "학습 알림 시간",
    "reminder_desc": "일일 알림 일정을 설정하세요.",
    "data": "데이터 관리",
    "clear_history": "채팅 기록 삭제",
    "clear_confirm": "모든 채팅 기록을 삭제하시겠습니까?",
    "clear_success": "기록이 삭제되었습니다!",
    "save": "설정 저장",
    "save_success": "설정이 성공적으로 업데이트되었습니다!"
  }
};

export function Settings() {
  const [aiSpeed, setAiSpeed] = useState('Cân bằng');
  const [aiTone, setAiTone] = useState('Friendly');
  const [notifications, setNotifications] = useState(true);
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [reminderTime, setReminderTime] = useState('19:00');
  const [language, setLanguage] = useState('Tiếng Việt');
  const [pomoWork, setPomoWork] = useState(25);
  const [pomoBreak, setPomoBreak] = useState(5);

  useEffect(() => {
    const saved = localStorage.getItem('eduai_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setAiSpeed(parsed.aiSpeed || 'Cân bằng');
      setAiTone(parsed.aiTone || 'Friendly');
      setNotifications(parsed.notifications ?? true);
      setDifficulty(parsed.difficulty || 'Intermediate');
      setReminderTime(parsed.reminderTime || '19:00');
      setLanguage(parsed.language || 'Tiếng Việt');
      setPomoWork(parsed.pomoWork || 25);
      setPomoBreak(parsed.pomoBreak || 5);
    }
  }, []);

  const dict = LANGUAGES_DICT[language] || LANGUAGES_DICT['Tiếng Việt'];

  const handleSave = () => {
    const settings = { aiSpeed, aiTone, notifications, difficulty, reminderTime, language, pomoWork, pomoBreak };
    localStorage.setItem('eduai_settings', JSON.stringify(settings));
    toast.success(dict.save_success, {
      icon: <ShieldCheck className="text-green-500" size={18} />
    });
    // Trigger a reload or state update if needed, but for now, simple save is enough
    window.location.reload(); // Reload to apply language changes globally
  };

  const clearHistory = () => {
    if (confirm(dict.clear_confirm)) {
      localStorage.removeItem('eduai_tutor_chat');
      toast.error(dict.clear_success);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8 px-4">
      <header className="text-center space-y-4">
        <div className="inline-flex p-4 bg-white/80 backdrop-blur-xl text-brand-500 rounded-[2rem] shadow-2xl border border-white/20 glass-morphism">
          <SettingsIcon size={48} />
        </div>
        <h2 className="text-5xl font-display font-bold text-slate-800">{dict.header}</h2>
        <p className="text-slate-500 text-xl">{dict.desc}</p>
      </header>

      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white/20 shadow-2xl space-y-12 glass-morphism">
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-brand-600">
            <Zap size={24} />
            <h3 className="font-bold uppercase tracking-widest text-base">{dict.ai_personalization}</h3>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-lg font-bold text-slate-700 flex justify-between">
                <span>{dict.ai_speed}</span>
                <span className="text-brand-500">{aiSpeed}</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="1"
                value={aiSpeed === 'Tiết kiệm' || aiSpeed === 'Eco' || aiSpeed === '省エネ' || aiSpeed === 'Éco' ? 0 : aiSpeed === 'Cân bằng' || aiSpeed === 'Balanced' || aiSpeed === 'バランス' || aiSpeed === 'Équilibré' ? 1 : 2}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  const speedMap: Record<number, string> = {
                    0: dict.speed_eco,
                    1: dict.speed_balanced,
                    2: dict.speed_optimal
                  };
                  setAiSpeed(speedMap[val]);
                }}
                className="w-full h-3 bg-slate-100 rounded-xl appearance-none cursor-pointer accent-brand-500"
              />
              <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-widest">
                <span>{dict.speed_eco}</span>
                <span>{dict.speed_balanced}</span>
                <span>{dict.speed_optimal}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-lg font-bold text-slate-700">{dict.ai_tone}</label>
                <select 
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all bg-white text-lg shadow-sm"
                >
                  <option value="Friendly">{dict.tone_friendly}</option>
                  <option value="Formal">{dict.tone_formal}</option>
                  <option value="Encouraging">{dict.tone_encouraging}</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-lg font-bold text-slate-700">{dict.difficulty}</label>
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all bg-white text-lg shadow-sm"
                >
                  <option value="Beginner">{dict.diff_beginner}</option>
                  <option value="Intermediate">{dict.diff_intermediate}</option>
                  <option value="Advanced">{dict.diff_advanced}</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-lg font-bold text-slate-700">{dict.language}</label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all bg-white text-lg shadow-sm"
                >
                  <option value="Tiếng Việt">Tiếng Việt 🇻🇳</option>
                  <option value="English">English 🇺🇸</option>
                  <option value="Français">Français 🇫🇷</option>
                  <option value="日本語">日本語 🇯🇵</option>
                  <option value="Deutsch">Deutsch 🇩🇪</option>
                  <option value="Español">Español 🇪🇸</option>
                  <option value="한국어">한국어 🇰🇷</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-slate-100/50" />

        <section className="space-y-6">
          <div className="flex items-center gap-3 text-indigo-600">
            <Bell size={24} />
            <h3 className="font-bold uppercase tracking-widest text-base">{dict.notifications}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100/50">
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-lg">{dict.push_notif}</p>
                <p className="text-sm text-slate-500">{dict.push_notif_desc}</p>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`w-14 h-8 rounded-full transition-all relative shadow-inner ${notifications ? 'bg-brand-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${notifications ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100/50">
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-lg">{dict.reminder}</p>
                <p className="text-sm text-slate-500">{dict.reminder_desc}</p>
              </div>
              <input 
                type="time" 
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all bg-white font-bold text-lg shadow-sm"
              />
            </div>
          </div>
        </section>

        <hr className="border-slate-100/50" />

        <section className="space-y-6">
          <div className="flex items-center gap-3 text-emerald-600">
            <Clock size={24} />
            <h3 className="font-bold uppercase tracking-widest text-base">{dict.pomodoro}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-lg font-bold text-slate-700 flex justify-between">
                <span>{dict.pomo_work}</span>
                <span className="text-emerald-600">{pomoWork}m</span>
              </label>
              <input 
                type="range" 
                min="5" 
                max="120" 
                step="5"
                value={pomoWork}
                onChange={(e) => setPomoWork(parseInt(e.target.value))}
                className="w-full h-3 bg-slate-100 rounded-xl appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
            <div className="space-y-4">
              <label className="text-lg font-bold text-slate-700 flex justify-between">
                <span>{dict.pomo_break}</span>
                <span className="text-emerald-600">{pomoBreak}m</span>
              </label>
              <input 
                type="range" 
                min="1" 
                max="20" 
                step="1"
                value={pomoBreak}
                onChange={(e) => setPomoBreak(parseInt(e.target.value))}
                className="w-full h-3 bg-slate-100 rounded-xl appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </section>

        <hr className="border-slate-100/50" />

        <section className="space-y-6">
          <div className="flex items-center gap-3 text-red-600">
            <Trash2 size={24} />
            <h3 className="font-bold uppercase tracking-widest text-base">{dict.data}</h3>
          </div>
          <button 
            onClick={clearHistory}
            className="w-full flex items-center justify-between p-6 border-2 border-red-100 text-red-600 rounded-[2rem] hover:bg-red-50 transition-all font-bold text-lg group"
          >
            <span>{dict.clear_history}</span>
            <Trash2 size={24} className="group-hover:scale-110 transition-transform" />
          </button>
        </section>

        <button 
          onClick={handleSave}
          className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-bold text-xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 hover:scale-[1.02] active:scale-95"
        >
          <Save size={28} />
          {dict.save}
        </button>
      </div>
    </div>
  );
}
