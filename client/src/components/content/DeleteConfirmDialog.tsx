import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

interface DeleteConfirmDialogProps {
  open: boolean;
  title: string;
  type: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({ open, title, type, onClose, onConfirm }: DeleteConfirmDialogProps) {
  const typeText = 
    type === 'summary' ? 'סיכום' :
    type === 'tool' ? 'כלי' :
    'פוסט';

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
          <AlertDialogDescription>
            פעולה זו תמחק את ה{typeText} "{title}" לצמיתות.
            לא ניתן לשחזר {typeText} זה לאחר המחיקה.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel onClick={onClose}>ביטול</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            מחק
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
