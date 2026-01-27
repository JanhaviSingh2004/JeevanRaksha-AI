import random
import pandas as pd

mild_symptoms = [
    "mild fever", "cold", "cough", "headache",
    "body ache", "fatigue", "sore throat",
    "runny nose", "weakness", "nausea"
]

severe_symptoms = [
    "chest pain", "difficulty breathing",
    "high fever", "unconscious",
    "vomiting blood", "severe headache",
    "loss of consciousness", "seizure"
]

data = []

for _ in range(180):
    symptoms = " ".join(random.sample(mild_symptoms, 2))
    duration = random.randint(1, 4)
    data.append([symptoms, duration, 0])

for _ in range(140):
    symptoms = " ".join(random.sample(severe_symptoms, 2))
    duration = random.randint(1, 7)
    data.append([symptoms, duration, 1])

df = pd.DataFrame(data, columns=["symptoms", "duration", "severity"])
df.to_csv("dataset.csv", index=False)

print("✅ Large dataset generated:", len(df))
