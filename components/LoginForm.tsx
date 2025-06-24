import React, { useState, useContext }
import * as authService from '../services/authService';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login: contextLogin, user } = useAuth(); // Get login from context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      setIsLoading(false);
      return;
    }
     if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address.');
        setIsLoading(false);
        return;
    }

    try {
      // authService.login still handles the API call and storing token in localStorage
      const response = await authService.login({ email, password_plaintext: password });

      // Now, update the AuthContext state
      // The AuthContext's login function will fetch user profile if not provided
      await contextLogin(response.token, response.user);

      console.log('Login successful, context updated:', response.user.email);
      // App.tsx will handle view change based on isAuthenticated & user from context.
      // No explicit redirect needed here if App.tsx handles it.
      // For now, an alert can signify completion of this component's role.
      alert(`Login successful for ${response.user.email}! Main app should now react.`);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Login failed. Please check your credentials or try again.');
      }
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Basic styling using Tailwind classes - can be improved
  const inputClasses = "w-full p-3 mb-4 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-slate-100 placeholder-slate-400";
  const buttonClasses = "w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md transition-colors disabled:bg-slate-500";

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-slate-800 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold text-emerald-400 mb-6 text-center">Login</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="p-3 mb-4 bg-red-500 text-white rounded-md text-sm">{error}</div>}

        <div>
          <label htmlFor="emailLogin" className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
          <input
            type="email"
            id="emailLogin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
            placeholder="you@example.com"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="passwordLogin" className="block text-sm font-medium text-slate-300 mb-1">Password</label>
          <input
            type="password"
            id="passwordLogin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses}
            placeholder="••••••••"
            required
            disabled={isLoading}
          />
        </div>
        <button type="submit" className={buttonClasses} disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
