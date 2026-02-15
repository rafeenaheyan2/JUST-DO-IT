
import React, { useState, useEffect } from 'react';
import { AuthView, User } from '../types';

interface LoginFormProps {
  onSwitchView: (view: AuthView) => void;
  users: User[];
  onLoginSuccess: (user: User) => void;
}

const translations = {
  BN: {
    welcome: "ফিরে আসায় স্বাগতম",
    loginDesc: "আপনার অ্যাকাউন্টে লগইন করুন",
    emailLabel: "ইউজারনেম বা ইমেল",
    passLabel: "পাসওয়ার্ড",
    forgotPass: "ভুলে গেছেন?",
    captchaLabel: "নিরাপত্তা কোড (৫ ডিজিট)",
    loginBtn: "লগইন করুন",
    noAccount: "অ্যাকাউন্ট নেই?",
    register: "নতুন অ্যাকাউন্ট খুলুন",
    help: "সহযোগিতা",
    lang: "English",
    whatsapp: "হোয়াটসঅ্যাপ",
    secureArea: "নিরাপদ লগইন এলাকা",
    dayWish: "আপনার দিনটি শুভ হোক",
    successTitle: "লগইন সফল!",
    successDesc: "পোর্টালে আপনাকে স্বাগতম। কিছুক্ষণ অপেক্ষা করুন।",
    customerSuccessDesc: "আপনি একজন কাস্টমার হিসেবে লগইন করেছেন!",
    enterPortal: "পোর্টালে প্রবেশ করুন",
    placeholderEmail: "1111@mail.com",
    placeholderPass: "পাসওয়ার্ড দিন",
    captchaChange: "নতুন কোড",
    captchaError: "ক্যাপচা ভুল হয়েছে! আবার চেষ্টা করুন।",
    invalidLogin: "ইউজারনেম বা পাসওয়ার্ড সঠিক নয়।"
  },
  EN: {
    welcome: "Welcome Back",
    loginDesc: "Login to your account to continue",
    emailLabel: "Username or Email",
    passLabel: "Password",
    forgotPass: "Forgot?",
    captchaLabel: "Security Code (5 digits)",
    loginBtn: "Login Now",
    noAccount: "Don't have an account?",
    register: "Create Account",
    help: "Help",
    lang: "বাংলা",
    whatsapp: "WhatsApp",
    secureArea: "Secure Login Area",
    dayWish: "Have a wonderful day",
    successTitle: "Login Success!",
    successDesc: "Welcome to Portal. Please wait a moment.",
    customerSuccessDesc: "You have logged in as a customer!",
    enterPortal: "Enter Portal",
    placeholderEmail: "1111@mail.com",
    placeholderPass: "Enter password",
    captchaChange: "New Code",
    captchaError: "Invalid Captcha! Please try again.",
    invalidLogin: "Invalid username or password."
  }
};

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchView, users, onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [currentLang, setCurrentLang] = useState<'BN' | 'EN'>('BN');

  const t = translations[currentLang];
  const profileImageUrl = "https://raw.githubusercontent.com/RafeeNaheyan/assets/main/rafee_logo.jpg";
  const facebookUrl = "https://www.facebook.com/share/1jTQdczEb2/";
  const siteUrl = "http://692e8fbe34310.site123.me";

  const generateCaptcha = () => {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCaptcha(result);
    setCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (captchaInput !== generatedCaptcha) {
      setError(t.captchaError);
      generateCaptcha();
      return;
    }

    const foundUser = users.find(u => 
      (u.email.toLowerCase() === identifier.trim().toLowerCase() || 
       u.username.toLowerCase() === identifier.trim().toLowerCase()) && 
      u.password === password
    );

    if (!foundUser) {
      setError(t.invalidLogin);
      generateCaptcha();
      return;
    }

    setIsLoading(true);
    setAuthenticatedUser(foundUser);
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccessPopup(true);
    }, 800);
  };

  const handleProceedToDashboard = () => {
    if (authenticatedUser) {
      setShowSuccessPopup(false);
      onLoginSuccess(authenticatedUser);
    }
  };

  const UtilityButtons = ({ dark = false }: { dark?: boolean }) => (
    <div className={`flex items-center gap-6 ${dark ? 'justify-start' : 'justify-center'}`}>
      <button onClick={() => onSwitchView('help')} className="flex flex-col items-center gap-1.5 group transition-all">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-sm border ${dark ? 'bg-white/5 text-indigo-200 border-white/5 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-slate-50 text-slate-400 border-slate-50 group-hover:bg-indigo-600 group-hover:text-white'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-widest ${dark ? 'text-indigo-300/60 group-hover:text-white' : 'text-slate-400 group-hover:text-indigo-600'}`}>{t.help}</span>
      </button>

      <button onClick={() => setCurrentLang(prev => prev === 'BN' ? 'EN' : 'BN')} className="flex flex-col items-center gap-1.5 group transition-all">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-sm border ${dark ? 'bg-white/5 text-indigo-200 border-white/5 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-slate-50 text-slate-400 border-slate-50 group-hover:bg-indigo-600 group-hover:text-white'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-widest ${dark ? 'text-indigo-300/60 group-hover:text-white' : 'text-slate-400 group-hover:text-indigo-600'}`}>{t.lang}</span>
      </button>

      <a href="https://wa.me/message/XVJOHMZ3Z6CUB1" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group transition-all">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-sm border ${dark ? 'bg-white/5 text-indigo-200 border-white/5 group-hover:bg-green-600 group-hover:text-white' : 'bg-slate-50 text-slate-400 border-slate-50 group-hover:bg-green-600 group-hover:text-white'}`}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-widest ${dark ? 'text-indigo-300/60 group-hover:text-white' : 'text-slate-400 group-hover:text-green-600'}`}>{t.whatsapp}</span>
      </a>
    </div>
  );

  return (
    <>
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 bg-slate-900 p-10 lg:p-16 flex-col justify-between text-white relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-blue-900/20 z-0"></div>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-indigo-500/20">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-3xl lg:text-5xl font-extrabold mb-6 leading-tight tracking-tight text-white">
            {currentLang === 'BN' ? <>অত্যাধুনিক <br/>ম্যানেজমেন্ট পোর্টালে <br/>আপনাকে স্বাগতম।</> : <>The Smarter <br/>Management <br/>Portal Solution.</>}
          </h2>
          <UtilityButtons dark />
        </div>
        <div className="relative z-10 flex items-center gap-4 p-4 bg-white/5 rounded-2xl backdrop-blur-3xl border border-white/5 shadow-xl transition-all w-fit">
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Visit Rafee Naheyan's Facebook profile" className="w-14 h-14 rounded-full border-2 border-white/20 overflow-hidden shadow-lg animate-slow-zoom block shrink-0">
               <img src={profileImageUrl} alt="Rafee Naheyan" className="w-full h-full object-cover" />
            </a>
            <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="hover:translate-x-1 transition-transform pr-2">
              <p className="text-sm font-black tracking-[0.15em] text-white uppercase">RAFEE NAHEYAN</p>
              <p className="text-[10px] text-indigo-300/80 font-bold uppercase tracking-widest mt-0.5">01590018360</p>
            </a>
        </div>
      </div>

      <div className="flex-1 p-8 sm:p-10 md:p-10 lg:p-16 flex flex-col justify-center relative bg-white overflow-y-auto">
        <div className="absolute top-6 right-6 md:hidden z-20">
          <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Visit Rafee Naheyan's Facebook profile" className="block w-10 h-10 rounded-full border border-slate-200 overflow-hidden shadow-sm animate-slow-zoom">
             <img src={profileImageUrl} alt="Rafee" className="w-full h-full object-cover" />
          </a>
        </div>

        {showSuccessPopup && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="bg-white rounded-[3rem] p-10 max-w-sm mx-auto shadow-2xl scale-in-center animate-in zoom-in duration-300 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce shadow-xl shadow-indigo-100 border border-indigo-100">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-3">{t.successTitle}</h2>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-8">
                 <p className="text-slate-600 text-[13px] font-bold leading-relaxed">
                  {authenticatedUser?.role === 'user' ? t.customerSuccessDesc : t.successDesc}
                </p>
              </div>
              <button onClick={handleProceedToDashboard} className="w-full py-4 bg-indigo-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95">
                {t.enterPortal}
              </button>
            </div>
          </div>
        )}

        <div className="w-full max-w-sm mx-auto py-6">
          <div className="text-center mb-10">
            <div className="inline-block px-3 py-1 mb-6 rounded-lg bg-indigo-50 text-indigo-700 text-[9px] font-bold uppercase tracking-[0.2em]">{t.secureArea}</div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">{t.welcome}</h1>
            <p className="text-slate-500 text-xs font-medium">{t.loginDesc}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">{t.emailLabel}</label>
              <input type="text" required className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-slate-800 bg-slate-50/30 font-medium text-sm placeholder:text-slate-300" placeholder={t.placeholderEmail} value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.passLabel}</label>
                <button type="button" onClick={() => onSwitchView('forgot')} className="text-[10px] text-indigo-600 hover:text-indigo-800 transition-colors font-bold underline underline-offset-2">{t.forgotPass}</button>
              </div>
              <input type="password" required className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-slate-800 bg-slate-50/30 font-medium text-sm placeholder:text-slate-300" placeholder={t.placeholderPass} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm">
              <label className="block text-[9px] font-bold text-slate-400 mb-3 ml-1 uppercase tracking-widest">{t.captchaLabel}</label>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-white border border-indigo-100 px-3 sm:px-4 py-2.5 rounded-xl font-mono text-base sm:text-lg tracking-[0.1em] text-indigo-600 font-black select-none italic shadow-sm whitespace-nowrap min-w-[80px] text-center">{generatedCaptcha}</div>
                <input type="text" maxLength={5} required className="flex-1 min-w-0 px-2 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 outline-none text-center font-bold text-lg bg-white text-slate-800" placeholder="-----" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} />
                <button type="button" onClick={generateCaptcha} className="p-2.5 text-slate-400 hover:text-indigo-600 transition-all bg-white rounded-xl shadow-sm border border-slate-100 shrink-0" title={t.captchaChange}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
              </div>
              {error && <p className="text-[9px] text-red-500 mt-2.5 font-bold flex items-center gap-2 px-1 animate-shake">{error}</p>}
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-indigo-100 text-xs group mt-2">
              {isLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <><span>{t.loginBtn}</span><svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>}
            </button>
          </form>
          <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col gap-8 items-center md:hidden">
            <p className="text-[11px] text-slate-500 font-bold">{t.noAccount} <span className="text-indigo-600 font-bold cursor-pointer hover:underline decoration-1">{t.register}</span></p>
            <UtilityButtons />
          </div>
          <div className="mt-8 hidden md:block text-center">
             <p className="text-[11px] text-slate-400 font-bold">{t.noAccount} <span className="text-indigo-600 font-bold cursor-pointer hover:underline decoration-1 ml-1">{t.register}</span></p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
        @keyframes slow-zoom { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
        .animate-slow-zoom { animation: slow-zoom 8s ease-in-out infinite; }
      `}</style>
    </>
  );
};

export default LoginForm;
