import React, { useState, useRef, useEffect } from 'react';
import client from '../api/client';
import { useToast } from '../components/Toast';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Package,
  TrendingUp,
  HelpCircle,
  Clock,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AIAssistant: React.FC = () => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_init',
      sender: 'ai',
      text: "Greetings! I am **QuantiX AI**, your intelligent shop management assistant.\n\nI have real-time visibility into your store's inventory levels, sales metrics, and stock thresholds. How can I assist with your store operations today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setLoading(true);

    try {
      const res = await client.post('/ai/chat', { message: textToSend });
      const aiReply = res.data.reply;

      const aiMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      showToast('AI Error', 'Could not fetch response from QuantiX AI service.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Check items requiring urgent stock reorder',
    'Summarize today\'s revenue & average ticket',
    'Give me 3 marketing ideas for store products',
    'Calculate estimate for 8% sales tax on $500 gross',
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--color-rule)] flex items-center justify-between">
        <div>
          <span className="section-label font-mono-num">INTELLIGENT STORE AUDITOR</span>
          <h1 className="font-serif-heading text-2xl md:text-3xl font-bold text-[var(--color-text-ink)] flex items-center gap-2">
            QuantiX AI Assistant
          </h1>
        </div>
        <span className="stamp stamp-amber text-xs">
          GEMINI 2.5 ACTIVE
        </span>
      </div>

      {/* Main Chat Container */}
      <div className="ledger-card rounded flex flex-col h-[600px] bg-[var(--color-paper-raised)] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded shrink-0 flex items-center justify-center font-bold text-xs ${
                  msg.sender === 'user'
                    ? 'bg-[var(--color-ink)] text-[var(--color-paper)]'
                    : 'bg-[var(--color-stamp-amber)] text-[var(--color-ink)]'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Index Card / Receipt Slip */}
              <div
                className={`max-w-lg p-4 rounded text-xs leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] text-[var(--color-text-ink)] font-medium'
                    : 'ledger-card bg-[var(--color-paper-raised)] border border-[var(--color-rule)] text-[var(--color-text-ink)] font-mono-num'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div className="text-[9px] font-mono-num text-[var(--color-text-muted)] mt-2 text-right">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded shrink-0 bg-[var(--color-stamp-amber)] text-[var(--color-ink)] flex items-center justify-center">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="ledger-card p-3 rounded text-xs font-mono-num text-[var(--color-text-muted)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-stamp-amber)] animate-ping"></span>
                <span>Auditing store ledger & generating insights...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-[var(--color-rule-subtle)] bg-[var(--color-paper-subtle)] flex items-center gap-2 overflow-x-auto">
          <span className="section-label shrink-0 text-[10px]">SUGGESTIONS:</span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="shrink-0 px-2.5 py-1 bg-[var(--color-paper-raised)] border border-[var(--color-rule)] hover:border-[var(--color-stamp-amber)] rounded text-[11px] font-mono-num text-[var(--color-text-ink)] transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Query Input Footer */}
        <div className="p-4 border-t border-[var(--color-rule)] bg-[var(--color-paper-raised)]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask QuantiX AI about inventory, sales, calculations..."
              className="flex-1 px-3.5 py-2.5 bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] rounded text-xs text-[var(--color-text-ink)] focus:outline-none focus:border-[var(--color-stamp-amber)] font-mono-num"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-4 py-2.5 bg-[var(--color-ink)] text-[var(--color-paper)] font-mono-num text-xs font-bold uppercase tracking-wider rounded transition-all hover:opacity-90 active:scale-[0.98] flex items-center gap-1.5 disabled:opacity-40"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
