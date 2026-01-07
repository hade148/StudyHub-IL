import { useState } from 'react';
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
import api from '../../utils/api';

interface Tool {
  id: number;
  title: string;
  url: string;
  description: string | null;
  category: string | null;
}

interface EditToolDialogProps {
  tool: Tool;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function EditToolDialog({ tool, open, onClose, onSave }: EditToolDialogProps) {
  const [title, setTitle] = useState(tool.title);
  const [url, setUrl] = useState(tool.url);
  const [description, setDescription] = useState(tool.description || '');
  const [category, setCategory] = useState(tool.category || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !url.trim()) {
      alert('נא למלא את כל השדות הנדרשים');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      alert('נא להזין כתובת URL תקינה');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/tools/${tool.id}`, {
        title: title.trim(),
        url: url.trim(),
        description: description.trim() || null,
        category: category.trim() || null
      });
      onSave();
    } catch (error) {
      console.error('Error updating tool:', error);
      alert('שגיאה בעדכון הכלי');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent dir="rtl" className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>ערוך כלי</DialogTitle>
          <DialogDescription>
            ערוך את פרטי הכלי שלך כאן. לחץ על שמור כשתסיים.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">שם הכלי *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="שם הכלי"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="url">קישור *</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              dir="ltr"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">קטגוריה</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="למשל: ספריות, כלי פיתוח, משאבי למידה"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">תיאור</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תיאור קצר של הכלי (אופציונלי)"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            ביטול
          </Button>
          <Button onClick={handleSave} disabled={saving || !title.trim() || !url.trim()}>
            {saving ? 'שומר...' : 'שמור שינויים'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
