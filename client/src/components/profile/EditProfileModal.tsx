import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Upload as UploadIcon, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import api from '../../utils/api';

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
  onSave: (data: any) => Promise<void>;
  onAvatarUpload: (file: File) => Promise<void>;
  isSaving?: boolean;
  error?: string | null;
}

export function EditProfileModal({ isOpen, onClose, user, onSave, onAvatarUpload, isSaving = false, error = null }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    avatar: user.avatar || '',
    bio: user.bio || '',
    location: user.location || '',
    institution: user.institution || '',
    fieldOfStudy: user.fieldOfStudy || '',
    website: user.website || '',
    interests: user.interests || [],
  });
  const [newInterest, setNewInterest] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatar || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [institutions, setInstitutions] = useState<string[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  // Fetch institutions from API
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await api.get('/courses/institutions');
        setInstitutions([...response.data, 'אחר']);
      } catch (error) {
        console.error('Error fetching institutions:', error);
        // Fallback to default list if API fails
        setInstitutions([
          'האוניברסיטה העברית בירושלים',
          'אוניברסיטת תל אביב',
          'הטכניון – מכון טכנולוגי לישראל',
          'אחר',
        ]);
      } finally {
        setLoadingInstitutions(false);
      }
    };
    fetchInstitutions();
  }, []);

  // Reinitialize form when user data changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user.name || '',
        avatar: user.avatar || '',
        bio: user.bio || '',
        location: user.location || '',
        institution: user.institution || '',
        fieldOfStudy: user.fieldOfStudy || '',
        website: user.website || '',
        interests: user.interests || [],
      });
      setAvatarPreview(user.avatar || '');
    }
  }, [isOpen, user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('נא לבחור קובץ תמונה בלבד');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('גודל התמונה חייב להיות עד 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload avatar
    try {
      setIsUploadingAvatar(true);
      await onAvatarUpload(file);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert('שגיאה בהעלאת התמונה');
      setAvatarPreview(user.avatar || '');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    await onSave(formData);
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

  const handleInterestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInterest();
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

          {/* Modal Container - centers the modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              dir="rtl"
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl pointer-events-auto"
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
                    <AvatarImage src={avatarPreview} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-4xl">
                      {formData.name.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                  {!isUploadingAvatar && (
                    <button 
                      type="button"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera className="w-8 h-8 text-white" />
                    </button>
                  )}
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  type="button"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      מעלה...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="w-4 h-4 ml-2" />
                      העלה תמונה חדשה
                    </>
                  )}
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
                <select
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-60"
                  disabled={loadingInstitutions}
                >
                  <option value="">
                    {loadingInstitutions ? 'טוען מוסדות...' : 'בחר מוסד לימודים'}
                  </option>
                  {institutions.map((inst) => (
                    <option key={inst} value={inst}>
                      {inst}
                    </option>
                  ))}
                </select>
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
                    onKeyDown={handleInterestKeyDown}
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
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex flex-col gap-3">
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={onClose} disabled={isSaving} type="button">
                  ביטול
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      שומר...
                    </>
                  ) : (
                    'שמור שינויים'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
