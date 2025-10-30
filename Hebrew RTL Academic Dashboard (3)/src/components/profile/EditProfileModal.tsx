import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Upload as UploadIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    avatar: string;
    bio: string;
    location: string;
    institution: string;
    fieldOfStudy: string;
    website: string;
    interests: string[];
  };
  onSave: (data: any) => void;
}

export function EditProfileModal({ isOpen, onClose, user, onSave }: EditProfileModalProps) {
  const [formData, setFormData] = useState(user);
  const [newInterest, setNewInterest] = useState('');

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()],
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((i) => i !== interest),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl z-50"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <h2 className="text-gray-900">ערוך פרופיל</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <Avatar className="w-32 h-32 border-4 border-gray-200">
                    <AvatarImage src={formData.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-4xl">
                      {formData.name.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </button>
                </div>
                <Button variant="outline" size="sm">
                  <UploadIcon className="w-4 h-4 ml-2" />
                  העלה תמונה חדשה
                </Button>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">שם מלא</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-right"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">אודות</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  maxLength={500}
                  className="text-right resize-none"
                />
                <p className="text-sm text-gray-500 text-left">
                  {formData.bio.length}/500
                </p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">מיקום</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="ירושלים, ישראל"
                  className="text-right"
                />
              </div>

              {/* Institution */}
              <div className="space-y-2">
                <Label htmlFor="institution">מוסד לימודים</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="האוניברסיטה העברית"
                  className="text-right"
                />
              </div>

              {/* Field of Study */}
              <div className="space-y-2">
                <Label htmlFor="fieldOfStudy">תחום לימוד</Label>
                <Input
                  id="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                  placeholder="מדעי המחשב"
                  className="text-right"
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website">אתר אינטרנט</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  className="text-right"
                />
              </div>

              {/* Interests/Skills */}
              <div className="space-y-2">
                <Label>תחומי עניין</Label>
                <div className="flex gap-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                    placeholder="הוסף תחום עניין..."
                    className="text-right flex-1"
                  />
                  <Button onClick={addInterest} type="button">
                    הוסף
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.interests.map((interest) => (
                    <Badge
                      key={interest}
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer"
                      onClick={() => removeInterest(interest)}
                    >
                      {interest} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3 justify-end">
              <Button variant="outline" onClick={onClose}>
                ביטול
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                שמור שינויים
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
