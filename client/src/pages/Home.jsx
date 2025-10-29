import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-3xl">
        <h1 className="text-5xl font-bold mb-6">ברוכים הבאים ל-StudyHub-IL 🎓</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          פלטפורמה קהילתית לסטודנטים - שיתוף סיכומים, פורום שאלות ותשובות, וכלים לימודיים
        </p>
        <div className="flex justify-center space-x-4 space-x-reverse">
          {isAuthenticated ? (
            <Link to="/dashboard" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              לוח הבקרה שלי
            </Link>
          ) : (
            <>
              <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                הצטרף עכשיו
              </Link>
              <Link to="/summaries" className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition">
                עיין בסיכומים
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12">מה מציעה הפלטפורמה?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center hover:shadow-xl transition">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-3">שיתוף סיכומים</h3>
            <p className="text-gray-600">
              העלה והורד סיכומים איכוtiים לפי קורסים. דרג וכתוב תגובות כדי לעזור לאחרים.
            </p>
            <Link to="/summaries" className="inline-block mt-4 text-primary-600 font-semibold hover:underline">
              עיין בסיכומים →
            </Link>
          </div>

          <div className="card text-center hover:shadow-xl transition">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-3">פורום Q&A</h3>
            <p className="text-gray-600">
              שאל שאלות, קבל תשובות, ועזור לאחרים. קהילה תומכת של סטודנטים.
            </p>
            <Link to="/forum" className="inline-block mt-4 text-primary-600 font-semibold hover:underline">
              גש לפורום →
            </Link>
          </div>

          <div className="card text-center hover:shadow-xl transition">
            <div className="text-5xl mb-4">🛠️</div>
            <h3 className="text-xl font-bold mb-3">כלים לימודיים</h3>
            <p className="text-gray-600">
              מאגר כלים שימושיים ללימודים - IDE, משאבים מקוונים, ועוד.
            </p>
            <Link to="/tools" className="inline-block mt-4 text-primary-600 font-semibold hover:underline">
              גלה כלים →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-100 rounded-3xl p-12">
        <h2 className="text-3xl font-bold text-center mb-12">הפלטפורמה במספרים</h2>
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
            <div className="text-gray-600">סיכומים</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary-600 mb-2">1,200+</div>
            <div className="text-gray-600">סטודנטים</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary-600 mb-2">300+</div>
            <div className="text-gray-600">שאלות בפורום</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
            <div className="text-gray-600">קורסים</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="text-center py-16">
          <h2 className="text-3xl font-bold mb-6">מוכן להצטרף?</h2>
          <p className="text-xl text-gray-600 mb-8">הרשם עכשיו והתחל ללמוד עם הקהילה!</p>
          <Link to="/register" className="btn btn-primary text-lg px-10 py-4">
            הרשמה חינם →
          </Link>
        </section>
      )}
    </div>
  );
}