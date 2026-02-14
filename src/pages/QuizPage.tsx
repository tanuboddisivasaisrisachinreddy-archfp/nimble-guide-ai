import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, RotateCcw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Question {
  question: string;
  options?: string[];
  answer: string;
}

const QuizPage = () => {
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'quiz' | 'flashcard'>('quiz');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  const generate = async () => {
    if (!topic.trim() && !notes.trim()) return;
    setLoading(true);
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setFlipped({});
    try {
      const resp = await supabase.functions.invoke('generate-quiz', {
        body: { topic, notes, mode },
      });
      if (resp.error) throw resp.error;
      setQuestions(resp.data?.questions || []);
    } catch (e: any) {
      toast.error(e.message || 'Generation failed');
    }
    setLoading(false);
  };

  const score = questions.reduce((acc, q, i) => {
    return acc + (answers[i]?.toLowerCase().trim() === q.answer.toLowerCase().trim() ? 1 : 0);
  }, 0);

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <div className="border-b border-border px-4 py-3">
        <div className="mx-auto flex max-w-3xl flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <Label className="text-xs text-muted-foreground">Topic</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., React hooks, Binary search..." className="bg-card" />
          </div>
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'quiz' | 'flashcard')} className="w-auto">
            <TabsList className="h-9">
              <TabsTrigger value="quiz" className="text-xs">Quiz</TabsTrigger>
              <TabsTrigger value="flashcard" className="text-xs">Flashcards</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={generate} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            Generate
          </Button>
        </div>
        <div className="mx-auto mt-2 max-w-3xl">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Or paste notes here..." className="min-h-[60px] bg-card text-sm" />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {questions.length === 0 && !loading && (
            <div className="flex flex-col items-center py-20 text-center text-muted-foreground">
              <Brain className="mb-4 h-10 w-10 opacity-40" />
              <p className="text-sm">Enter a topic or notes and click Generate</p>
            </div>
          )}

          {mode === 'quiz' && questions.map((q, i) => (
            <Card key={i} className="border-border bg-card">
              <CardContent className="p-4">
                <p className="mb-3 text-sm font-medium text-foreground">{i + 1}. {q.question}</p>
                {q.options ? (
                  <div className="space-y-2">
                    {q.options.map((opt, j) => (
                      <button
                        key={j}
                        onClick={() => !submitted && setAnswers({ ...answers, [i]: opt })}
                        className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                          answers[i] === opt
                            ? submitted
                              ? opt.toLowerCase().trim() === q.answer.toLowerCase().trim()
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-destructive bg-destructive/10 text-destructive'
                              : 'border-primary bg-primary/10 text-primary'
                            : submitted && opt.toLowerCase().trim() === q.answer.toLowerCase().trim()
                              ? 'border-primary/50 bg-primary/5'
                              : 'border-border hover:border-muted-foreground/30'
                        }`}
                      >
                        {opt}
                        {submitted && opt.toLowerCase().trim() === q.answer.toLowerCase().trim() && (
                          <CheckCircle className="ml-2 inline h-4 w-4 text-primary" />
                        )}
                        {submitted && answers[i] === opt && opt.toLowerCase().trim() !== q.answer.toLowerCase().trim() && (
                          <XCircle className="ml-2 inline h-4 w-4 text-destructive" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <Input
                    value={answers[i] || ''}
                    onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                    placeholder="Your answer..."
                    disabled={submitted}
                    className="bg-background"
                  />
                )}
              </CardContent>
            </Card>
          ))}

          {mode === 'flashcard' && questions.map((q, i) => (
            <Card
              key={i}
              className="cursor-pointer border-border bg-card transition-all hover:border-primary/30"
              onClick={() => setFlipped({ ...flipped, [i]: !flipped[i] })}
            >
              <CardContent className="flex min-h-[120px] items-center justify-center p-6 text-center">
                <p className="text-sm text-foreground">
                  {flipped[i] ? q.answer : q.question}
                </p>
              </CardContent>
              <div className="border-t border-border px-4 py-2 text-center text-xs text-muted-foreground">
                {flipped[i] ? 'Answer' : 'Click to reveal'}
              </div>
            </Card>
          ))}

          {mode === 'quiz' && questions.length > 0 && (
            <div className="flex items-center gap-3 pt-2">
              {!submitted ? (
                <Button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < questions.length}>
                  Submit Answers
                </Button>
              ) : (
                <>
                  <div className="text-sm font-medium text-foreground">
                    Score: {score}/{questions.length}
                  </div>
                  <Button variant="outline" onClick={() => { setSubmitted(false); setAnswers({}); }} className="gap-2">
                    <RotateCcw className="h-4 w-4" /> Retry
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
