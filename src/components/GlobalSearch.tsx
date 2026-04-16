import React, { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { 
  LayoutDashboard, 
  Map, 
  MessageSquare, 
  Camera, 
  BarChart3, 
  Search, 
  FileText, 
  Sparkles,
  ArrowRight,
  Lightbulb,
  History,
  Settings,
  Timer,
  Plus
} from "lucide-react";
import { STUDY_TIPS } from "@/src/constants";

interface GlobalSearchProps {
  setActiveTab: (tab: string) => void;
}

export function GlobalSearch({ setActiveTab }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [tutorHistory, setTutorHistory] = useState<any[]>([]);
  const [pathway, setPathway] = useState<string>("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (open) {
      const savedNotes = localStorage.getItem('eduai_notes');
      if (savedNotes) setNotes(JSON.parse(savedNotes));

      const savedTutor = localStorage.getItem('eduai_tutor_chat');
      if (savedTutor) setTutorHistory(JSON.parse(savedTutor));

      const savedPathway = localStorage.getItem('eduai_pathway');
      if (savedPathway) setPathway(savedPathway);
    }
  }, [open]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    setSearch("");
    command();
  };

  const createQuickNote = () => {
    if (!search.trim()) return;
    const savedNotes = JSON.parse(localStorage.getItem('eduai_notes') || '[]');
    const newNote = {
      id: Date.now().toString(),
      content: search,
      date: new Date().toLocaleDateString('vi-VN'),
      topic: 'Quick Note'
    };
    localStorage.setItem('eduai_notes', JSON.stringify([newNote, ...savedNotes].slice(0, 50)));
    setNotes([newNote, ...notes]);
    setSearch("");
    setOpen(false);
  };

  // Analyze content to find the best snippet
  const getSnippet = (content: string, query: string) => {
    if (!query) return content.substring(0, 100) + "...";
    const index = content.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return content.substring(0, 100) + "...";
    
    const start = Math.max(0, index - 40);
    const end = Math.min(content.length, index + query.length + 40);
    let snippet = content.substring(start, end);
    if (start > 0) snippet = "..." + snippet;
    if (end < content.length) snippet = snippet + "...";
    return snippet;
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all w-full max-w-xs group"
      >
        <Search size={16} className="group-hover:text-slate-600 transition-colors" />
        <span className="flex-1 text-left">Tìm kiếm nội dung...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Tìm kiếm mô-đun, ghi chú, bài học hoặc tin nhắn..." 
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>
            <div className="py-6 text-center space-y-4">
              <p>Không tìm thấy kết quả nào cho "{search}"</p>
              {search.length > 2 && (
                <button
                  onClick={createQuickNote}
                  className="px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-bold hover:bg-brand-600 transition-all flex items-center gap-2 mx-auto"
                >
                  <Plus size={16} />
                  Tạo ghi chú nhanh từ "{search}"
                </button>
              )}
            </div>
          </CommandEmpty>
          
          {search.length > 0 && (
            <CommandGroup heading="Hành động">
              <CommandItem onSelect={createQuickNote}>
                <Plus className="mr-2 h-4 w-4 text-brand-500" />
                <span>Tạo ghi chú mới: "{search}"</span>
              </CommandItem>
            </CommandGroup>
          )}

          <CommandGroup heading="Mô-đun học tập">
            <CommandItem onSelect={() => runCommand(() => setActiveTab('overview'))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Tổng quan</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setActiveTab('pathway'))}>
              <Map className="mr-2 h-4 w-4" />
              <span>Lộ trình Cá nhân</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setActiveTab('tutor'))}>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Gia sư Socratic</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setActiveTab('solver'))}>
              <Camera className="mr-2 h-4 w-4" />
              <span>Giải bài AI</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setActiveTab('pomodoro'))}>
              <Timer className="mr-2 h-4 w-4" />
              <span>Bộ đếm Pomodoro</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setActiveTab('progress'))}>
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Phân tích tiến độ</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setActiveTab('logs'))}>
              <History className="mr-2 h-4 w-4" />
              <span>Nhật ký học tập</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setActiveTab('settings'))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Cài đặt</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {notes.length > 0 && (
            <CommandGroup heading="Ghi chú của bạn">
              {notes.map((note) => (
                <CommandItem 
                  key={note.id} 
                  onSelect={() => runCommand(() => setActiveTab('overview'))}
                  value={`${note.topic} ${note.content}`}
                >
                  <FileText className="mr-2 h-4 w-4 text-emerald-500" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate font-medium">{note.topic || 'Ghi chú'}</span>
                    <span className="text-xs text-slate-500 line-clamp-1">
                      {getSnippet(note.content, search)}
                    </span>
                    <span className="text-[10px] text-slate-400">{note.date}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {tutorHistory.length > 0 && (
            <CommandGroup heading="Lịch sử trò chuyện">
              {tutorHistory.filter(m => m.role === 'assistant').map((msg, i) => (
                <CommandItem 
                  key={i} 
                  onSelect={() => runCommand(() => setActiveTab('tutor'))}
                  value={msg.content}
                >
                  <MessageSquare className="mr-2 h-4 w-4 text-brand-500" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate italic text-slate-600">
                      {getSnippet(msg.content, search)}
                    </span>
                    <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {pathway && (
            <CommandGroup heading="Lộ trình hiện tại">
              <CommandItem onSelect={() => runCommand(() => setActiveTab('pathway'))}>
                <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                <span className="truncate">Xem lại lộ trình học tập đã tạo</span>
              </CommandItem>
            </CommandGroup>
          )}

          <CommandSeparator />

          <CommandSeparator />

          <CommandGroup heading="Mẹo học tập">
            {STUDY_TIPS.map((tip, index) => (
              <CommandItem key={index} onSelect={() => runCommand(() => setActiveTab('overview'))}>
                <span className="mr-2">{tip.icon}</span>
                <span>{tip.title}: {tip.description.substring(0, 40)}...</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Hành động nhanh">
            <CommandItem onSelect={() => runCommand(() => setActiveTab('tutor'))}>
              <Sparkles className="mr-2 h-4 w-4 text-brand-500" />
              <span>Hỏi gia sư AI</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setActiveTab('solver'))}>
              <Camera className="mr-2 h-4 w-4 text-brand-500" />
              <span>Chụp ảnh giải bài</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
