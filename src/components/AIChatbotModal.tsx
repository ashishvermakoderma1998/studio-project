import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  RefreshCw, 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import { api } from '../api/client';
import { ChatMessage } from '../types';

interface AIChatbotProps {
  onOpenBooking: (serviceSlug?: string) => void;
  onNavigate: (page: string, param?: string) => void;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ onOpenBooking, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `Namaste! 🙏 Welcome to **Ashish Wedding Film Studio** (Gumo, Jhumri Telaiya, Jharkhand).\n\nI am your 24/7 AI studio assistant. How can I help with your special wedding, vehicle shoot, or photography training today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [
        'Wedding Packages & Pricing',
        'New Vehicle Shoot (₹9,999)',
        'Pre-Wedding at Telaiya Dam',
        'Academy Training Courses',
        'Studio Location in Jhumri Telaiya',
        'How to Book Online'
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await api.sendChatMessage(query, historyPayload);

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: query.toLowerCase().includes('price') || query.toLowerCase().includes('wedding') 
          ? ['Book Royal Wedding Package', 'Submit Custom Enquiry', 'Visit Studio in Gumo']
          : ['Check Available Dates', 'Talk to Ashish Ji']
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: 'bot-err-' + Date.now(),
        sender: 'bot',
        text: 'Namaste! We can assist you directly with wedding packages, 4K video shoots, and training courses. Please feel free to call our lead director Ashish at **+91 87090 17294** or book directly online.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: `Conversation restarted! How can I assist you with **Ashish Wedding Film Studio** today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: [
          'Wedding Packages & Pricing',
          'New Vehicle Shoot (₹9,999)',
          'Academy Training Courses',
          'Studio Location in Jhumri Telaiya'
        ]
      }
    ]);
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <motion.button
            id="ai-chatbot-floating-btn"
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-neutral-950 font-bold shadow-2xl shadow-amber-500/40 border border-amber-300/50 hover:shadow-amber-500/60 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-neutral-950 text-amber-400 flex items-center justify-center shadow">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <span className="hidden sm:inline text-xs tracking-wide">
              Chat with Ashish AI
            </span>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-neutral-950 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-neutral-950 rounded-full" />
          </motion.button>
        )}
      </div>

      {/* Floating Chat Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-chatbot-window"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[410px] h-[580px] max-h-[85vh] rounded-3xl bg-neutral-950/95 border border-amber-500/30 shadow-2xl shadow-black/80 backdrop-blur-2xl flex flex-col overflow-hidden text-neutral-200"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-neutral-900 via-amber-950/50 to-neutral-900 border-b border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-neutral-950 rounded-full" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-serif flex items-center gap-1.5">
                    Ashish Studio AI
                    <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase">
                      Online
                    </span>
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Jhumri Telaiya, Jharkhand Studio Expert
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  title="Reset conversation"
                  className="p-2 rounded-xl text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-sm">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-medium rounded-tr-none shadow-md shadow-amber-500/10'
                        : 'bg-neutral-900/90 border border-neutral-800 text-neutral-200 rounded-tl-none shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">
                      {m.text.split('\n').map((line, idx) => {
                        // Quick bold parser for formatted display
                        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        return (
                          <div 
                            key={idx} 
                            dangerouslySetInnerHTML={{ __html: formatted }}
                            className="min-h-[1.2rem]"
                          />
                        );
                      })}
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 px-1">{m.timestamp}</span>

                  {/* Quick Replies if any */}
                  {m.quickReplies && m.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.quickReplies.map((qr, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (qr.includes('Book')) {
                              onOpenBooking();
                              setIsOpen(false);
                            } else if (qr.includes('Enquiry')) {
                              onNavigate('enquiry');
                              setIsOpen(false);
                            } else {
                              handleSend(qr);
                            }
                          }}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-900 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-neutral-950 transition-all font-medium"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-neutral-400 text-xs w-fit">
                  <Bot className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>Ashish AI is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Direct Booking Shortcut Bar */}
            <div className="px-4 py-2 bg-neutral-900/60 border-t border-neutral-800/80 flex items-center justify-between gap-2 text-xs">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1 truncate">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Reserve your date online:</span>
              </span>
              <button
                onClick={() => {
                  onOpenBooking();
                  setIsOpen(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 hover:bg-amber-500 hover:text-neutral-950 transition-colors text-[11px] shrink-0"
              >
                Instant Booking →
              </button>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center gap-2"
            >
              <input
                id="chatbot-input-field"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about wedding rates, vehicle reels, studio..."
                disabled={loading}
                className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                id="chatbot-send-btn"
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-neutral-950 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-md shadow-amber-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
