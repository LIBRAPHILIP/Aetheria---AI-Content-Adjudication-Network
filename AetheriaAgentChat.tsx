import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useEffect, useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

export default function AetheriaAgentChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ 
      api: '/api/agent',
      prepareSendMessagesRequest: ({ messages, ...rest }) => ({
        body: {
          ...rest.body,
          messages: messages.map(m => {
            const mappedContent = m.parts?.filter(p => p.type === 'text').map(p => ({
              type: 'text',
              text: (p as any).text || ''
            })) || [];
            
            return {
              role: m.role,
              content: mappedContent.length > 0 ? mappedContent : (m as any).content
            };
          })
        }
      })
    }),
    messages: [
      {
        id: '1',
        role: 'assistant',
        parts: [{ type: 'text', text: 'I am AETHERIA, guardian of the GenLayer Consensus. How may I assist you today? I can fetch network statistics, recent cases, or discuss protocol mechanics.' }],
      },
    ],
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input.trim(), role: 'user' });
    setInput('');
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickQuestions = [
    "Summarize disputes",
    "Explain consensus",
    "Dashboard stats",
  ];

  const handleQuickQuestion = (q: string) => {
    sendMessage({ text: q, role: 'user' });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-transform",
          isOpen && "scale-0 opacity-0 pointer-events-none"
        )}
        aria-label="Open Aetheria Chat"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <div className={cn(
        "fixed bottom-6 right-6 z-50 w-full max-w-[360px] h-[500px] flex flex-col bg-[#0B0D13]/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl transition-all duration-300 transform origin-bottom-right",
        isOpen ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-indigo-900/20 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">⚛️</span>
            <span className="font-bold text-slate-100 tracking-wider text-sm">AETHERIA</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={cn(
                "max-w-[85%] rounded-xl p-3 text-sm leading-relaxed",
                m.role === 'user' 
                  ? "bg-indigo-600 text-white ml-auto rounded-br-sm" 
                  : "bg-[#1E232F] text-slate-200 border border-white/5 mr-auto rounded-bl-sm"
              )}
            >
              {m.parts?.map((p, idx) => {
                if (p.type === 'text') {
                  return m.role === 'user' ? (
                    <span key={idx}>{p.text}</span>
                  ) : (
                    <div key={idx} className="markdown-prose prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{p.text}</ReactMarkdown>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ))}
          {isLoading && (
            <div className="bg-[#1E232F] text-slate-400 border border-white/5 mr-auto rounded-xl rounded-bl-sm p-3 text-sm flex items-center gap-2 w-fit">
               <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="px-4 pb-2 bg-[#07090E] pt-3 flex flex-wrap gap-2 border-t border-white/10 z-10 shrink-0">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleQuickQuestion(q)}
              disabled={isLoading}
              className="text-[11px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 tracking-wider font-medium"
            >
              {q}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-3 bg-[#07090E] rounded-b-2xl shrink-0">
          <div className="flex gap-2 relative">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask AETHERIA..."
              disabled={isLoading}
              className="flex-1 bg-[#121622] border border-white/10 rounded-lg pl-3 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input?.trim()}
              className="absolute right-1.5 top-1.5 p-1.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
