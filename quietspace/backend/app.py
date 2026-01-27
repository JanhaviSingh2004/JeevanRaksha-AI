from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from responder import generate_reply
import webbrowser

app = Flask(
    __name__,
    static_folder="../frontend",
    static_url_path=""
)
CORS(app)

# Serve index.html at root
@app.route("/")
def home():
    return send_from_directory(app.static_folder, "index.html")

# Serve other frontend files (chat.html, talk.html, css, js)
@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(app.static_folder, path)

# Chat API
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "Message missing"}), 400

    reply = generate_reply(data["message"])
    return jsonify({"reply": reply})

if __name__ == "__main__":
    import webbrowser
    app.run(debug=True, port=5004)

