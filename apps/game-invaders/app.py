# apps/game-invaders/app.py

from flask import Flask, render_template, jsonify
import os

# Configure Flask to serve static files from the 'src' directory
app = Flask(__name__,
            static_folder='src',
            template_folder='src',
            static_url_path='/src')

# Define the port, defaulting to 8080 for cloud environments
PORT = int(os.environ.get("PORT", 8080))

@app.route('/')
def index():
    """Serves the main Space Invaders game page."""
    return render_template('index.html')

@app.route('/healthz')
def healthz():
    """Provides a health check endpoint for Kubernetes/OpenShift."""
    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    # Run the app, making it accessible on the network
    app.run(host='0.0.0.0', port=PORT)
