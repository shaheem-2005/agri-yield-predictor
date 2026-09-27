import React from 'react';
import { 
  BookOpen, 
  Code2, 
  HelpCircle, 
  Cpu, 
  Database, 
  Terminal, 
  Layers, 
  Lightbulb, 
  CheckCircle2, 
  FileCode,
  ShieldCheck
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const vivaQuestions = [
    {
      q: 'Why did you select Gradient Boosting over simple Multiple Linear Regression?',
      a: 'Biological crop growth does not respond linearly to environmental factors. For example, Liebig’s Law of the Minimum dictates that yield is limited by the scarcest nutrient, not total nutrient sum. Furthermore, excessive rainfall causes waterlogging and root rot, forming an inverted quadratic curve. Linear regression assumes constant marginal returns, whereas tree-based ensembles (Gradient Boosting, Random Forest) segment feature space to fit non-linear thresholds and complex multi-nutrient interactions.'
    },
    {
      q: 'How did you prevent data leakage during model training?',
      a: 'The dataset was strictly partitioned into 80% training and 20% testing sets using a fixed random seed prior to model fitting. Preprocessing scaling parameters and categorical encoders were fitted strictly on the training partition and then transformed onto the test partition. Evaluation metrics (MAE, RMSE, R²) were calculated exclusively on the unseen test split.'
    },
    {
      q: 'How is total production calculated in the system?',
      a: 'The regression model predicts expected yield per unit land area: Yield (tons/hectare). Total farm harvest is computed as: Total Production (tons) = Predicted Yield (tons/ha) × Cultivated Land Area (ha). Both metrics are shown with explicit units.'
    },
    {
      q: 'Why use SQLite for persistent prediction history?',
      a: 'SQLite is an embedded, zero-configuration, serverless relational database engine stored in a single file (database/predictions.db). It requires no external database server daemon, making the project portable and reliable for academic project demonstrations, viva evaluations, and offline field use.'
    },
    {
      q: 'What is the role of feature importance in this project?',
      a: 'Feature importance provides model interpretability and explainability (XAI). Rather than treating the machine learning model as a black box, the system extracts tree split gain weights to explain which environmental factors (e.g. Rainfall 24%, Nitrogen 21%, Soil Moisture 16%) exerted the strongest control over the final predicted yield.'
    }
  ];

  const suggestedImprovements = [
    {
      title: 'Automated Weather API Integration',
      desc: 'Connect OpenWeatherMap or Tomorrow.io APIs using GPS geolocation to automatically ingest 7-day forecast temperatures, relative humidity, and rainfall without manual user input.'
    },
    {
      title: 'Prescriptive Fertilizer Recommendation',
      desc: 'Extend the model to compute the exact N-P-K nutrient deficit relative to optimal crop targets and output recommended fertilizer dosages (Urea, DAP, MOP in kg/ha).'
    },
    {
      title: 'Soil Health & Satellite NDVI Analysis',
      desc: 'Integrate Sentinel-2 satellite multi-spectral imagery to compute Normalized Difference Vegetation Index (NDVI) and monitor real-time crop vigor during mid-season.'
    },
    {
      title: 'User Authentication & Multi-Farm Management',
      desc: 'Add user accounts (farmers, agricultural extension officers, co-ops) allowing individual farmers to manage multiple land plots and track multi-year historical yield trajectories.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
          <span>Documentation & Defense Guide</span>
          <span>·</span>
          <span>Final-Year B.Tech / B.E. / M.Sc Project</span>
        </div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Project Architecture & Viva Guide
        </h1>
        <p className="text-stone-500 text-sm max-w-3xl">
          Comprehensive technical reference covering machine learning design decisions, mathematical regression metrics, system architecture, and academic viva voce defense preparation.
        </p>
      </div>

      {/* Tech Stack Diagram */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="text-base font-bold text-stone-900">System Architecture & Tech Stack</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase">
              <Cpu className="w-4 h-4 text-emerald-700" />
              <span>Machine Learning Core</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              <strong>Python, Scikit-learn, Pandas, NumPy</strong><br />
              Gradient Boosting Regressor, Random Forest, Linear Regression. Trained on 9 agronomical features, evaluated on MAE, RMSE, and R² scores. Model artifacts saved to <code>model/crop_yield_model.pkl</code>.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase">
              <Terminal className="w-4 h-4 text-emerald-700" />
              <span>Backend & Database</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              <strong>Python Flask & SQLite3</strong><br />
              REST API endpoints (<code>/api/predict</code>, <code>/api/history</code>, <code>/api/models</code>), server-side input validation, error handling, and persistent storage in <code>database/predictions.db</code>.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>Frontend User Interface</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              <strong>React 19, TypeScript, Tailwind CSS</strong><br />
              Responsive, farmer-friendly web interface with quick-fill scenarios, visual factor sensitivity breakdowns, dynamic SVG charts, and interactive history auditing.
            </p>
          </div>
        </div>
      </div>

      {/* Regression Metrics & Formulas */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-stone-900">Mathematical Formulation of Regression Metrics</h2>
          <p className="text-xs text-stone-500">Formulas used to evaluate and compare the regression algorithms</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
            <span className="text-xs font-bold text-emerald-800 uppercase block">1. R² (Coefficient of Determination)</span>
            <div className="p-2.5 bg-white border border-stone-200 rounded font-mono text-xs text-stone-800">
              R² = 1 - (Σ(y - ŷ)² / Σ(y - ȳ)²)
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Proportion of total yield variation explained by the input soil and environmental parameters. Target: &gt; 0.90.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
            <span className="text-xs font-bold text-emerald-800 uppercase block">2. MAE (Mean Absolute Error)</span>
            <div className="p-2.5 bg-white border border-stone-200 rounded font-mono text-xs text-stone-800">
              MAE = (1/n) Σ |y_i - ŷ_i|
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Linear average magnitude of individual forecast errors in metric tons per hectare without squaring penalties.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
            <span className="text-xs font-bold text-emerald-800 uppercase block">3. RMSE (Root Mean Squared Error)</span>
            <div className="p-2.5 bg-white border border-stone-200 rounded font-mono text-xs text-stone-800">
              RMSE = √[(1/n) Σ (y_i - ŷ_i)²]
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Penalizes larger outliers more severely, serving as a measure of model stability across volatile conditions.
            </p>
          </div>
        </div>
      </div>

      {/* College Project Viva Q&A Guide */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-stone-900">Final-Year Viva Voce Q&A Preparation</h2>
          <p className="text-xs text-stone-500">Standard questions asked by external examiners and panel evaluators</p>
        </div>

        <div className="space-y-4">
          {vivaQuestions.map((item, idx) => (
            <div key={idx} className="p-4 bg-stone-50/70 border border-stone-200 rounded-lg space-y-2">
              <h3 className="text-xs font-bold text-stone-900 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                  {idx + 1}
                </span>
                <span>{item.q}</span>
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed pl-7">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Future Improvements */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 sm:p-8 space-y-4">
        <div>
          <h2 className="text-base font-bold text-stone-900">Future Scope & Improvements</h2>
          <p className="text-xs text-stone-500">Recommended extensions for subsequent academic iterations or commercialization</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {suggestedImprovements.map((imp, idx) => (
            <div key={idx} className="p-4 bg-white border border-stone-200 rounded-lg space-y-1.5 shadow-2xs">
              <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <span>{imp.title}</span>
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {imp.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
