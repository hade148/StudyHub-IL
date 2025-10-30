import { useState, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export function ImageUpload({ 
  images, 
  onChange, 
  maxImages = 5,
  maxSizeMB = 5
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndAddFiles = (files: FileList | null) => {
    if (!files) return;

    setError(null);

    if (images.length + files.length > maxImages) {
      setError(`ניתן להעלות עד ${maxImages} תמונות`);
      return;
    }

    const newImages: string[] = [];
    let hasError = false;

    Array.from(files).forEach((file) => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('ניתן להעלות קבצי תמונה בלבד');
        hasError = true;
        return;
      }

      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`גודל תמונה מקסימלי: ${maxSizeMB}MB`);
        hasError = true;
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newImages.push(e.target.result as string);
          if (newImages.length === files.length && !hasError) {
            onChange([...images, ...newImages]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    validateAndAddFiles(e.dataTransfer.files);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    validateAndAddFiles(e.target.files);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }`}
        >
          <input
            type="file"
            id="image-upload"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
          
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-500" />
            </div>
            <div className="space-y-1">
              <div className="text-gray-700">📷 גרור תמונה או לחץ לבחירה</div>
              <div className="text-sm text-gray-500">
                עד {maxImages} תמונות, מקסימום {maxSizeMB}MB לכל תמונה
              </div>
            </div>
          </label>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <AnimatePresence>
            {images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-square"
              >
                <img
                  src={image}
                  alt={`תמונה ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-gray-300"
                />
                
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 left-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Image Number */}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Image Count */}
      {images.length > 0 && (
        <div className="text-sm text-gray-600">
          {images.length}/{maxImages} תמונות
        </div>
      )}
    </div>
  );
}
