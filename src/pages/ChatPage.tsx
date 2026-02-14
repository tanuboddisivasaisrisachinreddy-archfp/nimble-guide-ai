import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { streamChat } from '@/lib/streamChat';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

type Msg = { role: 'user' | 'assistant'; content: string };

const ChatPage = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [eli10, setEli10] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Msg = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: [...messages, userMsg],
      skillLevel,
      eli10,
      onDelta: upsert,
      onDone: () => setIsLoading(false),
      onError: (err) => { toast.error(err); setIsLoading(false); },
    });
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-4 border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Skill Level</Label>
          <Select value={skillLevel} onValueChange={setSkillLevel}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">🌱 Beginner</SelectItem>
              <SelectItem value="intermediate">🔧 Intermediate</SelectItem>
              <SelectItem value="advanced">🚀 Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="eli10" checked={eli10} onCheckedChange={setEli10} />
          <Label htmlFor="eli10" className="flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" /> Explain Like I'm 10
          </Label>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="mx-auto max-w-3xl space-y-4 py-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Bot className="mb-4 h-12 w-12 text-primary/50" />
              <h2 className="text-lg font-semibold text-foreground">Ask me anything</h2>
              <p className="text-sm text-muted-foreground">Programming, concepts, debugging — I'm here to help you learn.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-foreground'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === 'user' && (
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary">
                  <User className="h-4 w-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex gap-3">
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Bot className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="rounded-lg bg-card border border-border px-4 py-3 text-sm text-muted-foreground">
                Thinking...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="mx-auto flex max-w-3xl gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="min-h-[44px] max-h-32 resize-none bg-card"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
            }}
          />
          <Button onClick={send} disabled={isLoading || !input.trim()} size="icon" className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
