import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Camera, Upload, Sparkles, Loader2, X, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { solveProblem } from '@/src/lib/gemini';
import { cn } from '@/src/lib/utils';

const LANGUAGES_DICT: Record<string, any> = {
  "Tiếng Việt": {
    "header": "Giải bài tập tốc độ cao",
    "desc": "AI quét và phân tích đề bài trong tích tắc.",
    "mode_label": "Chế độ giải:",
    "mode_general": "Phổ thông",
    "mode_accounting": "Kế toán (Đại học)",
    "upload_title": "Tải ảnh lên hoặc Chụp ảnh",
    "upload_desc": "Hỗ trợ JPG, PNG",
    "btn_solve": "Giải nhanh ngay",
    "result_title": "Kết quả phân tích",
    "empty_result": "Kết quả sẽ hiển thị tại đây sau khi AI xử lý xong.",
    "listening": "Đang nghe...",
    "processing": "AI đang xử lý..."
  },
  "English": {
    "header": "Fast Problem Solver",
    "desc": "AI scans and analyzes problems in an instant.",
    "mode_label": "Solver Mode:",
    "mode_general": "General",
    "mode_accounting": "Accounting (University)",
    "upload_title": "Upload Image or Take Photo",
    "upload_desc": "Supports JPG, PNG",
    "btn_solve": "Solve Now",
    "result_title": "Analysis Result",
    "empty_result": "Results will appear here after AI processing.",
    "listening": "Listening...",
    "processing": "AI is processing..."
  },
  "Français": {
    "header": "Résolveur de Problèmes Rapide",
    "desc": "L'IA scanne et analyse les problèmes en un instant.",
    "mode_label": "Mode de résolution :",
    "mode_general": "Général",
    "mode_accounting": "Comptabilité (Université)",
    "upload_title": "Télécharger une image ou prendre une photo",
    "upload_desc": "Supporte JPG, PNG",
    "btn_solve": "Résoudre maintenant",
    "result_title": "Résultat de l'analyse",
    "empty_result": "Les résultats apparaîtront ici après le traitement par l'IA.",
    "listening": "Écoute...",
    "processing": "L'IA traite..."
  },
  "日本語": {
    "header": "高速問題解決ツール",
    "desc": "AIが瞬時に問題をスキャンして分析します。",
    "mode_label": "解決モード：",
    "mode_general": "一般",
    "mode_accounting": "会計（大学レベル）",
    "upload_title": "画像をアップロードまたは写真を撮る",
    "upload_desc": "JPG、PNGをサポート",
    "btn_solve": "今すぐ解決",
    "result_title": "分析結果",
    "empty_result": "AIの処理後、ここに結果が表示されます。",
    "listening": "聴取中...",
    "processing": "AIが処理しています..."
  }
};

export function Solver() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [mode, setMode] = useState('General');
  const [language, setLanguage] = useState('Tiếng Việt');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dict = LANGUAGES_DICT[language] || LANGUAGES_DICT['Tiếng Việt'];

  useEffect(() => {
    const savedSettings = localStorage.getItem('eduai_settings');
    if (savedSettings) {
      setLanguage(JSON.parse(savedSettings).language || 'Tiếng Việt');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolve = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const res = await solveProblem(image, mode, language);
      setResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setResult('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-8 px-4">
      <header className="text-center space-y-6">
        <div className="inline-flex p-6 bg-brand-500 text-white rounded-[2.5rem] shadow-2xl shadow-brand-200 -rotate-3">
          <Camera size={56} />
        </div>
        <h2 className="text-5xl font-display font-bold text-slate-800">{dict.header}</h2>
        <p className="text-slate-500 text-2xl max-w-3xl mx-auto">{dict.desc}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-10">
          <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/20 shadow-2xl flex items-center gap-8 glass-morphism">
            <span className="text-lg font-bold text-slate-400 uppercase tracking-widest">{dict.mode_label}</span>
            <div className="flex gap-4 flex-1">
              <button
                onClick={() => setMode('General')}
                className={cn(
                  "flex-1 py-4 px-6 rounded-2xl text-lg font-bold transition-all shadow-sm",
                  mode === 'General' ? "bg-brand-500 text-white shadow-brand-200" : "bg-slate-100/50 text-slate-500 hover:bg-slate-100"
                )}
              >
                {dict.mode_general}
              </button>
              <button
                onClick={() => setMode('Accounting')}
                className={cn(
                  "flex-1 py-4 px-6 rounded-2xl text-lg font-bold transition-all shadow-sm",
                  mode === 'Accounting' ? "bg-brand-500 text-white shadow-brand-200" : "bg-slate-100/50 text-slate-500 hover:bg-slate-100"
                )}
              >
                {dict.mode_accounting}
              </button>
            </div>
          </div>

          <div 
            onClick={() => !image && fileInputRef.current?.click()}
            className={cn(
              "relative aspect-video rounded-[4rem] border-4 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden group shadow-2xl",
              image ? "border-brand-500 bg-white" : "border-slate-200 bg-white/50 backdrop-blur-2xl hover:bg-white/80 cursor-pointer"
            )}
          >
            {image ? (
              <>
                <img 
                  src={`data:image/jpeg;base64,${image}`} 
                  alt="Uploaded problem" 
                  className="w-full h-full object-contain p-10"
                />
                <button 
                  onClick={(e) => { e.stopPropagation(); clearImage(); }}
                  className="absolute top-8 right-8 p-4 bg-white/90 backdrop-blur rounded-full text-slate-600 hover:text-red-500 shadow-2xl transition-all hover:scale-110 border border-white/20"
                >
                  <X size={32} />
                </button>
              </>
            ) : (
              <div className="text-center p-16 space-y-8">
                <div className="w-32 h-32 bg-brand-50 text-brand-500 rounded-[3rem] flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform">
                  <Upload size={64} />
                </div>
                <div>
                  <p className="text-3xl font-display font-bold text-slate-800">{dict.upload_title}</p>
                  <p className="text-slate-400 text-xl mt-3">{dict.upload_desc}</p>
                </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <button
            onClick={handleSolve}
            disabled={!image || loading}
            className="w-full bg-brand-500 text-white py-8 rounded-[3rem] font-bold text-2xl flex items-center justify-center gap-4 hover:bg-brand-600 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-2xl shadow-brand-200"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={36} />
            ) : (
              <>
                <Sparkles size={36} />
                {dict.btn_solve}
              </>
            )}
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl rounded-[4rem] border border-white/20 shadow-2xl overflow-hidden flex flex-col min-h-[600px] glass-morphism">
          <div className="p-10 border-b border-slate-100/50 bg-white/60 flex items-center gap-6">
            <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-3xl flex items-center justify-center shadow-sm border border-brand-100/50">
              <Sparkles size={36} />
            </div>
            <h3 className="text-3xl font-display font-bold text-slate-800">{dict.result_title}</h3>
          </div>
          <div className="flex-1 p-10 lg:p-14 overflow-y-auto custom-scrollbar">
            {result ? (
              <div className="markdown-body prose-2xl max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-30">
                <div className="w-40 h-40 bg-slate-50 rounded-full flex items-center justify-center">
                  <ImageIcon size={96} className="text-slate-200" />
                </div>
                <p className="text-slate-500 text-2xl max-w-sm leading-relaxed">{dict.empty_result}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
