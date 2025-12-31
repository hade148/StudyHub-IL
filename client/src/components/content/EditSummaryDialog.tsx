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

interface Summary {
  id: number;
  title: string;
  description: string | null;
  course: {
    courseCode: string;
    courseName: string;
  };
  courseId?: number;
}

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  institution: string;
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
      
      // Find and set the current course ID
      const currentCourse = response.data.find(
        (c: Course) => c.courseCode === summary.course.courseCode
      );
      if (currentCourse) {
        setCourseId(currentCourse.id.toString());
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <Select value={courseId} onValueChange={setCourseId} disabled={loading}>
              <SelectTrigger id="course">
                <SelectValue placeholder={loading ? "טוען קורסים..." : "בחר קורס"} />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.courseCode} - {course.courseName}
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
