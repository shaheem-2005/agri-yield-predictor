import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Info, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const DatasetExplorerView: React.FC = () => {
  const [datasetInfo, setDatasetInfo] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    fetch('/api/dataset')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDatasetInfo(data);
          setRows(data.all_rows || data.preview || []);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const downloadCSV = () => {
    window.open('/data/dataset.csv', '_blank');
  };

  const filteredRows = rows.filter(r => {
    const matchesCrop = selectedCrop === 'ALL' || r.crop === selectedCrop;
    const matchesSearch = Object.values(r).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesCrop && matchesSearch;
  });

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  const columnDictionary = [
    { col: 'crop', type: 'String', desc: 'Crop variety name (e.g. Rice, Wheat, Maize, Cotton, Tomato)' },
    { col: 'soil_ph', type: 'Float', desc: 'Soil acidity/alkalinity scale (3.5 to 10.0, optimal 6.0-7.5)' },
    { col: 'nitrogen', type: 'Float', desc: 'Available soil Nitrogen content in kilograms per hectare (kg/ha)' },
    { col: 'phosphorus', type: 'Float', desc: 'Available soil Phosphorus content in kilograms per hectare (kg/ha)' },
    { col: 'potassium', type: 'Float', desc: 'Available soil Potassium content in kilograms per hectare (kg/ha)' },
    { col: 'temperature', type: 'Float', desc: 'Average seasonal ambient temperature in degrees Celsius (°C)' },
    { col: 'humidity', type: 'Float', desc: 'Relative atmospheric humidity percentage (%)' },
    { col: 'rainfall', type: 'Float', desc: 'Cumulative seasonal rainfall / precipitation in millimeters (mm)' },
    { col: 'soil_moisture', type: 'Float', desc: 'Volumetric soil moisture percentage in root zone (%)' },
    { col: 'yield_tons_per_ha', type: 'Float', desc: 'Harvested crop yield output in metric tons per hectare (t/ha)' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            <span>Data Repository</span>
            <span>·</span>
            <span>Location: data/dataset.csv</span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            Agricultural Dataset Explorer
          </h1>
          <p className="text-stone-500 text-sm">
            Inspect the underlying agricultural data schema, feature distributions, and sample records
          </p>
        </div>

        <button
          onClick={downloadCSV}
          className="px-3.5 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download dataset.csv</span>
        </button>
      </div>

      {/* Dataset Attribution & Integrity Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex items-start gap-3.5">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-amber-900">
          <p className="font-bold uppercase tracking-wider text-[11px] text-amber-800">
            Dataset Attribution & Synthetic Data Transparency
          </p>
          <p className="leading-relaxed">
            The bundled default dataset is a <strong>calibrated synthetic agricultural dataset</strong> engineered specifically for testing, model training, and college demonstration. It simulates real-world non-linear agronomic responses (Liebig's Law of the Minimum, nutrient saturation curves, thermal optimum bell curves). For real-world production deployments, you can directly replace <code>data/dataset.csv</code> with real field records from government agricultural ministries, Kaggle, or FAOSTAT following the schema defined below.
          </p>
        </div>
      </div>

      {/* Dataset Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-1 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Total Dataset Samples
          </span>
          <div className="text-3xl font-extrabold text-stone-900">
            {datasetInfo?.total_records || rows.length}
          </div>
          <p className="text-[11px] text-stone-400">Validated agricultural rows in CSV</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-1 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Features & Target
          </span>
          <div className="text-3xl font-extrabold text-emerald-800">
            9 + 1
          </div>
          <p className="text-[11px] text-stone-400">9 input features + 1 target (yield_tons_per_ha)</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-1 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Represented Crops
          </span>
          <div className="text-3xl font-extrabold text-stone-900">
            {datasetInfo?.crops_represented ? Object.keys(datasetInfo.crops_represented).length : 10}
          </div>
          <p className="text-[11px] text-stone-400">Cereals, cash crops, tubers & pulses</p>
        </div>
      </div>

      {/* Column Schema Dictionary */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-stone-900">CSV Column Schema & Expected Formats</h2>
          <p className="text-xs text-stone-500">
            Required columns when substituting your own custom dataset into <code>data/dataset.csv</code>
          </p>
        </div>

        <div className="overflow-x-auto border border-stone-200 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold">
                <th className="py-2.5 px-3">Column Name</th>
                <th className="py-2.5 px-3">Data Type</th>
                <th className="py-2.5 px-3">Description & Agricultural Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {columnDictionary.map((col) => (
                <tr key={col.col} className={col.col === 'yield_tons_per_ha' ? 'bg-emerald-50/40' : ''}>
                  <td className="py-2.5 px-3 font-mono font-bold text-stone-900">
                    {col.col}
                    {col.col === 'yield_tons_per_ha' && (
                      <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        Target Variable
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-stone-500 font-mono">{col.type}</td>
                  <td className="py-2.5 px-3 text-stone-700">{col.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset Records Table */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-stone-900">Dataset Records Browser</h2>
            <p className="text-xs text-stone-500">
              Showing {filteredRows.length} filtered records (Page {page} of {totalPages})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search values..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-md text-xs text-stone-900 focus:outline-none"
              />
            </div>

            <select
              value={selectedCrop}
              onChange={e => { setSelectedCrop(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-md text-xs text-stone-900 focus:outline-none"
            >
              <option value="ALL">All Crops</option>
              {datasetInfo?.crops_represented && Object.keys(datasetInfo.crops_represented).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-stone-200 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold">
                <th className="py-2.5 px-3">Crop</th>
                <th className="py-2.5 px-3">pH</th>
                <th className="py-2.5 px-3">N (kg/ha)</th>
                <th className="py-2.5 px-3">P (kg/ha)</th>
                <th className="py-2.5 px-3">K (kg/ha)</th>
                <th className="py-2.5 px-3">Temp (°C)</th>
                <th className="py-2.5 px-3">Humidity (%)</th>
                <th className="py-2.5 px-3">Rain (mm)</th>
                <th className="py-2.5 px-3">Moisture (%)</th>
                <th className="py-2.5 px-3 font-bold text-emerald-900">Yield (t/ha)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {pagedRows.map((r, i) => (
                <tr key={i} className="hover:bg-stone-50 transition-colors">
                  <td className="py-2 px-3 font-bold text-stone-900">{r.crop}</td>
                  <td className="py-2 px-3 text-stone-600">{r.soil_ph}</td>
                  <td className="py-2 px-3 text-stone-600">{r.nitrogen}</td>
                  <td className="py-2 px-3 text-stone-600">{r.phosphorus}</td>
                  <td className="py-2 px-3 text-stone-600">{r.potassium}</td>
                  <td className="py-2 px-3 text-stone-600">{r.temperature}°C</td>
                  <td className="py-2 px-3 text-stone-600">{r.humidity}%</td>
                  <td className="py-2 px-3 text-stone-600">{r.rainfall}mm</td>
                  <td className="py-2 px-3 text-stone-600">{r.soil_moisture}%</td>
                  <td className="py-2 px-3 font-bold font-mono text-emerald-800">{r.yield_tons_per_ha}</td>
                </tr>
              ))}
              {pagedRows.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-stone-400">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-2 text-xs text-stone-500">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-2.5 py-1.5 border border-stone-300 rounded hover:bg-stone-50 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2.5 py-1.5 border border-stone-300 rounded hover:bg-stone-50 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
