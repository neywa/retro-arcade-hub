# retro-arcade-hub/apps/game-tetris/Dockerfile

# Use the official Red Hat Universal Base Image (UBI) for Python 3.9
# This provides a secure and supported base for your Python application.
FROM registry.access.redhat.com/ubi9/python-39:latest

# Set the working directory inside the container
WORKDIR /app

# --- Permissions Fix (similar to frontend) ---
# Ensure the /app directory is owned by a non-root user (e.g., user ID 1001)
# and switch to that user before installing dependencies.
USER root
RUN chown -R 1001:0 /app && chmod -R ug+rwx /app
USER 1001
# --- End Permissions Fix ---

# Copy the requirements file into the working directory
COPY requirements.txt .

# Install Python dependencies
# The '--no-cache-dir' flag is good practice to keep image size down
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code (app.py and the src directory)
COPY . .

# Expose the port the Flask application listens on
# (defined as PORT in app.py, defaults to 8080)
EXPOSE 8080

# Define the command to run your Flask application when the container starts
# The 'python -m flask run' command is a standard way to run Flask apps.
# '--host=0.0.0.0' makes it accessible from outside the container.
# '--port=8080' explicitly sets the port.
CMD ["python", "app.py"]
