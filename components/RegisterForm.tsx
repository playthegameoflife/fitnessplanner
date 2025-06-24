import React, { useState } from 'react';
import * as authService from '../services/authService'; // Assuming authService.ts is in services/

const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      setIsLoading(false);
      return;
    }
    // Basic email validation (can be more robust)
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address.');
        setIsLoading(false);
        return;
    }
    // Basic password length (can be more robust)
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setIsLoading(false);
        return;
    }


    try {
      const response = await authService.register({ email, password_plaintext: password });
      setSuccessMessage(response.message || 'Registration successful! Please login.');
      setEmail(''); // Clear form
      setPassword('');
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Registration failed. Please try again.');
      }
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Basic styling using Tailwind classes - can be improved
  const inputClasses = "w-full p-3 mb-4 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-slate-100 placeholder-slate-400";
  const buttonClasses = "w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md transition-colors disabled:bg-slate-500";


  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-slate-800 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold text-emerald-400 mb-6 text-center">Register</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="p-3 mb-4 bg-red-500 text-white rounded-md text-sm">{error}</div>}
        {successMessage && <div className="p-3 mb-4 bg-green-500 text-white rounded-md text-sm">{successMessage}</div>}

        <div>
          <label htmlFor="emailReg" className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
          <input
            type="email"
            id="emailReg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
            placeholder="you@example.com"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="passwordReg" className="block text-sm font-medium text-slate-300 mb-1">Password</label>
          <input
            type="password"
            id="passwordReg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses}
            placeholder="••••••••"
            required
            disabled={isLoading}
          />
        </div>
        <button type="submit" className={buttonClasses} disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
