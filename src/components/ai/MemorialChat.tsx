import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { useMemorial } from '@/hooks/useMemorial';
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
  const q = question.toLowerCase();
  const { memorial, funeralEvents, biographySections, donationCauses, aiKnowledgeEntries } = ctx;

  if (q.includes('service') || q.includes('funeral') || q.includes('when') || q.includes('where') || q.includes('programme') || q.includes('program')) {
    const service = funeralEvents.find((e) => e.kind === 'service');
    if (service) {
      const when = service.timeLabel
        ? `${new Date(service.startsAt).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at ${service.timeLabel}`
        : new Date(service.startsAt).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
      return `The Funeral and Thanksgiving Programme runs from 7 to 19 November 2026.\n\nThe funeral service will be held at **${service.venueName}** on ${when}.\n\nAddress: ${service.address ?? 'See funeral page for details'}\n\nBurial follows at the family compound in Limbola. [View the full programme](/funeral)`;
    }
  }
  if (q.includes('contact') || q.includes('phone') || q.includes('reach')) {
    return 'Family contacts are listed by country on the Funeral page, including Cameroon, Germany, the USA, and Canada.\n\n[View family contacts](/funeral)';
  }
  if (q.includes('born') || q.includes('childhood')) {
    const childhood = biographySections.find((b) => b.kind === 'childhood');
    return childhood ? `${childhood.body}\n\n[Read more about her life](/legacy)` : `She was born on ${memorial.bornOn}. [Learn more](/legacy)`;
  }
  if (q.includes('legacy') || q.includes('accomplish')) {
    const acc = biographySections.find((b) => b.kind === 'accomplishments');
    return acc ? `${acc.body}\n\n[Explore her legacy](/legacy)` : memorial.shortTribute ?? 'A remarkable life. [Learn more](/legacy)';
  }
  if (q.includes('donat') || q.includes('flowers')) {
    const cause = donationCauses[0];
    return cause ? `${cause.inLieuOfFlowersNote ?? cause.description}\n\n[Make a donation](/donations)` : 'Please see the donations page.';
  }
  if (q.includes('memory') || q.includes('tribute') || q.includes('condolence') || q.includes('share')) {
    return 'You can share a memory or condolence on the Tributes page. Your message will be reviewed by the family before appearing publicly.\n\n[Share a memory](/tributes)';
  }

  const knowledge = aiKnowledgeEntries.find((k) =>
    k.question.toLowerCase().includes(q.split(' ').find((w) => w.length > 4) ?? '') ?? false,
  );
  if (knowledge) return knowledge.answer;

  return ctx.aiSettings.fallbackMessage ?? "I'm sorry, I don't have that information. Please contact the family on the Funeral page.";
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
      const assistantUrl = import.meta.env.VITE_ASSISTANT_URL;
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
            className="fixed bottom-20 right-4 z-50 flex h-[min(600px,80vh)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-memorial-200 bg-white shadow-2xl sm:bottom-24 sm:right-6"
          >
            <div className="flex items-center justify-between bg-memorial-700 px-4 py-3 text-white">
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
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {data.aiQuickQuestions.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => sendMessage(q.questionText)}
                        className="rounded-full border border-memorial-200 bg-memorial-50 px-3 py-1.5 text-xs text-memorial-700 hover:bg-memorial-100"
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
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
                        ? 'bg-memorial-700 text-white'
                        : 'bg-memorial-50 text-gray-800'
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
                      className="h-2 w-2 rounded-full bg-memorial-400"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-memorial-100 p-3">
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
                  className="flex-1 rounded-full border border-memorial-200 px-4 py-2 text-sm outline-none focus:border-memorial-500"
                  maxLength={1000}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="rounded-full bg-memorial-700 p-2.5 text-white disabled:opacity-50"
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
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-memorial-700 px-5 py-3 text-sm font-medium text-white shadow-lg hover:bg-memorial-800 sm:bottom-6 sm:right-6"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Ask about {firstName}</span>
      </motion.button>
    </div>
  );
}
