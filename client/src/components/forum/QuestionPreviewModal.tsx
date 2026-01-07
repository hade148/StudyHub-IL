import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CodeSnippet {
  id: string;
  code: string;
}

interface QuestionPreview {
  title: string;
  description: string;
  tags: string[];
  codeSnippets: CodeSnippet[];
  images: string[];
}

interface QuestionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
  preview: QuestionPreview;
}

export function QuestionPreviewModal({ 
  isOpen, 
  onClose, 
  onPublish, 
  preview 
}: QuestionPreviewModalProps) {
  if (!isOpen) return null;

  const renderMarkdown = (text: string) => {
    let html = text;
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>');
    html = html.replace(/\n/g, '<br />');
    return html;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div>
              <h2 className="text-2xl"> תצוגה מקדימה</h2>
              <p className="text-sm text-gray-600 mt-1">כך השאלה תיראה בפורום</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {preview.isUrgent && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                  🔥 דחוף
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl mb-4">{preview.title}</h1>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {preview.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            <div
              className="prose max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(preview.description) }}
            />

            {/* Code Snippets */}
            {preview.codeSnippets.map((snippet, index) => (
              <div key={snippet.id} className="mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-t-lg">
                  <span className="text-sm text-gray-600">קטע קוד {index + 1}</span>
                </div>
                <pre className="p-4 bg-gray-50 border border-gray-300 border-t-0 rounded-b-lg overflow-x-auto">
                  <code className="text-sm font-mono" dir="ltr">
                    {snippet.code}
                  </code>
                </pre>
              </div>
            ))}

            {/* Images */}
            {preview.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {preview.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`תמונה ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                  />
                ))}
              </div>
            )}

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-gray-600 pt-4 border-t border-gray-200">
              <span>נשאל עכשיו</span>
              <span>•</span>
              <span>0 תשובות</span>
              <span>•</span>
              <span>0 צפיות</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              חזור לעריכה
            </button>
            <button
              onClick={onPublish}
              className="px-8 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
            >
              ✓ פרסם עכשיו
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
