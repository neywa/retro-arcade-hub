# Use the official Red Hat Universal Base Image (UBI) for Node.js 20
# This provides a secure and supported base for your application.
FROM registry.access.redhat.com/ubi9/nodejs-20:latest

# Set the working directory inside the container
WORKDIR /app

# --- Set up non-root user permissions ---
# This is a critical security best practice for containers.
# It ensures the application runs with the least privilege necessary.

# Switch to the root user temporarily to set permissions
USER root
# Ensure the /app directory is owned by the default non-root user (1001) provided by the UBI image
RUN chown -R 1001:0 /app && chmod -R ug+rwx /app
# Switch back to the non-root user for all subsequent operations
USER 1001

# --- Install Dependencies ---
# Copy package.json first to leverage Docker's layer caching.
# This step will only be re-run if dependencies change.
COPY package*.json ./

# Install application dependencies.
RUN npm install

# --- Copy Application Code ---
# Copy the server script and the entire 'src' directory into the container.
COPY server.js .
COPY src/ ./src/

# --- Expose Port and Run Application ---
# Expose the port the application listens on.
EXPOSE 8080

# Define the command to run the application when the container starts.
CMD [ "node", "server.js" ]

