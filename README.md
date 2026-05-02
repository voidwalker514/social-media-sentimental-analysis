# 📊 Sentiment-Pulse: Social Media Sentiment Analyzer

🚀 **Sentiment-Pulse** is a professional, end-to-end sentiment analysis platform designed to classify social media text into positive, negative, or neutral categories. Built with a high-performance **FastAPI** backend and a robust **Scikit-learn** machine learning pipeline, it offers real-time inference through a sleek, responsive dashboard.

---

## 🌟 Key Features

- **Real-time Sentiment Prediction:** Instantly classify text using a trained Logistic Regression model.
- **Full-Stack Architecture:** Decoupled backend (FastAPI) and frontend (Vanilla JS/CSS) for scalability.
- **Machine Learning Pipeline:** Includes automated data preprocessing, TF-IDF vectorization, and model persistence.
- **User Authentication:** Secure login system for personalized dashboard access.
- **Responsive Design:** Modern UI/UX optimized for all devices.
- **API Documentation:** Interactive Swagger UI and Redoc documentation provided by FastAPI.

---

## 🛠️ Tech Stack

- **Backend:** [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/)
- **Machine Learning:** [Scikit-learn](https://scikit-learn.org/), [Pandas](https://pandas.pydata.org/)
- **Frontend:** HTML5, Modern CSS (Vanilla), JavaScript (ES6+)
- **Security:** [Bcrypt](https://pypi.org/project/bcrypt/) for password hashing
- **Environment Management:** Pydantic-settings, Dotenv

---

## 📂 Project Structure

```text
├── backend/
│   ├── artifacts/      # Persisted ML models (.pkl)
│   ├── data/           # User records and sample datasets
│   ├── models/         # Pydantic schemas and data models
│   ├── routers/        # API route handlers (auth, sentiment)
│   ├── services/       # Business logic and ML inference
│   ├── api.py          # Application entry point
│   ├── config.py       # Centralized settings
│   └── train_model.py  # Model training script
├── frontend/           # Responsive web dashboard
├── requirements.txt    # Python dependencies
└── README.md           # Project documentation
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/sentiment-pulse.git
cd sentiment-pulse
```

### 2. Set Up Virtual Environment
```bash
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Train the Model
```bash
python -m backend.train_model
```

### 5. Launch the API Server
```bash
python -m uvicorn backend.api:app --reload
```
The API will be available at `http://localhost:8000`. You can access the interactive docs at `/docs`.

### 6. Run the Frontend
Simply open `frontend/login.html` in your browser or serve it using a local live server.

---

## 📊 Model Performance
The model is trained using **TF-IDF Vectorization** and **Logistic Regression**, achieving high accuracy on standard sentiment benchmarks. The training script generates a detailed classification report upon execution.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
