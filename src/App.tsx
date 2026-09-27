/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { PredictView } from './components/PredictView';
import { DashboardView } from './components/DashboardView';
import { ModelBenchmarkView } from './components/ModelBenchmarkView';
import { DatasetExplorerView } from './components/DatasetExplorerView';
import { AboutView } from './components/AboutView';
import { Sprout, BookOpen, Database, Github, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'predict' | 'dashboard' | 'models' | 'dataset' | 'about'>('home');
  const [historyCount, setHistoryCount] = useState<number>(0);

  const fetchHistoryCount = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.history) {
        setHistoryCount(data.history.length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistoryCount();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50/60 text-stone-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Sticky Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab: string) => setActiveTab(tab as any)}
        historyCount={historyCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {activeTab === 'home' && (
          <HomeView
            onNavigate={(tab: string) => setActiveTab(tab as any)}
          />
        )}

        {activeTab === 'predict' && (
          <PredictView
            onSuccessPrediction={fetchHistoryCount}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigateToPredict={() => setActiveTab('predict')}
          />
        )}

        {activeTab === 'models' && (
          <ModelBenchmarkView />
        )}

        {activeTab === 'dataset' && (
          <DatasetExplorerView />
        )}

        {activeTab === 'about' && (
          <AboutView />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-emerald-800 text-white flex items-center justify-center font-bold text-[10px]">
              🌱
            </div>
            <span className="font-semibold text-stone-700">Agri Yield Predictor</span>
            <span>·</span>
            <span>AI-Based Crop Yield Forecasting System</span>
          </div>

          <div className="flex items-center gap-4 text-stone-500">
            <button
              onClick={() => setActiveTab('models')}
              className="hover:text-emerald-800 transition-colors cursor-pointer"
            >
              ML Benchmark
            </button>
            <button
              onClick={() => setActiveTab('dataset')}
              className="hover:text-emerald-800 transition-colors cursor-pointer"
            >
              Dataset Schema
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className="hover:text-emerald-800 transition-colors cursor-pointer"
            >
              Viva Guide
            </button>
          </div>

          <p className="text-stone-400">
            Final-Year AI/ML College Project · Flask & Scikit-learn
          </p>
        </div>
      </footer>
    </div>
  );
}
