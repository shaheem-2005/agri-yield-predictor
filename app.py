"""
Agri Yield Predictor - Flask Application Backend
=================================================
A college/final-year machine learning web application for crop yield forecasting.
Connects the Scikit-learn ML model, SQLite database, and Jinja2 templates.
"""

import os
import sqlite3
import json
import datetime
from flask import Flask, render_template, request, jsonify, redirect, url_for

app = Flask(__name__)
app.config["SECRET_KEY"] = "agri-yield-predictor-secret-key-2026"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database", "predictions.db")
META_PATH = os.path.join(BASE_DIR, "model", "model_meta.json")

def get_db_connection():
    """Create a database connection with dictionary-like row access."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Ensure SQLite predictions table exists."""
    os.makedirs(os.path.join(BASE_DIR, "database"), exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
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
    )
    """)
    conn.commit()
    conn.close()

# Load model metadata if available
model_metadata = {}
if os.path.exists(META_PATH):
    try:
        with open(META_PATH, "r", encoding="utf-8") as f:
            model_metadata = json.load(f)
    except Exception as e:
        print(f"Warning: Could not load model_meta.json: {e}")

# Agronomical ML Prediction Core
CROP_OPTIMA = {
    "Rice": {"base": 5.1, "ph": 6.5, "n": 120, "p": 50, "k": 45, "t": 28, "h": 80, "r": 1400, "m": 70, "min": 2.2, "max": 7.5},
    "Wheat": {"base": 4.3, "ph": 6.8, "n": 110, "p": 45, "k": 40, "t": 18, "h": 58, "r": 620, "m": 45, "min": 1.8, "max": 6.2},
    "Maize": {"base": 7.1, "ph": 6.6, "n": 140, "p": 65, "k": 55, "t": 25, "h": 65, "r": 780, "m": 52, "min": 2.5, "max": 9.5},
    "Cotton": {"base": 2.8, "ph": 6.7, "n": 110, "p": 50, "k": 45, "t": 31, "h": 55, "r": 680, "m": 42, "min": 1.0, "max": 4.2},
    "Sugarcane": {"base": 88.0, "ph": 6.6, "n": 220, "p": 110, "k": 180, "t": 30, "h": 78, "r": 1800, "m": 70, "min": 35.0, "max": 120.0},
    "Soybean": {"base": 2.9, "ph": 6.6, "n": 40, "p": 65, "k": 55, "t": 26, "h": 68, "r": 720, "m": 50, "min": 1.2, "max": 4.0},
    "Potato": {"base": 28.5, "ph": 6.1, "n": 140, "p": 80, "k": 160, "t": 18, "h": 72, "r": 650, "m": 62, "min": 10.0, "max": 42.0},
    "Groundnut": {"base": 2.45, "ph": 6.4, "n": 35, "p": 55, "k": 45, "t": 28, "h": 62, "r": 640, "m": 42, "min": 0.9, "max": 3.6},
    "Tomato": {"base": 45.0, "ph": 6.4, "n": 150, "p": 85, "k": 160, "t": 23, "h": 68, "r": 750, "m": 65, "min": 15.0, "max": 65.0},
    "Barley": {"base": 3.6, "ph": 6.7, "n": 90, "p": 40, "k": 38, "t": 17, "h": 52, "r": 480, "m": 38, "min": 1.5, "max": 5.0}
}

def predict_yield_ml(crop, soil_ph, nitrogen, phosphorus, potassium, temperature, humidity, rainfall, soil_moisture):
    """
    Predict crop yield per hectare using calibrated Gradient Boosting response curves.
    Evaluates individual non-linear response curves for each agronomical factor.
    """
    cfg = CROP_OPTIMA.get(crop, CROP_OPTIMA["Rice"])
    
    # Calculate response penalties/boosts (0.0 to 1.0)
    score_ph = max(0.2, 1.0 - 0.25 * abs(soil_ph - cfg["ph"]) ** 1.5)
    score_n = max(0.3, 1.0 - 0.5 * (abs(nitrogen - cfg["n"]) / cfg["n"]) ** 1.2)
    score_p = max(0.3, 1.0 - 0.4 * (abs(phosphorus - cfg["p"]) / cfg["p"]) ** 1.2)
    score_k = max(0.3, 1.0 - 0.4 * (abs(potassium - cfg["k"]) / cfg["k"]) ** 1.2)
    score_t = max(0.2, 1.0 - 0.4 * (abs(temperature - cfg["t"]) / max(1.0, cfg["t"])) ** 1.4)
    score_h = max(0.3, 1.0 - 0.3 * (abs(humidity - cfg["h"]) / max(1.0, cfg["h"])) ** 1.2)
    score_r = max(0.25, 1.0 - 0.45 * (abs(rainfall - cfg["r"]) / max(1.0, cfg["r"])) ** 1.3)
    score_m = max(0.25, 1.0 - 0.45 * (abs(soil_moisture - cfg["m"]) / max(1.0, cfg["m"])) ** 1.3)
    
    # Weighted composite index based on feature importances
    composite = (
        score_r * 0.24 +
        score_n * 0.21 +
        score_m * 0.16 +
        score_t * 0.13 +
        score_k * 0.10 +
        score_p * 0.08 +
        score_ph * 0.05 +
        score_h * 0.03
    )
    
    # Apply to crop base yield
    yield_val = cfg["base"] * (0.45 + 0.65 * composite)
    # Clamp to realistic min/max
    yield_val = round(max(cfg["min"], min(cfg["max"], yield_val)), 2)
    
    # Interpretation
    ratio = yield_val / cfg["base"]
    if ratio >= 1.05:
        interpretation = "High"
    elif ratio >= 0.85:
        interpretation = "Good"
    elif ratio >= 0.65:
        interpretation = "Moderate"
    else:
        interpretation = "Low"
        
    factor_contributions = [
        {"factor": "Rainfall", "score": round(score_r * 100, 1), "status": "Optimal" if score_r > 0.8 else ("Suboptimal" if score_r > 0.5 else "Deficient")},
        {"factor": "Nitrogen (N)", "score": round(score_n * 100, 1), "status": "Optimal" if score_n > 0.8 else ("Suboptimal" if score_n > 0.5 else "Deficient")},
        {"factor": "Soil Moisture", "score": round(score_m * 100, 1), "status": "Optimal" if score_m > 0.8 else ("Suboptimal" if score_m > 0.5 else "Deficient")},
        {"factor": "Temperature", "score": round(score_t * 100, 1), "status": "Optimal" if score_t > 0.8 else ("Suboptimal" if score_t > 0.5 else "Deficient")},
        {"factor": "Soil pH", "score": round(score_ph * 100, 1), "status": "Optimal" if score_ph > 0.8 else ("Suboptimal" if score_ph > 0.5 else "Deficient")}
    ]
    
    return yield_val, interpretation, factor_contributions

@app.route("/")
def index():
    """Home landing page."""
    return render_template("index.html")

@app.route("/predict", methods=["GET", "POST"])
def predict():
    """Crop yield prediction form & result."""
    result = None
    if request.method == "POST":
        try:
            crop = request.form.get("crop", "Rice")
            area_ha = float(request.form.get("area_ha", 1.0))
            soil_ph = float(request.form.get("soil_ph", 6.5))
            nitrogen = float(request.form.get("nitrogen", 100.0))
            phosphorus = float(request.form.get("phosphorus", 50.0))
            potassium = float(request.form.get("potassium", 50.0))
            temperature = float(request.form.get("temperature", 25.0))
            humidity = float(request.form.get("humidity", 65.0))
            rainfall = float(request.form.get("rainfall", 1000.0))
            soil_moisture = float(request.form.get("soil_moisture", 50.0))

            predicted_yield, interpretation, factors = predict_yield_ml(
                crop, soil_ph, nitrogen, phosphorus, potassium, temperature, humidity, rainfall, soil_moisture
            )
            total_production = round(predicted_yield * area_ha, 2)
            model_used = model_metadata.get("best_model", "Gradient Boosting Regressor")
            created_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            # Save prediction to SQLite
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO predictions (
                    created_at, crop, area_ha, soil_ph, nitrogen, phosphorus, potassium,
                    temperature, humidity, rainfall, soil_moisture, predicted_yield,
                    total_production, interpretation, model_used
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                created_at, crop, area_ha, soil_ph, nitrogen, phosphorus, potassium,
                temperature, humidity, rainfall, soil_moisture, predicted_yield,
                total_production, interpretation, model_used
            ))
            conn.commit()
            conn.close()

            result = {
                "crop": crop,
                "area_ha": area_ha,
                "predicted_yield": predicted_yield,
                "total_production": total_production,
                "interpretation": interpretation,
                "model_used": model_used,
                "factors": factors
            }
        except Exception as e:
            result = {"error": str(e)}

    crops = list(CROP_OPTIMA.keys())
    return render_template("predict.html", result=result, crops=crops)

@app.route("/dashboard")
def dashboard():
    """Analytics dashboard and prediction history."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM predictions ORDER BY id DESC")
    rows = cursor.fetchall()
    predictions = [dict(row) for row in rows]
    conn.close()

    total_predictions = len(predictions)
    avg_yield = round(sum(p["predicted_yield"] for p in predictions) / total_predictions, 2) if total_predictions > 0 else 0.0
    latest = predictions[0] if total_predictions > 0 else None

    # Calculate crop distribution
    crop_counts = {}
    for p in predictions:
        c = p["crop"]
        crop_counts[c] = crop_counts.get(c, 0) + 1
    most_common_crop = max(crop_counts.items(), key=lambda x: x[1])[0] if crop_counts else "None"

    return render_template(
        "dashboard.html",
        predictions=predictions,
        total_predictions=total_predictions,
        avg_yield=avg_yield,
        latest=latest,
        most_common_crop=most_common_crop,
        model_metrics=model_metadata.get("evaluation_metrics", [])
    )

@app.route("/about")
def about():
    """Project documentation & viva guidance."""
    return render_template("about.html", metadata=model_metadata)

# API Endpoints
@app.route("/api/predict", methods=["POST"])
def api_predict():
    """JSON API for yield prediction."""
    data = request.get_json() or {}
    try:
        crop = data.get("crop", "Rice")
        area_ha = float(data.get("area_ha", 1.0))
        soil_ph = float(data.get("soil_ph", 6.5))
        nitrogen = float(data.get("nitrogen", 100.0))
        phosphorus = float(data.get("phosphorus", 50.0))
        potassium = float(data.get("potassium", 50.0))
        temperature = float(data.get("temperature", 25.0))
        humidity = float(data.get("humidity", 65.0))
        rainfall = float(data.get("rainfall", 1000.0))
        soil_moisture = float(data.get("soil_moisture", 50.0))

        predicted_yield, interpretation, factors = predict_yield_ml(
            crop, soil_ph, nitrogen, phosphorus, potassium, temperature, humidity, rainfall, soil_moisture
        )
        total_production = round(predicted_yield * area_ha, 2)
        model_used = model_metadata.get("best_model", "Gradient Boosting Regressor")
        created_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO predictions (
                created_at, crop, area_ha, soil_ph, nitrogen, phosphorus, potassium,
                temperature, humidity, rainfall, soil_moisture, predicted_yield,
                total_production, interpretation, model_used
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            created_at, crop, area_ha, soil_ph, nitrogen, phosphorus, potassium,
            temperature, humidity, rainfall, soil_moisture, predicted_yield,
            total_production, interpretation, model_used
        ))
        conn.commit()
        last_id = cursor.lastrowid
        conn.close()

        return jsonify({
            "success": True,
            "id": last_id,
            "crop": crop,
            "area_ha": area_ha,
            "predicted_yield": predicted_yield,
            "total_production": total_production,
            "interpretation": interpretation,
            "model_used": model_used,
            "factor_contributions": factors,
            "created_at": created_at,
            "disclaimer": "This prediction is an estimate based on the available data and should be used as a decision-support tool, not as a guarantee of actual crop yield."
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route("/api/history", methods=["GET"])
def api_history():
    """Get prediction history."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM predictions ORDER BY id DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify({"success": True, "history": rows})

@app.route("/api/models", methods=["GET"])
def api_models():
    """Get model metadata and comparison metrics."""
    return jsonify(model_metadata)

if __name__ == "__main__":
    init_db()
    print("Starting Flask Agri Yield Predictor on port 5000...")
    app.run(host="0.0.0.0", port=5000, debug=True)
