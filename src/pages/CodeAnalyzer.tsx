import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code2, Play, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

const languages = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby'];

const CodeAnalyzer = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('Python');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const resp = await supabase.functions.invoke('analyze-code', {
        body: { code, language },
      });
      if (resp.error) throw resp.error;
      setResult(resp.data?.analysis || 'No analysis returned.');
    } catch (e: any) {
      toast.error(e.message || 'Analysis failed');
    }
    setLoading(false);
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col lg:flex-row">
      {/* Input panel */}
      <div className="flex flex-1 flex-col border-b border-border lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 border-b border-border px-4 py-2">
          <Code2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Code Input</span>
          <div className="ml-auto flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here..."
          className="flex-1 resize-none rounded-none border-0 bg-card font-mono text-sm focus-visible:ring-0"
        />
        <div className="border-t border-border p-3">
          <Button onClick={analyze} disabled={loading || !code.trim()} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Analyze Code
          </Button>
        </div>
      </div>

      {/* Result panel */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2">
          <span className="text-sm font-medium text-foreground">Analysis</span>
        </div>
        <ScrollArea className="flex-1 p-4">
          {result ? (
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
              <Code2 className="mb-4 h-10 w-10 opacity-40" />
              <p className="text-sm">Paste code and click Analyze to get started</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default CodeAnalyzer;
