import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import api from '../../utils/api';
import { coursesList } from '../../constants/coursesList';

interface Summary {
  id: number;
  title: string;
  description: string | null;
  course: {
    courseCode: string;
    courseName: string;
  };
}

interface EditSummaryDialogProps {
  summary: Summary;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function EditSummaryDialog({ summary, open, onClose, onSave }: EditSummaryDialogProps) {
  const [title, setTitle] = useState(summary.title);
  const [description, setDescription] = useState(summary.description || '');
  const [courseId, setCourseId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Find the course index in coursesList based on the course name
    const courseIndex = coursesList.findIndex(
      (courseName) => courseName === summary.course.courseName
    );
    if (courseIndex !== -1) {
      setCourseId((courseIndex + 1).toString());
    }
  }, [summary]);

  const handleSave = async () => {
    if (!title.trim() || !courseId) {
      alert('נא למלא את כל השדות הנדרשים');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/summaries/${summary.id}`, {
        title: title.trim(),
        description: description.trim() || null,
        courseId: parseInt(courseId)
      });
      onSave();
    } catch (error) {
      console.error('Error updating summary:', error);
      alert('שגיאה בעדכון הסיכום');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent dir="rtl" className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>ערוך סיכום</DialogTitle>
          <DialogDescription>
            ערוך את פרטי הסיכום שלך כאן. לחץ על שמור כשתסיים.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">כותרת *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="כותרת הסיכום"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">תיאור</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תיאור קצר של הסיכום (אופציונלי)"
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="course">קורס *</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger id="course">
                <SelectValue placeholder="בחר קורס" />
              </SelectTrigger>
              <SelectContent>
                {coursesList.map((courseName, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {courseName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            ביטול
          </Button>
          <Button onClick={handleSave} disabled={saving || !title.trim() || !courseId}>
            {saving ? 'שומר...' : 'שמור שינויים'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
