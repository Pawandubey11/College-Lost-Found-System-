import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User as UserIcon, Mail, Lock, Phone, BookOpen, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'staff'>('student');
  const [department, setDepartment] = useState('Computer Science');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.register({
        full_name: fullName,
        email,
        password,
        role,
        department,
        phone_number: phoneNumber
      });

      login(res.token, res.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#1E3A2B] text-[#D97706] flex items-center justify-center font-bold mx-auto shadow-md">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Create Campus Account</h1>
        <p className="text-xs text-gray-500">Register to file lost/found reports and track verification claims</p>
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
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full text-xs pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
            Institutional Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul.student@college.edu"
              className="w-full text-xs pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full text-xs pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
              Institutional Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none"
            >
              <option value="student">Student</option>
              <option value="staff">Faculty / Staff</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
              Department
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Computer Science"
              className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
            Phone Number (Optional)
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full text-xs pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#1E3A2B] hover:bg-[#15291E] text-white py-3.5 px-4 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
        >
          <ShieldCheck className="w-4 h-4 text-[#D97706]" />
          <span>{submitting ? 'Creating Account...' : 'Register Account'}</span>
        </button>

        <div className="text-center pt-2 text-xs text-gray-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-[#1E3A2B] hover:underline">
            Sign In Here
          </Link>
        </div>

      </form>

    </div>
  );
};
