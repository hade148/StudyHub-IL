import { useAuth } from '../../context/AuthContext';

// ... other imports

const LoginPage = () => {
  // ... other hooks
  const { login } = useAuth();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      // Use real login function from AuthContext
      await login(data.email, data.password);
      
      // Navigate to dashboard only after successful login
      onNavigateDashboard();
    } catch (err: any) {
      setError(err.response?.data?.message || 'אימייל או סיסמה שגויים');
    } finally {
      setIsLoading(false);
    }
  };

  // ... component return
};