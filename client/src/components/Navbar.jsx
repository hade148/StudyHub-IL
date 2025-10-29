import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notifications from './Notifications';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 space-x-reverse">
            <span className="text-2xl font-bold text-primary-600">📚 StudyHub-IL</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 space-x-reverse">
            <Link to="/summaries" className="text-gray-700 hover:text-primary-600 transition">
              סיכומים
            </Link>
            <Link to="/forum" className="text-gray-700 hover:text-primary-600 transition">
              פורום
            </Link>
            <Link to="/tools" className="text-gray-700 hover:text-primary-600 transition">
              כלים
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 transition">
                  לוח בקרה
                </Link>
                <Link to="/favorites" className="text-gray-700 hover:text-primary-600 transition">
                  ⭐ מועדפים
                </Link>
                <Link to="/messages" className="text-gray-700 hover:text-primary-600 transition">
                  💬 הודעות
                </Link>
                
                {/* Notifications */}
                <Notifications />

                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className="text-red-600 hover:text-red-700 transition font-semibold">
                    ניהול
                  </Link>
                )}
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Link to="/profile" className="flex items-center space-x-2 space-x-reverse hover:bg-gray-100 rounded-lg px-3 py-2 transition">
                    {user?.profilePicture ? (
                      <img
                        src={`/${user.profilePicture}`}
                        alt={user.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                        {user?.fullName?.charAt(0)}
                      </div>
                    )}
                    <span className="text-gray-700">{user?.fullName}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary"
                  >
                    התנתק
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3 space-x-reverse">
                <Link to="/login" className="btn btn-secondary">
                  התחבר
                </Link>
                <Link to="/register" className="btn btn-primary">
                  הרשם
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3">
            <Link to="/summaries" className="block text-gray-700 hover:text-primary-600">
              סיכומים
            </Link>
            <Link to="/forum" className="block text-gray-700 hover:text-primary-600">
              פורום
            </Link>
            <Link to="/tools" className="block text-gray-700 hover:text-primary-600">
              כלים
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block text-gray-700 hover:text-primary-600">
                  לוח בקרה
                </Link>
                <Link to="/favorites" className="block text-gray-700 hover:text-primary-600">
                  ⭐ מועדפים
                </Link>
                <Link to="/messages" className="block text-gray-700 hover:text-primary-600">
                  💬 הודעות
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className="block text-red-600 hover:text-red-700 font-semibold">
                    ניהול
                  </Link>
                )}
                <button onClick={handleLogout} className="block w-full text-right text-gray-700 hover:text-primary-600">
                  התנתק
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-700 hover:text-primary-600">
                  התחבר
                </Link>
                <Link to="/register" className="block text-gray-700 hover:text-primary-600">
                  הרשם
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}