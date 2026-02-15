
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-950 font-['Hind_Siliguri']">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse delay-1000 pointer-events-none"></div>
      
      {/* Full Screen Wrapper for Desktop/Tablet */}
      <main className="z-10 w-full h-full min-h-screen flex items-center justify-center">
        <div className="w-full h-full min-h-screen md:h-auto md:min-h-0 md:max-w-[95%] lg:max-w-[100%] xl:max-w-[1400px] md:aspect-video lg:aspect-auto lg:h-[90vh] bg-white md:rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-700 flex flex-col md:flex-row border border-white/10 relative">
          {children}
        </div>
      </main>
      
      {/* Minimal Footer for branding */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em] pointer-events-none hidden md:block">
        Secure Access Portal • Managed by Admin
      </footer>
    </div>
  );
};

export default Layout;
