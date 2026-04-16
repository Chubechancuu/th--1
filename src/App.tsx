import React, { useState } from 'react';
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

  if (!isLoggedIn) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <Login onLogin={() => setIsLoggedIn(true)} />
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'pathway':
        return <LearningPathwayGenerator />;
      case 'tutor':
        return <Tutor />;
      case 'practice':
        return <Practice />;
      case 'solver':
        return <Solver />;
      case 'logs':
        return <Logs setActiveTab={setActiveTab} />;
      case 'progress':
        return <Progress />;
      case 'pomodoro':
        return <Pomodoro />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
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
