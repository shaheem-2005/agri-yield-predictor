import React from 'react';
import { Sprout, BarChart3, Calculator, Database, BookOpen, Layers } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, historyCount }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Sprout },
    { id: 'predict', label: 'Predict Yield', icon: Calculator },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, count: historyCount },
    { id: 'models', label: 'ML Benchmarks', icon: Layers },
    { id: 'dataset', label: 'Dataset Explorer', icon: Database },
    { id: 'about', label: 'Project Docs & Viva', icon: BookOpen }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
              <Sprout className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-stone-900 block leading-tight">
                Agri Yield Predictor
              </span>
              <span className="text-[11px] font-medium tracking-wide uppercase text-stone-500 block">
                AI Crop Forecasting
              </span>
            </div>
          </button>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer relative ${
                    isActive
                      ? 'text-emerald-800 font-semibold'
                      : 'text-stone-600 hover:text-stone-950'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="ml-1 text-xs text-stone-500 font-normal">
                      ({item.count})
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-700 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('predict')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-all shadow-xs cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Predict Yield</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Scrollbar */}
        <div className="flex md:hidden overflow-x-auto py-2.5 border-t border-stone-100 gap-2 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
