# SportScout AI ⚽🤖

A data-driven platform for comprehensive football player evaluation, talent discovery, and performance improvement using AI analytics.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Data Sources](#data-sources)
- [Installation](#installation)
- [Usage](#usage)
- [Model Training](#model-training)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Challenges & Future Work](#challenges--future-work)
- [Contributors](#contributors)

## Features
- **Comprehensive Skill Analysis**: Evaluates mental, technical, tactical, and rule-based skills.
- **AI-Powered Predictions**: XGBoost model forecasts player ratings and improvement potential.
- **Professional Profiles**: Players showcase achievements and performance metrics.
- **Scout/Coach Dashboard**: Data-driven reports for talent identification.
- **Personalized Recommendations**: Tailored training plans based on weaknesses.

## Technologies Used
| Component          | Technologies                                                                 |
|--------------------|------------------------------------------------------------------------------|
| Backend            | Express.js, Flask                                                            |
| Database           | MongoDB                                                                      |
| Frontend           | EJS Templating Engine                                                        |
| Machine Learning   | XGBoost, Scikit-learn                                                        |
| Data Processing    | Pandas, NumPy                                                                |
| DevOps             | LiveReload, Cross-Origin Resource Sharing (CORS)                             |

## Data Sources
- **Primary Dataset**: 2024 Football Player Statistics from Kaggle ([Dataset](https://www.kaggle.com/datasets/abdulmalik1518/football-players-datasets-2015-2024))
- Features include: Goals, Assists, Matches Played, Seasonal Ratings, Club Performance.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/SuhailaH20/SportScout-AI.git
   ```
2. Install dependencies:
   ```bash
   npm install express ejs mongoose express-session
   pip install flask flask-cors xgboost scikit-learn pandas numpy joblib
   ```
3. Configure MongoDB:
   - Replace the connection string in `app.js` with your MongoDB Atlas credentials.

## Usage
1. **Start Backend Services**:
   ```bash
   npm run watch  # Starts Express server on port 4001
   python app.py  # Starts Flask API on port 5001
   ```
2. Access the web interface at `http://localhost:4001`
3. Explore pages:
   - Player Profile Dashboard
   - Skill Assessment Quiz
   - Scout Analytics Portal

## Model Training
To retrain the XGBoost prediction model:
```bash
python train_model.py
```
- **Input**: `data/Latest Football Players 2024 Data.csv`
- **Output**: 
  - Trained model saved to `models/player_rating_model_<timestamp>.pkl`
  - Performance metrics stored in `training_results_<timestamp>.txt`

## API Documentation
**Endpoint**: `POST /predict`

**Sample Request**:
```json
{
  "goals": 15,
  "assists": 9,
  "rating": 7.8,
  "matches": 32
}
```

**Sample Response**:
```json
{
  "current_rating": 7.8,
  "predicted_rating": 8.1,
  "improvement": 0.3,
  "recommendations": ["تحتاج إلى تحسين معدل التسديد"],
  "strengths": ["رؤية ملعبية وتمريرات حاسمة ممتازة"]
}
```

## Project Structure
| File           | Purpose                                                                 |
|----------------|-------------------------------------------------------------------------|
| `app.js`       | Express server with MongoDB connection and EJS rendering               |
| `app.py`       | Flask API for machine learning predictions                             |
| `predictor.py` | XGBoost model loader and prediction logic with Arabic localization     |
| `train_model.py`| Model training pipeline with cross-validation                         |
| `views/`       | EJS templates for web interface                                        |

## Challenges & Future Work
**Current Challenges**:
1. Standardizing evaluation metrics across positions
2. Scaling for 100,000+ player profiles
3. Subjective skill quantification

**Planned Improvements**:
1. Position-specific assessment modules
2. Video analysis integration
3. Multi-sport support

## Contributors
- Rasha Alyazydi (Team Lead)([profile](https://github.com/Rasho22rr))
- Suhaila Hawsawi (Full-Stack Developer)([profile](https://github.com/SuhailaH20))
- Lamar Talal (Full-Stack Developer) ([profile](https://github.com/Lamartal8))
