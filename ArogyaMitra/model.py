import pandas as pd
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from scipy.sparse import hstack
import numpy as np

data = pd.read_csv("dataset.csv")

X_text = data["symptoms"]
X_duration = data["duration"].values.reshape(-1, 1)
y = data["severity"]

vectorizer = TfidfVectorizer(ngram_range=(1, 2))
X_text_vec = vectorizer.fit_transform(X_text)

X_final = hstack([X_text_vec, X_duration])

model = LogisticRegression(
    solver="lbfgs",
    max_iter=1000,
    multi_class="auto"
)

model.fit(X_final, y)

pickle.dump(model, open("severity_model.pkl", "wb"))
pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))

print("✅ AI model trained successfully")
