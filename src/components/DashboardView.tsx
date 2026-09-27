import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Trash2, 
  Download, 
  Search, 
  Filter, 
  RefreshCw, 
  Calendar,
  Layers,
  Sprout,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PredictionRecord } from '../types';

interface DashboardViewProps {
  onNavigateToPredict: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateToPredict }) => {
  const [history, setHistory] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cropFilter, setCropFilter] = useState('ALL');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.history) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this prediction record from SQLite?')) return;
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setHistory(prev => prev.filter(r => r.id !== id));
        showStatus('Record deleted successfully');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Warning: This will clear all historical predictions from the database. Continue?')) return;
    try {
      const res = await fetch('/api/history/clear', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setHistory([]);
        showStatus('History database cleared');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const exportCSV = () => {
    if (history.length === 0) return;
    const headers = ['id', 'created_at', 'crop', 'area_ha', 'soil_ph', 'nitrogen', 'phosphorus', 'potassium', 'temperature', 'humidity', 'rainfall', 'soil_moisture', 'predicted_yield', 'total_production', 'interpretation', 'model_used'];
    const rows = history.map(r => [
      r.id,
      r.created_at,
      r.crop,
      r.area_ha,
      r.soil_ph,
      r.nitrogen,
      r.phosphorus,
      r.potassium,
      r.temperature,
      r.humidity,
      r.rainfall,
      r.soil_moisture,
      r.predicted_yield,
      r.total_production,
      r.interpretation,
      r.model_used
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `agri_yield_predictions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showStatus('Exported CSV file');
  };

  // Filtered rows
  const filteredHistory = history.filter(item => {
    const matchesSearch = item.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.created_at.includes(searchTerm) ||
      item.interpretation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = cropFilter === 'ALL' || item.crop === cropFilter;
    return matchesSearch && matchesCrop;
  });

  // Unique crops in history
  const uniqueCrops = Array.from(new Set(history.map(h => h.crop)));

  // Analytics
  const totalCount = history.length;
  const avgYield = totalCount > 0 ? Math.round((history.reduce((acc, h) => acc + h.predicted_yield, 0) / totalCount) * 100) / 100 : 0;
  const latestPrediction = totalCount > 0 ? history[0] : null;

  // Crop distribution aggregation
  const cropAgg: Record<string, { count: number; totalYield: number }> = {};
  history.forEach(h => {
    if (!cropAgg[h.crop]) {
      cropAgg[h.crop] = { count: 0, totalYield: 0 };
    }
    cropAgg[h.crop].count += 1;
    cropAgg[h.crop].totalYield += h.predicted_yield;
  });

  const cropChartData = Object.entries(cropAgg).map(([crop, data]) => ({
    crop,
    avg: Math.round((data.totalYield / data.count) * 100) / 100,
    count: data.count
  })).sort((a, b) => b.avg - a.avg);

  const maxAvgYield = Math.max(...cropChartData.map(c => c.avg), 10);

  const mostFrequentCrop = Object.entries(cropAgg).sort((a, b) => b[1].count - a[1].count)[0]?.[0] || 'N/A';

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            <span>Historical Yield Intelligence</span>
            <span>·</span>
            <span>SQLite Database: predictions.db</span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            Yield Forecasting Dashboard
          </h1>
          <p className="text-stone-500 text-sm">
            Auditing past agricultural predictions, yield distribution, and localized input trends
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchHistory}
            className="p-2 border border-stone-300 hover:bg-stone-50 rounded-md text-stone-600 transition-colors cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportCSV}
            disabled={history.length === 0}
            className="px-3.5 py-2 border border-stone-300 hover:bg-stone-50 disabled:opacity-50 text-stone-700 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onNavigateToPredict}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
          >
            + New Prediction
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-1 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Total Queries Logged
          </span>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-extrabold text-stone-900">{totalCount}</span>
            <span className="text-xs text-stone-400">records</span>
          </div>
          <p className="text-[11px] text-stone-400">Stored in SQLite `database/predictions.db`</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-1 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Mean Predicted Yield
          </span>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-extrabold text-emerald-800">{avgYield}</span>
            <span className="text-xs font-bold text-emerald-700">t/ha</span>
          </div>
          <p className="text-[11px] text-stone-400">Arithmetic mean across all crops</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-1 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Most Queried Crop
          </span>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-extrabold text-stone-900">{mostFrequentCrop}</span>
          </div>
          <p className="text-[11px] text-stone-400">
            {cropAgg[mostFrequentCrop]?.count || 0} prediction forecasts recorded
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-1 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Latest Prediction
          </span>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-extrabold text-stone-900">
              {latestPrediction ? `${latestPrediction.predicted_yield} t/ha` : 'N/A'}
            </span>
          </div>
          <p className="text-[11px] text-stone-400 truncate">
            {latestPrediction ? `${latestPrediction.crop} · ${latestPrediction.created_at.slice(0, 10)}` : 'No predictions yet'}
          </p>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      {cropChartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Average Yield By Crop (Bar Chart) */}
          <div className="lg:col-span-2 bg-white border border-stone-200 rounded-xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-stone-900">Average Predicted Yield by Crop</h2>
                <p className="text-xs text-stone-500">Tons per hectare across historical queries</p>
              </div>
              <span className="text-xs text-stone-400">{cropChartData.length} Crops</span>
            </div>

            <div className="space-y-2.5 pt-2">
              {cropChartData.map((item) => {
                const percent = Math.min(100, Math.round((item.avg / maxAvgYield) * 100));
                return (
                  <div key={item.crop} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-700 w-24 truncate">{item.crop}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-stone-400 text-[11px]">({item.count} query)</span>
                        <span className="font-mono font-bold text-emerald-800">{item.avg} t/ha</span>
                      </div>
                    </div>
                    <div className="w-full bg-stone-100 h-3 rounded-md overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-md transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interpretation Distribution */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-stone-900">Yield Tier Distribution</h2>
              <p className="text-xs text-stone-500">Breakdown of calculated yield classifications</p>
            </div>

            <div className="space-y-3 pt-2">
              {['High', 'Good', 'Moderate', 'Low'].map(tier => {
                const count = history.filter(h => h.interpretation === tier).length;
                const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                return (
                  <div key={tier} className="p-3 rounded-lg border border-stone-100 bg-stone-50/50 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-800">{tier} Yield</span>
                      <span className="font-mono font-bold text-stone-700">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          tier === 'High' ? 'bg-emerald-600' :
                          tier === 'Good' ? 'bg-emerald-500' :
                          tier === 'Moderate' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* History Table Container */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-stone-900">Historical Prediction Logs</h2>
            <p className="text-xs text-stone-500">
              Persistent records with soil chemistry, weather indicators, and resulting yield
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search crop or date..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-md text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <select
              value={cropFilter}
              onChange={e => setCropFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-md text-xs text-stone-900 focus:outline-none"
            >
              <option value="ALL">All Crops</option>
              {uniqueCrops.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {history.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-2.5 py-1.5 text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs rounded-md transition-colors cursor-pointer"
                title="Clear all records"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-stone-200 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold">
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Crop</th>
                <th className="py-2.5 px-3">Area</th>
                <th className="py-2.5 px-3">Soil (pH / N-P-K)</th>
                <th className="py-2.5 px-3">Weather (T / Rain / Moist)</th>
                <th className="py-2.5 px-3">Yield (t/ha)</th>
                <th className="py-2.5 px-3">Total Prod</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredHistory.map((row) => (
                <tr key={row.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-2.5 px-3 text-stone-500 whitespace-nowrap font-mono text-[11px]">
                    {row.created_at}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-stone-900">
                    {row.crop}
                  </td>
                  <td className="py-2.5 px-3 text-stone-600">
                    {row.area_ha} ha
                  </td>
                  <td className="py-2.5 px-3 text-stone-600 whitespace-nowrap">
                    <span>pH {row.soil_ph}</span>
                    <span className="text-stone-300 mx-1">·</span>
                    <span className="font-mono text-[11px]">{row.nitrogen}-{row.phosphorus}-{row.potassium}</span>
                  </td>
                  <td className="py-2.5 px-3 text-stone-600 whitespace-nowrap">
                    <span>{row.temperature}°C</span>
                    <span className="text-stone-300 mx-1">·</span>
                    <span>{row.rainfall}mm</span>
                    <span className="text-stone-300 mx-1">·</span>
                    <span>{row.soil_moisture}%</span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-emerald-900 font-mono text-xs">
                    {row.predicted_yield.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-stone-700 font-medium">
                    {row.total_production.toFixed(2)} t
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      row.interpretation === 'High' ? 'bg-emerald-100 text-emerald-800' :
                      row.interpretation === 'Good' ? 'bg-emerald-50 text-emerald-700' :
                      row.interpretation === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {row.interpretation}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-stone-400 text-sm">
                    {loading ? 'Loading predictions...' : 'No matching prediction records found in SQLite database.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
