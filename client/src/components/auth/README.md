# StudyHub-IL Authentication System 🔐

A complete, production-ready authentication system for the StudyHub-IL academic platform with modern Hebrew RTL design.

## 📦 Components

### 1. LoginPage 🔑
**Path:** `/components/auth/LoginPage.tsx`

**Features:**
- Email and password inputs with validation
- Password show/hide toggle
- Remember me checkbox
- Forgot password link
- Social login buttons (Google, Facebook)
- Split-screen layout with gradient illustration
- Responsive design (mobile: single column)

**Form Validation:**
- Email: Required, valid format
- Password: Required, min 6 characters

**Error States:**
- Invalid credentials
- Network errors
- Server errors

---

### 2. RegisterPage 📝
**Path:** `/components/auth/RegisterPage.tsx`

**Features:**
- Full name, email, password, confirm password
- Real-time password strength indicator
- Password requirements checklist (8 chars, uppercase, lowercase, number, special char)
- Live password match validation
- User type selection (Student/Teacher/Learning Enthusiast)
- Optional institution and field of study
- Terms & privacy checkbox
- Success modal with email verification notice

**Form Validation:**
- Full Name: Required, min 2 words, Hebrew/English only
- Email: Required, valid format
- Password: Required, min 8 chars, complexity requirements
- Confirm Password: Must match password
- User Type: Required
- Terms: Required

**Password Strength:**
- Weak (Red): 0-2 criteria met
- Medium (Yellow): 3-4 criteria met
- Strong (Green): All 5 criteria met

---

### 3. ForgotPasswordPage 🔑
**Path:** `/components/auth/ForgotPasswordPage.tsx`

**Features:**
- Single email input
- Centered card design
- Success state with timer display
- Resend functionality with 60-second cooldown
- Back to login link

**States:**
1. **Input State:** Email form
2. **Success State:** Confirmation message, timer (15 min expiry), resend option

**Form Validation:**
- Email: Required, valid format

---

### 4. ResetPasswordPage 🔄
**Path:** `/components/auth/ResetPasswordPage.tsx`

**Features:**
- New password input with strength meter
- Confirm password with match indicator
- Password requirements checklist
- Token validation from URL params
- Success state with auto-redirect (5 seconds)
- Token expiration handling

**States:**
1. **Form State:** Password inputs
2. **Success State:** Confirmation + countdown
3. **Expired State:** Token expired message

**Form Validation:**
- Password: Same as registration
- Confirm Password: Must match

---

### 5. VerifyEmailPage ✉️
**Path:** `/components/auth/VerifyEmailPage.tsx`

**Features:**
- Automatic verification on load
- Multiple verification states
- Resend verification option
- Auto-redirect on success (5 seconds)

**States:**
1. **Verifying:** Loading spinner animation
2. **Success:** Checkmark animation + redirect
3. **Expired:** Token expired + resend option
4. **Already Verified:** Info message
5. **Invalid/Error:** Error message + resend option

---

## 🎨 Design System

### Colors
```css
Primary Blue: #3B82F6
Primary Purple: #8B5CF6
Success Green: #10B981
Error Red: #EF4444
Warning Yellow: #F59E0B
Text Dark: #1F2937
Text Light: #6B7280
Background: #F9FAFB
```

### Gradients
```css
Primary: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)
Success: linear-gradient(135deg, #10B981 0%, #059669 100%)
Background: linear-gradient(135deg, #EFF6FF 0%, #F3E8FF 50%, #FCE7F3 100%)
```

### Animations
- **Page Load:** Fade-in (0.5s)
- **Form Elements:** Slide-up (0.3s)
- **Buttons:** Scale on hover (1.02)
- **Inputs:** Border glow on focus
- **Errors:** Shake animation
- **Success:** Checkmark + scale animation

---

## 🔒 Security Features

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*)

### Token Management
- Reset password tokens expire in 15 minutes
- Email verification tokens
- Resend cooldown: 60 seconds

### Validation
- Real-time client-side validation
- Server-side validation simulation
- Input sanitization
- CSRF protection ready

---

## 📱 Responsive Design

### Breakpoints
- **Mobile:** < 768px (Single column, full width)
- **Tablet:** 768px - 1024px (Adjusted proportions)
- **Desktop:** > 1024px (Split screen 50/50)

### Mobile Optimizations
- Hide right-side illustration
- Full-width forms
- Stack social buttons
- Touch-friendly buttons (44px min)

---

## 🚀 Usage

### Basic Implementation

```tsx
import { LoginPage } from './components/auth/LoginPage';

function App() {
  const handleLoginSuccess = () => {
    // Navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <LoginPage
      onNavigateDashboard={handleLoginSuccess}
      onNavigateRegister={() => navigate('/register')}
      onNavigateForgotPassword={() => navigate('/forgot-password')}
    />
  );
}
```

### API Integration Example

```tsx
const handleLogin = async (data) => {
  try {
    const response = await api.post('/auth/login', {
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe
    });
    
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    navigate('/dashboard');
  } catch (err) {
    if (err.response?.status === 401) {
      setError('אימייל או סיסמה שגויים');
    } else if (err.response?.status === 423) {
      setError('החשבון שלך נחסם');
    } else {
      setError('שגיאה בהתחברות, נסה שוב');
    }
  }
};
```

---

## 🧪 Testing Navigation

The `AuthDevNav` component at the bottom of each auth page allows quick navigation between all authentication states during development.

**To remove in production:**
```tsx
// In App.tsx, remove:
<AuthDevNav currentPage={currentPage} onNavigate={navigateToPage} />
```

---

## ✅ Accessibility

- ARIA labels on all inputs
- Keyboard navigation support
- Focus states clearly visible
- Screen reader announcements
- Error messages linked to inputs
- Color contrast WCAG AA compliant

---

## 📋 Dependencies

```json
{
  "react-hook-form": "^7.55.0",
  "motion/react": "^11.x",
  "lucide-react": "latest",
  "tailwindcss": "^4.x"
}
```

---

## 🎯 Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Biometric authentication
- [ ] OAuth providers (GitHub, LinkedIn)
- [ ] Account recovery via SMS
- [ ] Magic link authentication
- [ ] Session management
- [ ] Activity logs
- [ ] IP whitelisting

---

## 📄 License

© 2025 StudyHub-IL. All rights reserved.
