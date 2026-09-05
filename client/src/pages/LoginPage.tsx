import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.login({ email, password });
      login(res.token, res.user);
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#1E3A2B] text-[#D97706] flex items-center justify-center font-bold mx-auto shadow-md">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Sign In to Campus Portal</h1>
        <p className="text-xs text-gray-500">Enter your institutional credentials to manage lost & found reports</p>
      </div>

      {/* Demo Credentials Helper Pill */}
      <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-900 space-y-2">
        <span className="font-bold block uppercase text-[10px] text-amber-800">Quick Academic Viva Test Credentials:</span>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => fillDemoAccount('alex.student@college.edu', 'Student@123')}
            className="bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg font-mono font-semibold"
          >
            Student Account (Alex)
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('admin@college.edu', 'Admin@123')}
            className="bg-[#1E3A2B] text-white hover:bg-[#15291E] px-2.5 py-1 rounded-lg font-mono font-bold"
          >
            Admin Account
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-xs p-4 rounded-2xl border border-red-200 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
            Campus Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex.student@college.edu"
              className="w-full text-xs pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#1E3A2B] hover:bg-[#15291E] text-white py-3.5 px-4 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
        >
          <LogIn className="w-4 h-4 text-[#D97706]" />
          <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
        </button>

        <div className="text-center pt-2 text-xs text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-[#1E3A2B] hover:underline">
            Register Account
          </Link>
        </div>

      </form>

    </div>
  );
};
