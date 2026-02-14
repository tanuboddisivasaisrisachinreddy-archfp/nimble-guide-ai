import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2, Save, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface SavedSummary {
  id: string;
  title: string;
  summary: string;
  created_at: string;
}

const NotesPage = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<SavedSummary[]>([]);

  useEffect(() => {
    if (user) loadSaved();
  }, [user]);

  const loadSaved = async () => {
    const { data } = await supabase
      .from('saved_summaries')
      .select('id, title, summary, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setSaved(data);
  };

  const summarize = async () => {
    if (!notes.trim()) return;
    setLoading(true);
    setSummary('');
    try {
      const resp = await supabase.functions.invoke('summarize-notes', {
        body: { notes },
      });
      if (resp.error) throw resp.error;
      setSummary(resp.data?.summary || 'No summary returned.');
    } catch (e: any) {
      toast.error(e.message || 'Summarization failed');
    }
    setLoading(false);
  };

  const saveSummary = async () => {
    if (!summary || !user) return;
    const title = notes.slice(0, 60).trim() + (notes.length > 60 ? '...' : '');
    const { error } = await supabase.from('saved_summaries').insert({
      user_id: user.id,
      title,
      original_text: notes,
      summary,
    });
    if (error) toast.error(error.message);
    else { toast.success('Summary saved!'); loadSaved(); }
  };

  const deleteSummary = async (id: string) => {
    await supabase.from('saved_summaries').delete().eq('id', id);
    setSaved((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col lg:flex-row">
      {/* Input + Result */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Notes Summarizer</span>
        </div>
        <div className="flex flex-1 flex-col gap-0 lg:flex-row">
          <div className="flex flex-1 flex-col border-b border-border lg:border-b-0 lg:border-r">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste your notes here..."
              className="flex-1 resize-none rounded-none border-0 bg-card text-sm focus-visible:ring-0"
            />
            <div className="border-t border-border p-3">
              <Button onClick={summarize} disabled={loading || !notes.trim()} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                Summarize
              </Button>
            </div>
          </div>
          <div className="flex flex-1 flex-col">
            <ScrollArea className="flex-1 p-4">
              {summary ? (
                <>
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{summary}</ReactMarkdown>
                  </div>
                  <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={saveSummary}>
                    <Save className="h-4 w-4" /> Save Summary
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center py-20 text-center text-muted-foreground">
                  <FileText className="mb-4 h-10 w-10 opacity-40" />
                  <p className="text-sm">Paste notes and click Summarize</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Saved library */}
      <div className="w-full border-t border-border lg:w-72 lg:border-l lg:border-t-0">
        <div className="border-b border-border px-4 py-2">
          <span className="text-xs font-medium uppercase text-muted-foreground">Saved Summaries</span>
        </div>
        <ScrollArea className="h-64 lg:h-full">
          <div className="space-y-2 p-3">
            {saved.length === 0 && (
              <p className="py-8 text-center text-xs text-muted-foreground">No saved summaries yet</p>
            )}
            {saved.map((s) => (
              <Card key={s.id} className="border-border bg-card cursor-pointer" onClick={() => setSummary(s.summary)}>
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="flex items-center justify-between text-xs">
                    <span className="truncate">{s.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={(e) => { e.stopPropagation(); deleteSummary(s.id); }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <p className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default NotesPage;
