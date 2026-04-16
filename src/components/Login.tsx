import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LoginProps {
  onLogin: (username: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  // 1. Khởi tạo State an toàn từ LocalStorage
  const [username, setUsername] = useState(() => {
    try {
      const remembered = localStorage.getItem('eduai_remembered');
      return remembered ? JSON.parse(remembered).username : '';
    } catch { return ''; }
  });

  const [password, setPassword] = useState(() => {
    try {
      const remembered = localStorage.getItem('eduai_remembered');
      return remembered ? JSON.parse(remembered).password : '';
    } catch { return ''; }
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('eduai_remembered') !== null;
  });

  // 2. Hàm chuyển đổi chế độ (Login <-> Register) và xóa trắng dữ liệu nhạy cảm
  const toggleMode = () => {
    setIsRegister(!isRegister);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Giả lập xử lý xác thực
    setTimeout(() => {
      if (isRegister) {
        // --- LOGIC ĐĂNG KÝ ---
        if (password.length < 6) {
          toast.error('Mật khẩu cần ít nhất 6 ký tự để bảo mật!');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          toast.error('Mật khẩu xác nhận không khớp, hãy kiểm tra lại!');
          setIsLoading(false);
          return;
        }

        localStorage.setItem('eduai_auth', JSON.stringify({ username, password }));
        toast.success('Đăng ký tài khoản EduAI thành công!');
        setIsRegister(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        // --- LOGIC ĐĂNG NHẬP ---
        const savedAuth = localStorage.getItem('eduai_auth');
        // Tài khoản mặc định cho sinh viên Kế toán & Luật trải nghiệm nhanh
        const auth = savedAuth ? JSON.parse(savedAuth) : { username: 'User', password: '123' };

        if (username === auth.username && password === auth.password) {
          // Xử lý ghi nhớ đăng nhập
          if (rememberMe) {
            localStorage.setItem('eduai_remembered', JSON.stringify({ username, password }));
          } else {
            localStorage.removeItem('eduai_remembered');
          }

          localStorage.setItem('eduai_session', JSON.stringify({ username, loggedIn: true }));
          onLogin(username);
          toast.success(`Rất vui được gặp lại bạn, ${username}!`);
        } else {
          toast.error('Tên đăng nhập hoặc mật khẩu chưa đúng!');
        }
      }
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50/80 backdrop-blur-xl p-4">
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden"
      >
        <div className="p-10 space-y-8">
          <div className="text-center space-y-3">
            <motion.div 
              whileHover={{ rotate: 10 }}
              className="inline-flex p-4 bg-brand-50 text-brand-600 rounded-3xl"
            >
              <ShieldCheck size={40} />
            </motion.div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
              {isRegister ? 'Gia nhập EduAI' : 'Chào mừng bạn!'}
            </h2>
            <p className="text-slate-400 text-sm">Hệ sinh thái học tập Socratic thông minh</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-500 transition-colors" size={20} />
                <input 
                  type="text"
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-500 transition-colors" size={20} />
                <input 
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                  required
                />
              </div>

              {isRegister && (
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-500 transition-colors" size={20} />
                  <input 
                    type="password"
                    placeholder="Xác nhận mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                    required
                  />
                </div>
              )}
            </div>

            {!isRegister && (
              <div className="flex items-center gap-2 px-2">
                <input 
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-brand-500 border-slate-300 rounded focus:ring-brand-500"
                />
                <label htmlFor="remember" className="text-sm text-slate-500 cursor-pointer">Ghi nhớ đăng nhập</label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-brand-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-200 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isRegister ? 'Đăng ký ngay' : 'Đăng nhập'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <button 
              onClick={toggleMode}
              className="text-sm font-medium text-slate-400 hover:text-brand-600 transition-colors"
            >
              {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
