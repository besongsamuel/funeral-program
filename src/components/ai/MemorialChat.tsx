import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { useMemorial } from '@/hooks/useMemorial';
import { getAssistantUrl } from '@/lib/amplify';
import { answerFromContext } from '@/lib/chat-answer';
import { getFirstName } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SESSION_KEY = 'memorial-chat-session';

function getSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function getStoredMessages(): ChatMessage[] {
  try {
    return JSON.parse(sessionStorage.getItem('memorial-chat-messages') ?? '[]');
  } catch {
    return [];
  }
}

function storeMessages(messages: ChatMessage[]) {
  sessionStorage.setItem('memorial-chat-messages', JSON.stringify(messages.slice(-20)));
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\[.*?\]\(.*?\)|\*\*[^*]+\*\*)/g).filter((part) => part.length > 0);
  return parts.map((part, i) => {
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const href = linkMatch[2];
      const label = linkMatch[1];
      const className = 'font-medium text-memorial-600 underline hover:text-memorial-800';
      if (href.startsWith('/')) {
        return (
          <Link key={i} to={href} className={className}>
            {label}
          </Link>
        );
      }
      return (
        <a key={i} href={href} className={className}>
          {label}
        </a>
      );
    }
    const boldMatch = part.match(/^\*\*(.+)\*\*$/);
    if (boldMatch) {
      return (
        <strong key={i} className="font-semibold text-gray-900">
          {boldMatch[1]}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function localAnswer(question: string, ctx: ReturnType<typeof useMemorial>['data']): string {
  if (!ctx) return 'Please try again in a moment.';
  return answerFromContext(question, ctx);
}

export function MemorialChat() {
  const { data } = useMemorial();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(getStoredMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!data?.aiSettings.isEnabled) return null;

  const firstName = getFirstName(data.memorial.fullName);
  const assistantName = data.aiSettings.assistantName;

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const assistantUrl = getAssistantUrl();
      let reply: string;

      if (assistantUrl) {
        const res = await fetch(assistantUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memorialId: data.memorial.id,
            sessionId: getSessionId(),
            message: text.trim(),
            memorialContext: data,
          }),
        });
        const contentType = res.headers.get('content-type') ?? '';
        if (contentType.includes('text/event-stream')) {
          const body = await res.text();
          const match = body.match(/data: ({.*})/);
          reply = match ? JSON.parse(match[1]).reply : localAnswer(text, data);
        } else {
          const json = await res.json();
          reply = json.reply ?? localAnswer(text, data);
        }
      } else {
        await new Promise((r) => setTimeout(r, 800));
        reply = localAnswer(text, data);
      }

      const assistantMsg: ChatMessage = { role: 'assistant', content: reply };
      const final: ChatMessage[] = [...updated, assistantMsg];
      setMessages(final);
      storeMessages(final);
    } catch {
      const assistantMsg: ChatMessage = { role: 'assistant', content: localAnswer(text, data) };
      const final: ChatMessage[] = [...updated, assistantMsg];
      setMessages(final);
      storeMessages(final);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content: string) => {
    const paragraphs = content.split(/\n+/).filter((p) => p.length > 0);
    return paragraphs.map((paragraph, pi) => (
      <p key={pi} className={pi === 0 ? undefined : 'mt-2'}>
        {renderInlineMarkdown(paragraph)}
      </p>
    ));
  };

  return (
    <div className="chat-widget">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 z-50 flex h-[min(600px,80vh)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-gold-300 bg-white shadow-2xl sm:bottom-24 sm:right-6"
          >
            <div className="flex items-center justify-between border-b-2 border-gold-400 bg-memorial-950 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <span className="font-medium">{assistantName}</span>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close chat">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center">
                  <p className="text-sm text-gray-600">{data.aiSettings.greeting}</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === 'user'
                        ? 'bg-memorial-800 text-gold-50'
                        : 'bg-gold-50 text-gray-800'
                    }`}
                  >
                    {renderContent(msg.content)}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex gap-1 px-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-2 w-2 rounded-full bg-gold-400"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-gold-200 p-3">
              {data.aiQuickQuestions.length > 0 && (
                <div className="mb-3 flex max-h-24 flex-wrap gap-2 overflow-y-auto">
                  {data.aiQuickQuestions.map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => sendMessage(q.questionText)}
                      disabled={loading}
                      className="rounded-full border border-gold-300 bg-gold-50 px-3 py-1.5 text-xs text-memorial-800 hover:bg-gold-100 disabled:opacity-50"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask about ${firstName}...`}
                  className="flex-1 rounded-full border border-gold-200 px-4 py-2 text-sm outline-none focus:border-gold-500"
                  maxLength={1000}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="rounded-full bg-gold-400 p-2.5 text-memorial-950 disabled:opacity-50"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-gold-400 px-5 py-3 text-sm font-medium text-memorial-950 shadow-lg hover:bg-gold-500 sm:bottom-6 sm:right-6"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Ask about {firstName}</span>
      </motion.button>
    </div>
  );
}
