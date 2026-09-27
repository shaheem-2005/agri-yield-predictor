import React from 'react';
import { 
  Sprout, 
  ArrowRight, 
  Layers, 
  Database, 
  CheckCircle2, 
  LineChart, 
  Droplets, 
  Thermometer, 
  Compass, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: string) => void;
  onSelectCropPreset?: (crop: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const supportedCrops = [
    { name: 'Rice', icon: '🌾', typical: '4.5 - 6.5 t/ha', season: 'Kharif / Monsoon' },
    { name: 'Wheat', icon: '🌾', typical: '3.5 - 5.5 t/ha', season: 'Rabi / Winter' },
    { name: 'Maize', icon: '🌽', typical: '6.0 - 9.0 t/ha', season: 'Kharif / Spring' },
    { name: 'Cotton', icon: '☁️', typical: '2.0 - 3.5 t/ha', season: 'Kharif / Dry' },
    { name: 'Sugarcane', icon: '🎋', typical: '75.0 - 110.0 t/ha', season: 'Annual Perennial' },
    { name: 'Soybean', icon: '🌱', typical: '2.2 - 3.5 t/ha', season: 'Kharif / Rainfed' },
    { name: 'Potato', icon: '🥔', typical: '22.0 - 36.0 t/ha', season: 'Rabi / Highland' },
    { name: 'Groundnut', icon: '🥜', typical: '1.8 - 3.0 t/ha', season: 'Kharif / Semi-Arid' },
    { name: 'Tomato', icon: '🍅', typical: '35.0 - 58.0 t/ha', season: 'Annual Horticulture' },
    { name: 'Barley', icon: '🌾', typical: '2.8 - 4.5 t/ha', season: 'Rabi / Cool Dry' }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Soil & Climate Input',
      desc: 'Enter soil test reports (pH, Nitrogen, Phosphorus, Potassium) alongside weather variables (temperature, rainfall, soil moisture, humidity).'
    },
    {
      step: '02',
      title: 'Model Inference',
      desc: 'Parameters are passed through a trained Gradient Boosting Regressor (compared against Random Forest and Linear Regression on R² and RMSE).'
    },
    {
      step: '03',
      title: 'Yield & Production Output',
      desc: 'Receive immediate expected yield per hectare, estimated total farm production in tons, and agronomical sensitivity factor breakdown.'
    },
    {
      step: '04',
      title: 'Persistent Storage',
      desc: 'Predictions are committed into SQLite database for historical tracking, season-over-season comparison, and exportable audit logs.'
    }
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-stone-900 via-stone-900 to-emerald-950 text-white p-8 sm:p-12 lg:p-16 shadow-lg border border-stone-800">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 tracking-wider uppercase">
            <span>Academic Final-Year Project</span>
            <span>·</span>
            <span>Machine Learning & Agronomy</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Agri Yield Predictor
          </h1>

          <p className="text-lg sm:text-xl text-stone-300 font-medium leading-relaxed">
            AI-Based Crop Yield Forecasting System
          </p>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Forecasting crop yield based on localized soil chemistry and microclimatic indicators.
            Bridging the gap between laboratory soil testing and practical harvest management using
            data-driven regression models.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('predict')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-md transition-all cursor-pointer"
            >
              <span>Predict Crop Yield</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800/80 hover:bg-stone-800 text-stone-200 font-semibold rounded-lg border border-stone-700 transition-all cursor-pointer"
            >
              <span>View Analytics Dashboard</span>
            </button>

            <button
              onClick={() => onNavigate('about')}
              className="inline-flex items-center gap-1.5 px-4 py-3 text-stone-300 hover:text-white text-sm font-medium transition-colors cursor-pointer"
            >
              <span>About Project & Architecture →</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid Background */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Problem Statement Card */}
      <section className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-xs">
        <div className="max-w-4xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm uppercase tracking-wide">
            <Compass className="w-4 h-4 text-emerald-700" />
            <span>The Agricultural Challenge</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900">
            Why Machine Learning for Crop Yield Estimation?
          </h2>
          <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
            Farmers often struggle to estimate crop yield because soil fertility and environmental conditions vary significantly across locations and seasonal weather fronts. Traditional rule-of-thumb heuristics fail when irregular precipitation, nutrient imbalances, or thermal stress arise. By training multi-feature regression algorithms on historical agricultural parameters, this system provides accurate yield forecasts to support better planting, irrigation, and storage decisions.
          </p>
        </div>
      </section>

      {/* 4-Step Technical Workflow */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">System Workflow</h2>
          <p className="text-stone-500 text-sm">How input parameters transform into actionable crop yield forecasts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((s) => (
            <div key={s.step} className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-emerald-700 block">STEP {s.step}</span>
                <h3 className="font-bold text-stone-900 text-base">{s.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Agronomic Features Grid */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Integrated Parameters</h2>
          <p className="text-stone-500 text-sm">Comprehensive multi-factorial agronomical evaluation</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <Sprout className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-base">Soil Macronutrients (NPK)</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Considers Nitrogen (N), Phosphorus (P), and Potassium (K) levels in kg/ha, which govern cell division, root establishment, and stress tolerance.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
              <Thermometer className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-base">Thermal & Humidity Conditions</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Models optimum temperature ranges and ambient relative humidity percentages that affect transpiration rates and pollination efficiency.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-base">Hydrology & Moisture Content</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Evaluates seasonal rainfall depth (mm) and root-zone volumetric soil moisture content (%) to detect drought stress or waterlogging risks.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Crops Catalog */}
      <section className="bg-stone-50 rounded-2xl border border-stone-200 p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Supported Crops & Baseline Yields</h2>
            <p className="text-stone-500 text-sm">Calibrated with historical agronomic response curves</p>
          </div>
          <button
            onClick={() => onNavigate('dataset')}
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Explore Dataset & Distribution →</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {supportedCrops.map((c) => (
            <div
              key={c.name}
              className="bg-white rounded-lg border border-stone-200 p-3.5 space-y-1 hover:border-emerald-500 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{c.icon}</span>
                <span className="text-[11px] font-mono text-stone-500">{c.typical}</span>
              </div>
              <p className="font-bold text-stone-900 text-sm">{c.name}</p>
              <p className="text-[11px] text-stone-500">{c.season}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mandatory Decision-Support Disclaimer */}
      <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-5 flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-amber-900">
          <p className="font-bold uppercase tracking-wider text-[11px] text-amber-800">
            Decision-Support Notice
          </p>
          <p className="leading-relaxed">
            This prediction is an estimate based on the available data and should be used as a decision-support tool, not as a guarantee of actual crop yield. Real farm yields are also influenced by seed variety, pest pressure, weed infestation, and unpredicted micro-climatic events.
          </p>
        </div>
      </section>
    </div>
  );
};
