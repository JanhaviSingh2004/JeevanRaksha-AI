import os
from flask import Flask, render_template, request
from transformers import pipeline
from googletrans import Translator
from PyPDF2 import PdfReader
import docx

# ---------------- STARTUP LOGS ----------------
print("Starting MediLingo app...")
print("Loading NLP summarization model (this may take some time)...")

# ---------------- MODEL & TRANSLATOR ----------------
summarizer = pipeline(
    "summarization",
    model="sshleifer/distilbart-cnn-12-6"
)

print("Model loaded successfully ✔")

translator = Translator()

# ---------------- FLASK APP ----------------
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'

# ---------------- FILE TEXT EXTRACTION ----------------
def extract_text_from_file(filepath):
    if filepath.endswith(".txt"):
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()

    elif filepath.endswith(".pdf"):
        text = ""
        reader = PdfReader(filepath)
        for page in reader.pages:
            if page.extract_text():
                text += page.extract_text() + "\n"
        return text

    elif filepath.endswith(".docx"):
        doc = docx.Document(filepath)
        return "\n".join([p.text for p in doc.paragraphs])

    else:
        return ""

# ---------------- ROUTES ----------------
@app.route("/", methods=["GET", "POST"])
def index():
    summary_en = ""
    summary_hi = ""
    summary_pa = ""

    if request.method == "POST":

        if "file" not in request.files:
            return "No file uploaded"

        file = request.files["file"]

        if file.filename == "":
            return "No file selected"

        # Save uploaded file
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)

        # Extract text
        report = extract_text_from_file(filepath)

        if not report.strip():
            return "Could not read text from file"

        # Truncate long reports (important for NLP model)
        report = report[:2000]

        # Summarize
        summary_result = summarizer(
            report,
            max_length=80,
            min_length=20,
            do_sample=False
        )

        summary_en = summary_result[0]["summary_text"]

        # Translate summaries
        summary_hi = translator.translate(summary_en, dest='hi').text
        summary_pa = translator.translate(summary_en, dest='pa').text

    return render_template(
        "index.html",
        summary_en=summary_en,
        summary_hi=summary_hi,
        summary_pa=summary_pa
    )

# ---------------- RUN SERVER ----------------
if __name__ == "__main__":
    print("Starting Flask server on port 5002...")
    app.run(
        debug=True,
        use_reloader=False,   # VERY IMPORTANT for ML apps
        port=5002
    )
