from flask import Flask, render_template, request
import pandas as pd
from deep_translator import GoogleTranslator

app = Flask(__name__)

# Load dataset
df = pd.read_csv("village_health_dataset.csv")

# Normalize text
df["disease"] = df["disease"].astype(str).str.strip()
df["symptoms"] = df["symptoms"].astype(str).str.lower()
df["medicine"] = df["medicine"].astype(str)
df["care"] = df["care"].astype(str)

# Disease detection using heuristic symptom matching
def detect_disease(user_symptoms):
    user_symptoms = user_symptoms.lower()

    best_match = None
    best_score = 0

    for _, row in df.iterrows():
        score = 0
        symptom_text = row["symptoms"]

        # Strong match
        if symptom_text in user_symptoms:
            score += 3

        # Partial match
        for word in symptom_text.split():
            if word in user_symptoms:
                score += 1

        if score > best_score:
            best_score = score
            best_match = row

    if best_score == 0:
        return None

    return best_match

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    name = request.form.get("name", "User")
    symptoms = request.form.get("symptoms", "")
    lang = request.form.get("language", "en")
    duration = int(request.form.get("duration", 0))  # ✅ duration in days

    row = detect_disease(symptoms)

    # Default values
    disease = "General Illness"
    medicines = ["Paracetamol"]
    care = ["Rest", "Drink clean water"]
    warning = False

    if row is not None:
        disease = row["disease"]

        if row["medicine"].lower() == "none" or row["medicine"].strip() == "":
            medicines = ["No specific medicine. Consult a doctor."]
        else:
            medicines = row["medicine"].split("|")

        if row["care"].strip() == "":
            care = ["Rest", "Drink clean water"]
        else:
            care = row["care"].split("|")

        warning = str(row["warning"]).lower() == "true"

    # 🔴 SAFETY OVERRIDE RULE (VERY IMPORTANT)
    if duration > 4:
        medicines = ["No self-medication"]
        care = ["Consult a doctor immediately"]
        warning = True

    result_en = f"Possible problem: {disease}"

    if lang == "hi":
        result = GoogleTranslator(source="en", target="hi").translate(result_en)
    else:
        result = result_en

    return render_template(
        "result.html",
        name=name,
        disease=disease,
        medicines=medicines,
        care=care,
        warning=warning,
        result=result,
        lang=lang,
        duration=duration
    )

if __name__ == "__main__":
    app.run(port=5001, debug=False, use_reloader=False)
