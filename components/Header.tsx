
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 md:px-8 border-b border-white/10 flex items-center justify-between bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-900 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/20">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
            </svg>
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Faceless <span className="text-red-500">Saudagar</span></h1>
          <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Faceless Channel ka Saudagar</p>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-6">
        <span className="text-xs font-bold text-zinc-400 hover:text-white cursor-pointer transition-colors">GALLERY</span>
        <span className="text-xs font-bold text-zinc-400 hover:text-white cursor-pointer transition-colors">TEMPLATES</span>
        <button className="px-4 py-2 bg-white text-black text-xs font-black rounded hover:bg-zinc-200 transition-all">PRO PLAN</button>
      </div>
    </header>
  );
};

export default Header;