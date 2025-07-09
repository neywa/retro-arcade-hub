# retro-arcade-hub/apps/game-tetris/app.py

from flask import Flask, render_template, send_from_directory, jsonify
import os

# --- FIX START ---
# Configure Flask:
# template_folder='src' tells Flask to look for HTML templates (like index.html) inside the 'src' directory.
# static_folder='src' tells Flask where to find static assets (CSS, JS, images).
# static_url_path='/src' tells Flask to serve these static files under the /src/ URL prefix.
# So, style.css will be accessible at /src/style.css, game.js at /src/game.js etc.
app = Flask(__name__,
            static_folder='src',
            template_folder='src',
            static_url_path='/src') # This is the key addition
# --- FIX END ---

# Define the port the application will listen on
# OpenShift/Kubernetes typically uses 8080 by default for Python applications
PORT = int(os.environ.get("PORT", 8080))

@app.route('/')
def index():
    """Serves the main Tetris game HTML page."""
    return render_template('index.html')

@app.route('/healthz')
def healthz():
    """Health check endpoint for Kubernetes/OpenShift."""
    return jsonify({"status": "ok"}), 200

# You can add more API endpoints here later for high scores, etc.
# For example:
# @app.route('/api/scores', methods=['GET'])
# def get_scores():
#     # Placeholder for fetching scores from a database
#     return jsonify({"scores": []})

# @app.route('/api/scores', methods=['POST'])
# def submit_score():
#     # Placeholder for submitting scores to a database
#     data = request.json
#     print(f"Received score: {data}")
#     return jsonify({"message": "Score received"}), 201

if __name__ == '__main__':
    # Run the Flask application
    # host='0.0.0.0' makes the server accessible from any IP address,
    # which is necessary when running inside a container.
    app.run(host='0.0.0.0', port=PORT)

