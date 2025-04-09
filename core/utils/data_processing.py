import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

def load_data(filepath):
    """تحميل البيانات مع معالجة متقدمة"""
    df = pd.read_csv(filepath)
    
    # التحقق من البيانات المفقودة
    if df.isnull().sum().any():
        print("تحذير: يوجد بيانات مفقودة سيتم معالجتها")
        df = df.dropna()
    
    # حساب معدلات الأداء
    df['Goals_Per_Match'] = df['Goals'] / df['Matches']
    df['Assists_Per_Match'] = df['Assists'] / df['Matches']
    df['Contribution_Per_Match'] = (df['Goals'] + df['Assists']) / df['Matches']
    
    # إضافة ميزات جديدة
    df['Performance_Ratio'] = df['Seasons Ratings'] / df['Matches']
    df['Efficiency'] = (df['Goals'] * 0.7 + df['Assists'] * 0.3) / df['Matches']
    
    return df

def prepare_data(df):
    """تحضير البيانات للتدريب"""
    features = ['Goals', 'Assists', 'Seasons Ratings', 'Matches', 
                'Goals_Per_Match', 'Assists_Per_Match', 'Contribution_Per_Match']
    X = df[features]
    y = df['Seasons Ratings'] * 1.1  # افتراض تحسن بنسبة 10%
    
    return X, y
    
    
    # تقسيم البيانات
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )
    
    # تطبيع البيانات
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    return X_train_scaled, X_test_scaled, y_train, y_test, scaler, features