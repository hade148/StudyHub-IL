import { Button } from '../ui/button';

interface AuthDevNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function AuthDevNav({ currentPage, onNavigate }: AuthDevNavProps) {
  const pages = [
    { id: 'login', label: 'התחברות' },
    { id: 'register', label: 'הרשמה' },
    { id: 'forgot-password', label: 'שכחת סיסמה' },
    { id: 'reset-password', label: 'איפוס סיסמה' },
    { id: 'verify-email', label: 'אימות מייל' },
    { id: 'dashboard', label: 'דשבורד' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <div className="container mx-auto">
        <p className="text-xs text-gray-400 mb-2 text-center">🔧 Dev Navigation - Remove in production</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => onNavigate(page.id)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                currentPage === page.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {page.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
