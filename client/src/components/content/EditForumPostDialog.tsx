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
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import api from '../../utils/api';

interface ForumPost {
  id: number;
  title: string;
  content: string;
  category: string | null;
  isUrgent: boolean;
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

interface EditForumPostDialogProps {
  post: ForumPost;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function EditForumPostDialog({ post, open, onClose, onSave }: EditForumPostDialogProps) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [category, setCategory] = useState(post.category || '');
  const [isUrgent, setIsUrgent] = useState(post.isUrgent);
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
        (c: Course) => c.courseCode === post.course.courseCode
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
    if (!title.trim() || !content.trim() || !courseId) {
      alert('נא למלא את כל השדות הנדרשים');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('category', category.trim() || '');
      formData.append('isUrgent', isUrgent.toString());
      formData.append('courseId', courseId);

      await api.put(`/forum/${post.id}`, formData);
      onSave();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('שגיאה בעדכון הפוסט');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent dir="rtl" className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ערוך שאלה</DialogTitle>
          <DialogDescription>
            ערוך את פרטי השאלה שלך בפורום כאן. לחץ על שמור כשתסיים.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">כותרת *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="כותרת השאלה"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">תוכן *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="פרט את שאלתך..."
              rows={6}
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
                    {course.courseCode} - {course.courseName} ({course.institution})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">קטגוריה</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="למשל: בעיה טכנית, שאלת הבנה, בקשת עזרה"
            />
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id="urgent"
              checked={isUrgent}
              onCheckedChange={(checked) => setIsUrgent(checked as boolean)}
            />
            <Label htmlFor="urgent" className="cursor-pointer">
              סמן כדחוף
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            ביטול
          </Button>
          <Button onClick={handleSave} disabled={saving || !title.trim() || !content.trim() || !courseId}>
            {saving ? 'שומר...' : 'שמור שינויים'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
