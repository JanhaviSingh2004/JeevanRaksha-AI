import os
from flask import Flask, render_template, request
from transformers import pipeline
from deep_translator import GoogleTranslator
from PyPDF2 import PdfReader
import docx

# OCR imports
import pytesseract
from pdf2image import convert_from_path
from PIL import Image

# ---------------- STARTUP LOGS ----------------
print("Starting MediLingo app...")
print("Loading NLP summarization model (this may take some time)...")

# ---------------- MODEL ----------------
summarizer = pipeline(
    "summarization",
    model="sshleifer/distilbart-cnn-12-6"
)

print("Model loaded successfully ✔")

# ---------------- FLASK APP ----------------
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'

# ⚠️ WINDOWS TESSERACT PATH
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# ---------------- FILE TEXT EXTRACTION ----------------
def extract_text_from_file(filepath):

    # TXT FILE
    if filepath.endswith(".txt"):
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()

    # DOCX FILE
    elif filepath.endswith(".docx"):
        doc = docx.Document(filepath)
        return "\n".join([p.text for p in doc.paragraphs])

    # PDF FILE (TEXT + OCR)
    elif filepath.endswith(".pdf"):
        text = ""

        # 1️⃣ Try normal text extraction
        reader = PdfReader(filepath)
        for page in reader.pages:
            if page.extract_text():
                text += page.extract_text() + "\n"

        # 2️⃣ OCR fallback (for scanned PDFs)
        if not text.strip():
            print("No text found in PDF, using OCR...")
            images = convert_from_path(
                filepath,
                poppler_path=r"C:\Users\DEll\Downloads\Release-25.12.0-0\poppler-25.12.0\Library\bin"
            )

            for img in images:
                text += pytesseract.image_to_string(img)

        return text

    return ""

# ---------------- ROUTES ----------------
@app.route("/", methods=["GET", "POST"])
def index():
    summary_en = ""
    summary_hi = ""
    summary_pa = ""
    error = ""

    if request.method == "POST":

        if "file" not in request.files:
            error = "No file uploaded"
            return render_template("index.html", error=error)

        file = request.files["file"]

        if file.filename == "":
            error = "No file selected"
            return render_template("index.html", error=error)

        # Save file
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)

        # Extract text
        report = extract_text_from_file(filepath)

        if not report.strip():
            error = "Could not read text from file"
            return render_template("index.html", error=error)

        # Truncate long reports
        report = report[:2000]

        # Summarize
        summary_result = summarizer(
            report,
            max_length=80,
            min_length=20,
            do_sample=False
        )

        summary_en = summary_result[0]["summary_text"]

        # ✅ TRANSLATION (FIXED)
        summary_hi = GoogleTranslator(source="auto", target="hi").translate(summary_en)
        summary_pa = GoogleTranslator(source="auto", target="pa").translate(summary_en)

        return render_template(
            "result.html",
            summary_en=summary_en,
            summary_hi=summary_hi,
            summary_pa=summary_pa
        )

    return render_template("index.html", error=error)

# ---------------- RUN SERVER ----------------
if __name__ == "__main__":
    print("Starting Flask server on port 5002...")
    app.run(
        debug=True,
        use_reloader=False,  # IMPORTANT for ML apps
        port=5002
    )
