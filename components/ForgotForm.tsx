
import React, { useState } from 'react';
import { AuthView } from '../types';

interface ForgotFormProps {
  onSwitchView: (view: AuthView) => void;
}

const ForgotForm: React.FC<ForgotFormProps> = ({ onSwitchView }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="p-10 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">ইমেল পাঠানো হয়েছে</h2>
        <p className="text-slate-500 mb-8">
          পাসওয়ার্ড পুনরুদ্ধারের জন্য একটি লিঙ্ক আমরা {email} ঠিকানায় পাঠিয়েছি।
        </p>
        <button
          onClick={() => onSwitchView('login')}
          className="text-indigo-600 font-semibold hover:underline"
        >
          লগইন পেজে ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-10">
      <button
        onClick={() => onSwitchView('login')}
        className="mb-6 flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        ফিরে যান
      </button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">পাসওয়ার্ড ভুলে গেছেন?</h1>
        <p className="text-slate-500">আপনার ইমেলটি নিচে দিন, আমরা আপনাকে একটি লিঙ্ক পাঠাবো</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">ইমেল অ্যাড্রেস</label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg active:scale-95"
        >
          লিঙ্ক পাঠান
        </button>
      </form>
    </div>
  );
};

export default ForgotForm;
