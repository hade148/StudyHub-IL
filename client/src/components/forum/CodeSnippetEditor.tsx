import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface CodeSnippet {
  id: string;
  code: string;
}

interface CodeSnippetEditorProps {
  snippets: CodeSnippet[];
  onChange: (snippets: CodeSnippet[]) => void;
}

export function CodeSnippetEditor({ snippets, onChange }: CodeSnippetEditorProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const addSnippet = () => {
    const newSnippet: CodeSnippet = {
      id: Date.now().toString(),
      code: '',
    };
    onChange([...snippets, newSnippet]);
  };

  const updateSnippet = (id: string, field: 'code', value: string) => {
    onChange(
      snippets.map((snippet) =>
        snippet.id === id ? { ...snippet, [field]: value } : snippet
      )
    );
  };

  const removeSnippet = (id: string) => {
    onChange(snippets.filter((snippet) => snippet.id !== id));
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      {snippets.map((snippet, index) => (
        <motion.div
          key={snippet.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="border border-gray-300 rounded-lg overflow-hidden bg-white"
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 border-b border-gray-300">
            <span className="text-sm text-gray-600">קטע קוד {index + 1}</span>

            <div className="flex-1" />

            <button
              type="button"
              onClick={() => copyCode(snippet.code, snippet.id)}
              className="p-1.5 hover:bg-gray-200 rounded transition-colors"
              title="העתק קוד"
            >
              {copied === snippet.id ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-600" />
              )}
            </button>

            <button
              type="button"
              onClick={() => removeSnippet(snippet.id)}
              className="p-1.5 hover:bg-red-100 rounded transition-colors"
              title="מחק קטע"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>

          {/* Code Editor */}
          <div className="relative">
            {/* Line Numbers */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gray-100 border-l border-gray-300 p-3 text-xs text-gray-500 select-none" dir="ltr">
              {snippet.code.split('\n').map((_, i) => (
                <div key={i} className="text-left">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code Textarea */}
            <textarea
              value={snippet.code}
              onChange={(e) => updateSnippet(snippet.id, 'code', e.target.value)}
              placeholder="הכנס את הקוד שלך כאן..."
              className="w-full pr-16 pl-4 py-3 min-h-[200px] font-mono text-sm resize-y outline-none bg-gray-50"
              dir="ltr"
              spellCheck={false}
            />
          </div>
        </motion.div>
      ))}

      {/* Add Snippet Button */}
      <button
        type="button"
        onClick={addSnippet}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
      >
        + הוסף קטע קוד
      </button>
    </div>
  );
}
