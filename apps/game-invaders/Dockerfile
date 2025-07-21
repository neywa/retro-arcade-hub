# Stage 1: Use the official Red Hat Universal Base Image for Python 3.9
# This provides a secure and supported base for running the application.
FROM registry.access.redhat.com/ubi8/python-39:latest

# --- Metadata Labels ---
# Add labels to the image to provide metadata about the application.
LABEL name="retro-arcade-space-invaders" \
      vendor="Retro Arcade Hub" \
      version="1.0" \
      release="1" \
      summary="Space Invaders game service for the Retro Arcade Hub" \
      description="A classic Space Invaders game implemented in Python/Flask and JavaScript."

# --- Environment Variables ---
# Set the working directory for the application.
ENV APP_ROOT=/opt/app-root
WORKDIR ${APP_ROOT}

# --- User and Permissions ---
# Create a non-root user to run the application for better security.
# The user 'default' with UID 1001 is created by the base image, but we ensure permissions.
RUN chown -R 1001:0 ${APP_ROOT} && \
    chmod -R g+w ${APP_ROOT}

# --- Application Dependencies ---
# Copy only the requirements file first to leverage Docker's layer caching.
# This layer will only be rebuilt if the dependencies change.
COPY --chown=1001:0 requirements.txt .

# Install the Python dependencies using pip.
# --no-cache-dir reduces the image size.
RUN pip install --no-cache-dir -r requirements.txt

# --- Application Code ---
# Copy the rest of the application source code into the container.
COPY --chown=1001:0 . .

# --- Port and User Configuration ---
# Expose the port the application will run on.
EXPOSE 8080

# Switch to the non-root user to run the application.
USER 1001

# --- Run Command ---
# Define the command to start the Flask application when the container launches.
# Using gunicorn is recommended for production, but flask run is fine for this context.
CMD ["python", "app.py"]

