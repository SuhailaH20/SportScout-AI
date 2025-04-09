import sys
import os
import time
from pathlib import Path
import joblib
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple

# إعداد المسارات
BASE_DIR = Path(__file__).parent
sys.path.append(str(BASE_DIR))

class PlayerPredictor:
    def __init__(self, model_path: str = None):
        """تهيئة النموذج مع تحميل المكونات المطلوبة"""
        self.model_path = model_path or r'trained_model.pkl'
        self.model, self.scaler, self.features = self._load_components()
        self.thresholds = {
            'goals': 0.2,
            'assists': 0.1,
            'rating': 7.0
        }
    
    def _load_components(self) -> Tuple:
        """تحميل النموذج والمكونات المساعدة"""
        try:
            loaded = joblib.load(self.model_path)
            if isinstance(loaded, dict):
                return loaded['model'], loaded['scaler'], loaded['features']
            else:
                return loaded, loaded.named_steps['scaler'], list(loaded.feature_names_in_)
        except Exception as e:
            raise ValueError(f"خطأ في تحميل النموذج: {str(e)}")
    
    def predict(self, player_data: Dict) -> Dict:
        """تنبؤ شامل مع معالجة مسبقة للبيانات"""
        try:
            # التحقق من صحة المدخلات
            self._validate_input(player_data)
            
            # تحضير البيانات
            input_df = self._preprocess_data(player_data)
            
            # التنبؤ
            start_time = time.time()
            future_rating = self.model.predict(input_df[self.features])[0]
            inference_time = time.time() - start_time
            
            # تحليل النتائج
            analysis = self._analyze_results(player_data, float(future_rating))
            
            return {
                'current_rating': float(player_data['Seasons Ratings']),
                'predicted_rating': float(round(future_rating, 2)),
                'improvement': float(round(future_rating - player_data['Seasons Ratings'], 2)),
                'inference_time': float(round(inference_time, 4)),
                'recommendations': analysis['recommendations'],
                'strengths': analysis['strengths'],
                'performance_analysis': analysis['performance_analysis']
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def _validate_input(self, data: Dict):
        """التحقق من صحة بيانات المدخلات"""
        required_fields = ['Goals', 'Assists', 'Seasons Ratings', 'Matches']
        for field in required_fields:
            if field not in data:
                raise ValueError(f"المجال المطلوب '{field}' غير موجود")
            if not isinstance(data[field], (int, float)):
                raise ValueError(f"المجال '{field}' يجب أن يكون رقمًا")
    
    def _preprocess_data(self, data: Dict) -> pd.DataFrame:
        """معالجة مسبقة لبيانات اللاعب"""
        input_df = pd.DataFrame([data])
        
        # تجنب القسمة على الصفر
        if data['Matches'] == 0:
            raise ValueError("عدد المباريات يجب أن يكون أكبر من صفر")
        
        # حساب الميزات
        input_df['Goals_Per_Match'] = input_df['Goals'] / input_df['Matches']
        input_df['Assists_Per_Match'] = input_df['Assists'] / input_df['Matches']
        input_df['Contribution_Per_Match'] = (input_df['Goals'] + input_df['Assists']) / input_df['Matches']
        input_df['Performance_Ratio'] = input_df['Seasons Ratings'] / input_df['Matches']
        input_df['Efficiency'] = (input_df['Goals'] * 0.7 + input_df['Assists'] * 0.3) / input_df['Matches']
        
        # تطبيع البيانات
        input_df[self.features] = self.scaler.transform(input_df[self.features])
        
        return input_df
    
    def _analyze_results(self, stats: Dict, future_rating: float) -> Dict:
        """تحليل شامل للنتائج"""
        gpm = stats['Goals'] / stats['Matches']
        apm = stats['Assists'] / stats['Matches']
        current_rating = stats['Seasons Ratings']
        
        # التوصيات
        recommendations = []
        if gpm < self.thresholds['goals']:
            recommendations.append("تحتاج إلى تحسين معدل التسديد (تدريب إضافي على التهديف)")
        if apm < self.thresholds['assists']:
            recommendations.append("تحتاج إلى تطوير التمريرات الحاسمة والرؤية الملعبية")
        if current_rating < self.thresholds['rating']:
            recommendations.append("تحتاج إلى تحسين الأداء العام (اللياقة، التركيز، المهارات الأساسية)")
        
        # نقاط القوة
        strengths = []
        if gpm > self.thresholds['goals'] * 1.5:
            strengths.append("معدل تسديد ممتاز")
        if apm > self.thresholds['assists'] * 1.5:
            strengths.append("رؤية ملعبية وتمريرات حاسمة ممتازة")
        if current_rating > self.thresholds['rating'] + 0.5:
            strengths.append("أداء عام ممتاز")
        
        # تحليل الأداء
        performance_analysis = []
        improvement = future_rating - current_rating
        if improvement > 0.5:
            performance_analysis.append("إمكانية تطوير عالية جداً")
        elif improvement > 0.2:
            performance_analysis.append("إمكانية تطوير جيدة")
        else:
            performance_analysis.append("مجال للتحسين")
        
        return {
            'recommendations': recommendations if recommendations else ["أداؤك ممتاز! استمر في هذا المستوى"],
            'strengths': strengths if strengths else ["أداء متوازن في جميع المجالات"],
            'performance_analysis': performance_analysis
        }

def print_report(player_data: Dict, result: Dict):
    """طباعة تقرير مفصل"""
    if 'error' in result:
        print(f"خطأ: {result['error']}")
        return
    
    print("\n=== تقرير أداء اللاعب ===")
    print(f"التقييم الحالي: {result['current_rating']}")
    print(f"التقييم المتوقع: {result['predicted_rating']}")
    print(f"مقدار التحسن: {result['improvement']}")
    print(f"زمن التنبؤ: {result['inference_time']} ثانية")
    
    print("\n=== تحليل الأداء ===")
    for item in result['performance_analysis']:
        print(f"- {item}")
    
    print("\n=== نقاط القوة ===")
    for strength in result['strengths']:
        print(f"- {strength}")
    
    print("\n=== التوصيات ===")
    for rec in result['recommendations']:
        print(f"- {rec}")

if __name__ == "__main__":
    # مثال بيانات لاعب
    test_player = {
        'Goals': 12,
        'Assists': 8,
        'Seasons Ratings': 7.5,
        'Matches': 30
    }
    
    try:
        # التنبؤ
        predictor = PlayerPredictor()
        result = predictor.predict(test_player)
        
        # عرض النتائج
        print_report(test_player, result)
    except Exception as e:
        print(f"حدث خطأ: {str(e)}")