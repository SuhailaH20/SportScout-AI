import sys
import os
import time
from pathlib import Path
import joblib
import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (mean_absolute_error, 
                           mean_squared_error, 
                           r2_score,
                           explained_variance_score)

# إضافة المسار إلى نظام Python
sys.path.append(str(Path(__file__).parent.parent))

from utils.data_processing import load_data, prepare_data

def evaluate_model(model, X_test, y_test):
    """تقييم شامل للنموذج باستخدام مقاييس متعددة"""
    start_time = time.time()
    predictions = model.predict(X_test)
    inference_time = time.time() - start_time
    
    metrics = {
        'MAE': mean_absolute_error(y_test, predictions),
        'MSE': mean_squared_error(y_test, predictions),
        'RMSE': np.sqrt(mean_squared_error(y_test, predictions)),
        'R2': r2_score(y_test, predictions),
        'Explained Variance': explained_variance_score(y_test, predictions),
        'Accuracy ±0.5': np.mean(np.abs(predictions - y_test) <= 0.5),
        'Inference Time (sec)': inference_time / len(X_test)
    }
    
    return metrics, predictions

def train_and_save_model():
    # تحميل البيانات
    data_path = os.path.join(Path(__file__).parent.parent, 'data', 'Latest Football  Players 2024 Data.csv')
    df = load_data(data_path)
    X, y = prepare_data(df)
    
    
    # تقسيم البيانات
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # بناء النموذج
    model = Pipeline([
        ('scaler', StandardScaler()),
        ('xgb', XGBRegressor(
            n_estimators=500,
            learning_rate=0.05,
            max_depth=6,
            subsample=0.9,
            colsample_bytree=0.8,
            random_state=42,
            n_jobs=-1  # استخدام جميع الأنوية
        ))
    ])
    
    # التدريب مع قياس الوقت
    print("Training the model...")
    start_train = time.time()
    model.fit(X_train, y_train)
    train_time = time.time() - start_train
    
    # التقييم الشامل
    metrics, predictions = evaluate_model(model, X_test, y_test)
    
    # تقييم عبر التحقق المتقاطع
    cv_scores = cross_val_score(model, X, y, cv=5, scoring='r2')
    
    # عرض النتائج
    print("\n=== Model Training Summary ===")
    print(f"Training time: {train_time:.2f} seconds")
    print(f"Training samples: {len(X_train)}")
    print(f"Test samples: {len(X_test)}")
    
    print("\n=== Model Evaluation Metrics ===")
    for name, value in metrics.items():
        if name == 'Accuracy ±0.5':
            print(f"{name}: {value:.2%}")
        elif isinstance(value, float):
            print(f"{name}: {value:.4f}")
        else:
            print(f"{name}: {value}")
    
    print("\n=== Cross-Validation Scores ===")
    print(f"Mean R2: {np.mean(cv_scores):.4f}")
    print(f"Std R2: {np.std(cv_scores):.4f}")
    
    # حفظ النموذج مع إضافة الطابع الزمني
    model_dir = os.path.join(Path(__file__).parent, 'models')
    os.makedirs(model_dir, exist_ok=True)
    
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    model_path = os.path.join(model_dir, f'player_rating_model_{timestamp}.pkl')
    
    joblib.dump({
    'model': model,
    'scaler': model.named_steps['scaler'],
    'features': list(X.columns)
}, model_path)

    print(f"\nModel saved to: {model_path}")
    
    # حفظ النتائج في ملف
    results_path = os.path.join(model_dir, f'training_results_{timestamp}.txt')
    with open(results_path, 'w') as f:
        f.write("=== Model Training Summary ===\n")
        f.write(f"Training time: {train_time:.2f} seconds\n")
        f.write(f"Training samples: {len(X_train)}\n")
        f.write(f"Test samples: {len(X_test)}\n\n")
        
        f.write("=== Evaluation Metrics ===\n")
        for name, value in metrics.items():
            f.write(f"{name}: {value}\n")
        
        f.write("\n=== Cross-Validation ===\n")
        f.write(f"Mean R2: {np.mean(cv_scores):.4f}\n")
        f.write(f"Std R2: {np.std(cv_scores):.4f}\n")

if __name__ == "__main__":
    train_and_save_model()