import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Droplets,
  Thermometer,
  CloudRain,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { PredictionResult, SamplePreset } from '../types';

interface PredictViewProps {
  onSuccessPrediction?: () => void;
  onNavigateToDashboard?: () => void;
}

export const PredictView: React.FC<PredictViewProps> = ({ onSuccessPrediction, onNavigateToDashboard }) => {
  const [crops] = useState<string[]>([
    'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 
    'Soybean', 'Potato', 'Groundnut', 'Tomato', 'Barley'
  ]);

  const [presets, setPresets] = useState<SamplePreset[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    crop: 'Rice',
    area_ha: 2.5,
    soil_ph: 6.5,
    nitrogen: 120,
    phosphorus: 50,
    potassium: 45,
    temperature: 28.0,
    humidity: 80,
    rainfall: 1400,
    soil_moisture: 70
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  // Fetch presets on load
  useEffect(() => {
    fetch('/api/sample-presets')
      .then(res => res.json())
      .then(data => {
        if (data.presets) {
          setPresets(data.presets);
        }
      })
      .catch(err => console.error('Preset loading error:', err));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'crop' ? value : Number(value)
    }));
  };

  const applyPreset = (preset: SamplePreset) => {
    setFormData({
      crop: preset.crop,
      area_ha: preset.area_ha,
      soil_ph: preset.soil_ph,
      nitrogen: preset.nitrogen,
      phosphorus: preset.phosphorus,
      potassium: preset.potassium,
      temperature: preset.temperature,
      humidity: preset.humidity,
      rainfall: preset.rainfall,
      soil_moisture: preset.soil_moisture
    });
    setError(null);
  };

  const handleReset = () => {
    setFormData({
      crop: 'Rice',
      area_ha: 2.5,
      soil_ph: 6.5,
      nitrogen: 120,
      phosphorus: 50,
      potassium: 45,
      temperature: 28.0,
      humidity: 80,
      rainfall: 1400,
      soil_moisture: 70
    });
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validation
    if (formData.area_ha <= 0) {
      setError('Area of land must be greater than 0 hectares.');
      return;
    }
    if (formData.soil_ph < 3.5 || formData.soil_ph > 10.0) {
      setError('Soil pH must be within agricultural range (3.5 to 10.0).');
      return;
    }
    if (formData.temperature < 0 || formData.temperature > 55) {
      setError('Temperature must be between 0°C and 55°C.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to calculate prediction.');
      }

      setResult(data);
      if (onSuccessPrediction) {
        onSuccessPrediction();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during prediction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
          <span>Crop Yield Forecasting Module</span>
          <span>·</span>
          <span>Gradient Boosting Regressor</span>
        </div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Estimate Expected Crop Yield
        </h1>
        <p className="text-stone-600 text-sm max-w-3xl">
          Enter farm soil test results and local environmental metrics. The machine learning model will predict the expected harvest yield per hectare and total farm production.
        </p>
      </div>

      {/* Preset Quick-Fill Bar */}
      {presets.length > 0 && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              Demo & Viva Quick Scenarios (One-Click Auto Fill)
            </span>
            <span className="text-[11px] text-stone-500">Click any preset to prefill inputs</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {presets.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 rounded-md text-xs font-medium text-stone-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <span>{p.title}</span>
                <span className="text-[10px] text-stone-400">({p.crop})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result Display Banner */}
      {result && (
        <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-emerald-200/80 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Forecast Result
                </span>
                <span className="text-stone-400">·</span>
                <span className="text-xs text-stone-600">{result.crop}</span>
                <span className="text-stone-400">·</span>
                <span className="text-xs text-stone-600">{result.area_ha} Hectares</span>
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-5xl font-black text-emerald-950 tracking-tight">
                  {result.predicted_yield.toFixed(2)}
                </span>
                <span className="text-xl font-bold text-emerald-800">tons / hectare</span>
              </div>
              <p className="text-sm font-medium text-emerald-900 pt-1">
                Estimated Total Farm Production: <strong className="text-emerald-950 text-base">{result.total_production.toFixed(2)} tons</strong>
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Yield Evaluation:</span>
                <span className={`px-3 py-1 text-xs font-bold rounded-md ${
                  result.interpretation === 'High' ? 'bg-emerald-200/80 text-emerald-900' :
                  result.interpretation === 'Good' ? 'bg-emerald-100 text-emerald-900' :
                  result.interpretation === 'Moderate' ? 'bg-amber-100 text-amber-900' :
                  'bg-red-100 text-red-900'
                }`}>
                  {result.interpretation} Yield
                </span>
              </div>
              <span className="text-[11px] font-mono text-stone-500">
                Model: {result.model_used}
              </span>
            </div>
          </div>

          {/* Factor Sensitivity Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Agronomic Factor Sensitivity & Contributions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {result.factor_contributions.map((f, i) => (
                <div key={i} className="bg-white/80 border border-emerald-200/60 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-900">{f.factor}</span>
                    <span className={`font-bold ${
                      f.status === 'Optimal' ? 'text-emerald-700' :
                      f.status === 'Suboptimal' ? 'text-amber-700' : 'text-rose-700'
                    }`}>
                      {f.status}
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        f.status === 'Optimal' ? 'bg-emerald-600' :
                        f.status === 'Suboptimal' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${f.score}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-stone-500">{f.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Support Disclaimer */}
          <div className="bg-emerald-100/60 border border-emerald-300/80 rounded-lg p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Decision-Support Notice:</strong> {result.disclaimer}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => onNavigateToDashboard && onNavigateToDashboard()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
            >
              <span>View in Prediction Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 text-xs font-semibold rounded-md transition-colors cursor-pointer"
            >
              Start Another Forecast
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Prediction Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 space-y-8 shadow-xs">
        {/* Section 1: Crop and Land Area */}
        <div className="space-y-4">
          <div className="border-b border-stone-100 pb-2">
            <h2 className="text-base font-bold text-stone-900">1. Target Crop & Land Area</h2>
            <p className="text-xs text-stone-500">Specify crop variety and cultivated land footprint</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="crop" className="block text-xs font-semibold text-stone-700">
                Selected Crop <span className="text-rose-500">*</span>
              </label>
              <select
                id="crop"
                name="crop"
                value={formData.crop}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-medium"
              >
                {crops.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="area_ha" className="block text-xs font-semibold text-stone-700">
                Land Area (Hectares) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="area_ha"
                  name="area_ha"
                  step="0.1"
                  min="0.1"
                  max="10000"
                  value={formData.area_ha}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 pr-12 bg-white border border-stone-300 rounded-md text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
                <span className="absolute right-3 top-2 text-xs font-semibold text-stone-400">ha</span>
              </div>
              <p className="text-[11px] text-stone-400">1 hectare ≈ 2.47 acres</p>
            </div>
          </div>
        </div>

        {/* Section 2: Soil Chemistry Parameters */}
        <div className="space-y-4">
          <div className="border-b border-stone-100 pb-2">
            <h2 className="text-base font-bold text-stone-900">2. Soil Chemistry Parameters (Laboratory Report)</h2>
            <p className="text-xs text-stone-500">Primary soil macronutrients and chemical reaction</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="soil_ph" className="text-xs font-semibold text-stone-700">
                  Soil pH (0 - 14)
                </label>
                <span className="text-xs font-mono font-bold text-emerald-800">{formData.soil_ph}</span>
              </div>
              <input
                type="number"
                id="soil_ph"
                name="soil_ph"
                step="0.1"
                min="3.5"
                max="10.0"
                value={formData.soil_ph}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
              <p className="text-[11px] text-stone-400">Neutral: 6.5 - 7.2</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="nitrogen" className="text-xs font-semibold text-stone-700">
                  Nitrogen (N)
                </label>
                <span className="text-xs font-mono font-bold text-emerald-800">{formData.nitrogen} kg/ha</span>
              </div>
              <input
                type="number"
                id="nitrogen"
                name="nitrogen"
                step="1"
                min="10"
                max="300"
                value={formData.nitrogen}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
              <p className="text-[11px] text-stone-400">Vegetative biomass driver</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="phosphorus" className="text-xs font-semibold text-stone-700">
                  Phosphorus (P)
                </label>
                <span className="text-xs font-mono font-bold text-emerald-800">{formData.phosphorus} kg/ha</span>
              </div>
              <input
                type="number"
                id="phosphorus"
                name="phosphorus"
                step="1"
                min="5"
                max="200"
                value={formData.phosphorus}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
              <p className="text-[11px] text-stone-400">Root & seed formation</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="potassium" className="text-xs font-semibold text-stone-700">
                  Potassium (K)
                </label>
                <span className="text-xs font-mono font-bold text-emerald-800">{formData.potassium} kg/ha</span>
              </div>
              <input
                type="number"
                id="potassium"
                name="potassium"
                step="1"
                min="5"
                max="300"
                value={formData.potassium}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
              <p className="text-[11px] text-stone-400">Osmotic regulation & vigor</p>
            </div>
          </div>
        </div>

        {/* Section 3: Environmental & Weather Parameters */}
        <div className="space-y-4">
          <div className="border-b border-stone-100 pb-2">
            <h2 className="text-base font-bold text-stone-900">3. Environmental & Weather Conditions</h2>
            <p className="text-xs text-stone-500">Seasonal meteorological conditions and soil water status</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="temperature" className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-stone-400" />
                  Temperature (°C)
                </label>
                <span className="text-xs font-mono font-bold text-emerald-800">{formData.temperature}°C</span>
              </div>
              <input
                type="number"
                id="temperature"
                name="temperature"
                step="0.5"
                min="5"
                max="50"
                value={formData.temperature}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="humidity" className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-stone-400" />
                  Relative Humidity (%)
                </label>
                <span className="text-xs font-mono font-bold text-emerald-800">{formData.humidity}%</span>
              </div>
              <input
                type="number"
                id="humidity"
                name="humidity"
                step="1"
                min="10"
                max="100"
                value={formData.humidity}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="rainfall" className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 text-stone-400" />
                  Rainfall (mm)
                </label>
                <span className="text-xs font-mono font-bold text-emerald-800">{formData.rainfall} mm</span>
              </div>
              <input
                type="number"
                id="rainfall"
                name="rainfall"
                step="10"
                min="50"
                max="4000"
                value={formData.rainfall}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="soil_moisture" className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-stone-400" />
                  Soil Moisture (%)
                </label>
                <span className="text-xs font-mono font-bold text-emerald-800">{formData.soil_moisture}%</span>
              </div>
              <input
                type="number"
                id="soil_moisture"
                name="soil_moisture"
                step="1"
                min="5"
                max="95"
                value={formData.soil_moisture}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-300 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>{loading ? 'Evaluating Model...' : 'Forecast Crop Yield'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Inputs</span>
          </button>
        </div>
      </form>
    </div>
  );
};
