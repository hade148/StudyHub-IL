import { useState } from 'react';
import { Bold, Italic, Code, Link as LinkIcon, Image as ImageIcon, List, ListOrdered, Quote } from 'lucide-react';
import { motion } from 'motion/react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "תאר את הבעיה, מה ניסית, ומה השגיאות שקיבלת...",
  maxLength = 5000
}: RichTextEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const toolbarButtons = [
    { icon: Bold, label: 'Bold', action: () => insertMarkdown('**', '**') },
    { icon: Italic, label: 'Italic', action: () => insertMarkdown('*', '*') },
    { icon: Code, label: 'Code', action: () => insertMarkdown('`', '`') },
    { icon: Quote, label: 'Quote', action: () => insertMarkdown('\n> ', '') },
    { icon: LinkIcon, label: 'Link', action: () => insertMarkdown('[', '](url)') },
    { icon: List, label: 'Unordered List', action: () => insertMarkdown('\n- ', '') },
    { icon: ListOrdered, label: 'Ordered List', action: () => insertMarkdown('\n1. ', '') },
  ];

  // Simple markdown to HTML converter
  const renderPreview = (text: string) => {
    let html = text;
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code>$2</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>');
    
    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-500 hover:underline">$1</a>');
    
    // Quotes
    html = html.replace(/^> (.+)$/gm, '<blockquote class="border-r-4 border-blue-500 pr-4 py-2 my-2 text-gray-700">$1</blockquote>');
    
    // Lists
    html = html.replace(/^- (.+)$/gm, '<li class="mr-6">$1</li>');
    html = html.replace(/(<li.*<\/li>)/s, '<ul class="list-disc my-2">$1</ul>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br />');
    
    return html;
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 border border-gray-300 rounded-t-lg" dir="ltr">
        {toolbarButtons.map((button, index) => (
          <button
            key={index}
            type="button"
            onClick={button.action}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title={button.label}
          >
            <button.icon className="w-4 h-4" />
          </button>
        ))}
        
        <div className="flex-1" />
        
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            showPreview ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-200'
          }`}
        >
           {showPreview ? 'עריכה' : 'תצוגה מקדימה'}
        </button>
      </div>

      {/* Editor / Preview */}
      <div className="border border-gray-300 border-t-0 rounded-b-lg bg-white">
        {showPreview ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 min-h-[300px] prose max-w-none"
            dir="rtl"
            dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
          />
        ) : (
          <textarea
            id="editor-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            className="w-full p-4 min-h-[300px] resize-y outline-none rounded-b-lg"
            dir="rtl"
          />
        )}
      </div>

      {/* Character Counter */}
      <div className="flex items-center justify-between text-sm">
        <span className={value.length > maxLength * 0.9 ? 'text-orange-500' : 'text-gray-500'}>
          {value.length}/{maxLength} תווים
        </span>
        {value.length < 50 && (
          <span className="text-orange-500">נדרשים לפחות 50 תווים</span>
        )}
      </div>
    </div>
  );
}
