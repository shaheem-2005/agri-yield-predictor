export interface FactorContribution {
  factor: string;
  score: number;
  importance: number;
  status: 'Optimal' | 'Suboptimal' | 'Deficient';
  detail: string;
}

export interface PredictionResult {
  id?: number;
  crop: string;
  area_ha: number;
  predicted_yield: number;
  total_production: number;
  interpretation: 'High' | 'Good' | 'Moderate' | 'Low';
  model_used: string;
  factor_contributions: FactorContribution[];
  created_at: string;
  disclaimer: string;
}

export interface PredictionRecord {
  id: number;
  created_at: string;
  crop: string;
  area_ha: number;
  soil_ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  soil_moisture: number;
  predicted_yield: number;
  total_production: number;
  interpretation: string;
  model_used: string;
}

export interface ModelMetric {
  name: string;
  mae: number;
  rmse: number;
  r2_score: number;
  training_time_ms?: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  unit: string;
  impact: string;
}

export interface ModelMetadata {
  model_version: string;
  best_model: string;
  evaluation_metrics: ModelMetric[];
  feature_importance?: FeatureImportance[];
  crops: string[];
  crop_statistics?: Record<string, any>;
  dataset_summary?: {
    total_samples: number;
    features_count: number;
    target: string;
    columns: string[];
  };
}

export interface SamplePreset {
  id: string;
  title: string;
  description: string;
  crop: string;
  area_ha: number;
  soil_ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  soil_moisture: number;
}
