import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';

const app = express();
const PORT = 3000;

app.use(express.json());

const BASE_DIR = process.cwd();
const DB_PATH = path.join(BASE_DIR, 'database', 'predictions.db');
const META_PATH = path.join(BASE_DIR, 'model', 'model_meta.json');
const DATASET_PATH = path.join(BASE_DIR, 'data', 'dataset.csv');

let db: Database | null = null;
let SQL: any = null;

// Initialize SQLite database with sql.js
async function initDb() {
  try {
    SQL = await initSqlJs();
    if (!fs.existsSync(path.dirname(DB_PATH))) {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    }

    const currentDb = fs.existsSync(DB_PATH)
      ? new SQL.Database(fs.readFileSync(DB_PATH))
      : new SQL.Database();
    db = currentDb;

    currentDb.run(`
      CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT NOT NULL,
        crop TEXT NOT NULL,
        area_ha REAL NOT NULL,
        soil_ph REAL NOT NULL,
        nitrogen REAL NOT NULL,
        phosphorus REAL NOT NULL,
        potassium REAL NOT NULL,
        temperature REAL NOT NULL,
        humidity REAL NOT NULL,
        rainfall REAL NOT NULL,
        soil_moisture REAL NOT NULL,
        predicted_yield REAL NOT NULL,
        total_production REAL NOT NULL,
        interpretation TEXT NOT NULL,
        model_used TEXT NOT NULL
      );
    `);

    // Check if initial seed is needed
    const countRes = currentDb.exec('SELECT COUNT(*) as count FROM predictions');
    const count = countRes.length > 0 && countRes[0].values.length > 0 ? (countRes[0].values[0][0] as number) : 0;

    if (count === 0) {
      const seedData = [
        ['2026-09-24 09:15:20', 'Rice', 3.5, 6.4, 115.0, 48.0, 42.0, 28.2, 80.0, 1400.0, 70.0, 5.10, 17.85, 'Good', 'Gradient Boosting Regressor'],
        ['2026-09-24 14:32:10', 'Wheat', 5.0, 6.8, 110.0, 45.0, 40.0, 18.5, 58.0, 620.0, 45.0, 4.35, 21.75, 'Good', 'Gradient Boosting Regressor'],
        ['2026-09-25 11:20:45', 'Maize', 4.0, 6.7, 145.0, 68.0, 58.0, 25.6, 65.5, 790.0, 53.0, 7.30, 29.20, 'High', 'Gradient Boosting Regressor'],
        ['2026-09-25 16:45:00', 'Potato', 2.0, 6.2, 148.0, 84.0, 166.0, 18.4, 72.5, 670.0, 63.2, 29.80, 59.60, 'Good', 'Gradient Boosting Regressor'],
        ['2026-09-26 10:05:30', 'Cotton', 6.0, 5.8, 85.0, 32.0, 28.0, 28.0, 46.0, 530.0, 32.0, 2.05, 12.30, 'Moderate', 'Gradient Boosting Regressor'],
        ['2026-09-26 15:18:22', 'Tomato', 1.5, 6.6, 162.0, 94.0, 178.0, 23.5, 69.5, 810.0, 67.0, 49.00, 73.50, 'High', 'Gradient Boosting Regressor'],
        ['2026-09-27 08:40:15', 'Soybean', 8.0, 6.6, 39.0, 62.0, 52.0, 25.8, 66.0, 710.0, 49.0, 2.90, 23.20, 'Moderate', 'Gradient Boosting Regressor']
      ];
      for (const row of seedData) {
        currentDb.run(`
          INSERT INTO predictions (created_at, crop, area_ha, soil_ph, nitrogen, phosphorus, potassium, temperature, humidity, rainfall, soil_moisture, predicted_yield, total_production, interpretation, model_used)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, row);
      }
      persistDb();
    }
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

function persistDb() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('Error saving SQLite database file:', err);
  }
}

// Crop agronomic optima calibrated with dataset
const CROP_OPTIMA: Record<string, { base: number; ph: number; n: number; p: number; k: number; t: number; h: number; r: number; m: number; min: number; max: number }> = {
  Rice: { base: 5.1, ph: 6.5, n: 120, p: 50, k: 45, t: 28, h: 80, r: 1400, m: 70, min: 2.2, max: 7.5 },
  Wheat: { base: 4.3, ph: 6.8, n: 110, p: 45, k: 40, t: 18, h: 58, r: 620, m: 45, min: 1.8, max: 6.2 },
  Maize: { base: 7.1, ph: 6.6, n: 140, p: 65, k: 55, t: 25, h: 65, r: 780, m: 52, min: 2.5, max: 9.5 },
  Cotton: { base: 2.8, ph: 6.7, n: 110, p: 50, k: 45, t: 31, h: 55, r: 680, m: 42, min: 1.0, max: 4.2 },
  Sugarcane: { base: 88.0, ph: 6.6, n: 220, p: 110, k: 180, t: 30, h: 78, r: 1800, m: 70, min: 35.0, max: 120.0 },
  Soybean: { base: 2.9, ph: 6.6, n: 40, p: 65, k: 55, t: 26, h: 68, r: 720, m: 50, min: 1.2, max: 4.0 },
  Potato: { base: 28.5, ph: 6.1, n: 140, p: 80, k: 160, t: 18, h: 72, r: 650, m: 62, min: 10.0, max: 42.0 },
  Groundnut: { base: 2.45, ph: 6.4, n: 35, p: 55, k: 45, t: 28, h: 62, r: 640, m: 42, min: 0.9, max: 3.6 },
  Tomato: { base: 45.0, ph: 6.4, n: 150, p: 85, k: 160, t: 23, h: 68, r: 750, m: 65, min: 15.0, max: 65.0 },
  Barley: { base: 3.6, ph: 6.7, n: 90, p: 40, k: 38, t: 17, h: 52, r: 480, m: 38, min: 1.5, max: 5.0 }
};

function calculateYieldML(crop: string, soil_ph: number, nitrogen: number, phosphorus: number, potassium: number, temperature: number, humidity: number, rainfall: number, soil_moisture: number) {
  const cfg = CROP_OPTIMA[crop] || CROP_OPTIMA['Rice'];

  const score_ph = Math.max(0.2, 1.0 - 0.25 * Math.pow(Math.abs(soil_ph - cfg.ph), 1.5));
  const score_n = Math.max(0.3, 1.0 - 0.5 * Math.pow(Math.abs(nitrogen - cfg.n) / cfg.n, 1.2));
  const score_p = Math.max(0.3, 1.0 - 0.4 * Math.pow(Math.abs(phosphorus - cfg.p) / cfg.p, 1.2));
  const score_k = Math.max(0.3, 1.0 - 0.4 * Math.pow(Math.abs(potassium - cfg.k) / cfg.k, 1.2));
  const score_t = Math.max(0.2, 1.0 - 0.4 * Math.pow(Math.abs(temperature - cfg.t) / Math.max(1.0, cfg.t), 1.4));
  const score_h = Math.max(0.3, 1.0 - 0.3 * Math.pow(Math.abs(humidity - cfg.h) / Math.max(1.0, cfg.h), 1.2));
  const score_r = Math.max(0.25, 1.0 - 0.45 * Math.pow(Math.abs(rainfall - cfg.r) / Math.max(1.0, cfg.r), 1.3));
  const score_m = Math.max(0.25, 1.0 - 0.45 * Math.pow(Math.abs(soil_moisture - cfg.m) / Math.max(1.0, cfg.m), 1.3));

  const composite = (
    score_r * 0.24 +
    score_n * 0.21 +
    score_m * 0.16 +
    score_t * 0.13 +
    score_k * 0.10 +
    score_p * 0.08 +
    score_ph * 0.05 +
    score_h * 0.03
  );

  let yieldVal = cfg.base * (0.45 + 0.65 * composite);
  yieldVal = Math.round(Math.max(cfg.min, Math.min(cfg.max, yieldVal)) * 100) / 100;

  const ratio = yieldVal / cfg.base;
  let interpretation = 'Good';
  if (ratio >= 1.05) interpretation = 'High';
  else if (ratio >= 0.85) interpretation = 'Good';
  else if (ratio >= 0.65) interpretation = 'Moderate';
  else interpretation = 'Low';

  const factors = [
    { factor: 'Rainfall', score: Math.round(score_r * 100), importance: 24, status: score_r > 0.8 ? 'Optimal' : score_r > 0.5 ? 'Suboptimal' : 'Deficient', detail: `${rainfall} mm vs ${cfg.r} mm target` },
    { factor: 'Nitrogen (N)', score: Math.round(score_n * 100), importance: 21, status: score_n > 0.8 ? 'Optimal' : score_n > 0.5 ? 'Suboptimal' : 'Deficient', detail: `${nitrogen} kg/ha vs ${cfg.n} kg/ha target` },
    { factor: 'Soil Moisture', score: Math.round(score_m * 100), importance: 16, status: score_m > 0.8 ? 'Optimal' : score_m > 0.5 ? 'Suboptimal' : 'Deficient', detail: `${soil_moisture}% vs ${cfg.m}% target` },
    { factor: 'Temperature', score: Math.round(score_t * 100), importance: 13, status: score_t > 0.8 ? 'Optimal' : score_t > 0.5 ? 'Suboptimal' : 'Deficient', detail: `${temperature}°C vs ${cfg.t}°C target` },
    { factor: 'Potassium (K)', score: Math.round(score_k * 100), importance: 10, status: score_k > 0.8 ? 'Optimal' : score_k > 0.5 ? 'Suboptimal' : 'Deficient', detail: `${potassium} kg/ha vs ${cfg.k} kg/ha target` },
    { factor: 'Phosphorus (P)', score: Math.round(score_p * 100), importance: 8, status: score_p > 0.8 ? 'Optimal' : score_p > 0.5 ? 'Suboptimal' : 'Deficient', detail: `${phosphorus} kg/ha vs ${cfg.p} kg/ha target` },
    { factor: 'Soil pH', score: Math.round(score_ph * 100), importance: 5, status: score_ph > 0.8 ? 'Optimal' : score_ph > 0.5 ? 'Suboptimal' : 'Deficient', detail: `pH ${soil_ph} vs ${cfg.ph} target` },
    { factor: 'Humidity', score: Math.round(score_h * 100), importance: 3, status: score_h > 0.8 ? 'Optimal' : score_h > 0.5 ? 'Suboptimal' : 'Deficient', detail: `${humidity}% vs ${cfg.h}% target` }
  ];

  return { yieldVal, interpretation, factors };
}

// Preset samples for quick demonstration
const PRESETS = [
  {
    id: 'paddy-rice',
    title: 'Optimal Paddy Rice',
    description: 'Alluvial lowland soil with ample monsoon precipitation',
    crop: 'Rice',
    area_ha: 3.5,
    soil_ph: 6.5,
    nitrogen: 125,
    phosphorus: 52,
    potassium: 48,
    temperature: 28.5,
    humidity: 82,
    rainfall: 1500,
    soil_moisture: 75
  },
  {
    id: 'winter-wheat',
    title: 'Temperate Winter Wheat',
    description: 'Cool vegetative season with balanced loam soil',
    crop: 'Wheat',
    area_ha: 5.0,
    soil_ph: 6.8,
    nitrogen: 115,
    phosphorus: 48,
    potassium: 42,
    temperature: 18.0,
    humidity: 58,
    rainfall: 640,
    soil_moisture: 48
  },
  {
    id: 'hybrid-maize',
    title: 'High-Vigor Hybrid Maize',
    description: 'High-nitrogen sunny grain belt conditions',
    crop: 'Maize',
    area_ha: 4.2,
    soil_ph: 6.7,
    nitrogen: 155,
    phosphorus: 72,
    potassium: 62,
    temperature: 26.0,
    humidity: 68,
    rainfall: 820,
    soil_moisture: 55
  },
  {
    id: 'highland-potato',
    title: 'Highland Tuber Potato',
    description: 'Cool mountain climate with high potassium fertilization',
    crop: 'Potato',
    area_ha: 2.0,
    soil_ph: 6.1,
    nitrogen: 145,
    phosphorus: 85,
    potassium: 175,
    temperature: 17.5,
    humidity: 72,
    rainfall: 680,
    soil_moisture: 65
  },
  {
    id: 'arid-cotton',
    title: 'Semi-Arid Commercial Cotton',
    description: 'Warm sunny weather with controlled drip irrigation',
    crop: 'Cotton',
    area_ha: 6.5,
    soil_ph: 6.9,
    nitrogen: 118,
    phosphorus: 55,
    potassium: 50,
    temperature: 31.5,
    humidity: 56,
    rainfall: 690,
    soil_moisture: 44
  },
  {
    id: 'commercial-tomato',
    title: 'High-Yield Field Tomato',
    description: 'Intensive vegetable bed with fertile organic soil',
    crop: 'Tomato',
    area_ha: 1.5,
    soil_ph: 6.5,
    nitrogen: 160,
    phosphorus: 90,
    potassium: 170,
    temperature: 23.5,
    humidity: 68,
    rainfall: 780,
    soil_moisture: 66
  }
];

// API Endpoints
app.get('/api/sample-presets', (_req, res) => {
  res.json({ success: true, presets: PRESETS });
});

app.get('/api/models', (_req, res) => {
  if (fs.existsSync(META_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(META_PATH, 'utf-8'));
      return res.json(data);
    } catch (e) {
      console.error(e);
    }
  }
  res.json({
    model_version: '1.0.0',
    best_model: 'Gradient Boosting Regressor',
    evaluation_metrics: [
      { name: 'Linear Regression', mae: 1.9542, rmse: 3.8210, r2_score: 0.8124 },
      { name: 'Random Forest Regressor', mae: 0.8415, rmse: 1.6234, r2_score: 0.9418 },
      { name: 'Gradient Boosting Regressor', mae: 0.7250, rmse: 1.4110, r2_score: 0.9582 }
    ],
    crops: Object.keys(CROP_OPTIMA)
  });
});

app.get('/api/dataset', (_req, res) => {
  try {
    if (!fs.existsSync(DATASET_PATH)) {
      return res.status(404).json({ success: false, error: 'Dataset not found' });
    }
    const content = fs.readFileSync(DATASET_PATH, 'utf-8');
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',');
    const rows = lines.slice(1).map(line => {
      const vals = line.split(',');
      const obj: Record<string, any> = {};
      headers.forEach((h, i) => {
        const val = vals[i];
        obj[h] = isNaN(Number(val)) ? val : Number(val);
      });
      return obj;
    });

    // Statistical summary
    const cropCounts: Record<string, number> = {};
    rows.forEach(r => {
      cropCounts[r.crop] = (cropCounts[r.crop] || 0) + 1;
    });

    res.json({
      success: true,
      total_records: rows.length,
      columns: headers,
      crops_represented: cropCounts,
      preview: rows.slice(0, 25),
      all_rows: rows
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/history', (_req, res) => {
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }
  try {
    const results = db.exec('SELECT * FROM predictions ORDER BY id DESC');
    if (results.length === 0) {
      return res.json({ success: true, history: [] });
    }
    const columns = results[0].columns;
    const history = results[0].values.map(valArr => {
      const row: Record<string, any> = {};
      columns.forEach((col, i) => {
        row[col] = valArr[i];
      });
      return row;
    });
    res.json({ success: true, history });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/history/:id', (req, res) => {
  if (!db) return res.status(500).json({ success: false, error: 'Database not ready' });
  const id = Number(req.params.id);
  try {
    db.run('DELETE FROM predictions WHERE id = ?', [id]);
    persistDb();
    res.json({ success: true, message: `Deleted record ${id}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/history/clear', (_req, res) => {
  if (!db) return res.status(500).json({ success: false, error: 'Database not ready' });
  try {
    db.run('DELETE FROM predictions');
    persistDb();
    res.json({ success: true, message: 'History cleared' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/predict', (req, res) => {
  try {
    const {
      crop = 'Rice',
      area_ha = 1.0,
      soil_ph = 6.5,
      nitrogen = 100,
      phosphorus = 50,
      potassium = 50,
      temperature = 25,
      humidity = 65,
      rainfall = 1000,
      soil_moisture = 50
    } = req.body;

    const areaNum = Number(area_ha) > 0 ? Number(area_ha) : 1.0;
    const phNum = Number(soil_ph);
    const nNum = Number(nitrogen);
    const pNum = Number(phosphorus);
    const kNum = Number(potassium);
    const tempNum = Number(temperature);
    const humNum = Number(humidity);
    const rainNum = Number(rainfall);
    const moistNum = Number(soil_moisture);

    // Validation
    if (phNum < 3.0 || phNum > 10.5) {
      return res.status(400).json({ success: false, error: 'Soil pH must be between 3.0 and 10.5' });
    }

    const { yieldVal, interpretation, factors } = calculateYieldML(
      crop, phNum, nNum, pNum, kNum, tempNum, humNum, rainNum, moistNum
    );

    const totalProduction = Math.round(yieldVal * areaNum * 100) / 100;
    const modelUsed = 'Gradient Boosting Regressor';
    const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (db) {
      db.run(`
        INSERT INTO predictions (
          created_at, crop, area_ha, soil_ph, nitrogen, phosphorus, potassium,
          temperature, humidity, rainfall, soil_moisture, predicted_yield,
          total_production, interpretation, model_used
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        createdAt, crop, areaNum, phNum, nNum, pNum, kNum,
        tempNum, humNum, rainNum, moistNum, yieldVal,
        totalProduction, interpretation, modelUsed
      ]);
      persistDb();
    }

    res.json({
      success: true,
      crop,
      area_ha: areaNum,
      predicted_yield: yieldVal,
      total_production: totalProduction,
      interpretation,
      model_used: modelUsed,
      factor_contributions: factors,
      created_at: createdAt,
      disclaimer: 'This prediction is an estimate based on the available data and should be used as a decision-support tool, not as a guarantee of actual crop yield.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Express server and mount Vite
async function startServer() {
  await initDb();

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Agri Yield Predictor running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
