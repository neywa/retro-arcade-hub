# Use the official Red Hat Universal Base Image (UBI) for Node.js 20
# This provides a secure and supported base for your application.
FROM registry.access.redhat.com/ubi9/nodejs-20:latest

# Set the working directory inside the container
WORKDIR /app

# --- FIX START ---
# Ensure the /app directory is owned by a non-root user (e.g., user ID 1001)
# and switch to that user before installing dependencies.
# User 1001 is a common non-root user provided in UBI images for applications.
# It's crucial to change ownership BEFORE copying package.json
# to ensure the subsequent npm install has write permissions.

# Change to root user temporarily to modify permissions
USER root

# Ensure the /app directory exists and is owned by user 1001
# The 'chown -R 1001:0' command changes the owner to user ID 1001 and group ID 0 (root group)
# This allows the non-root user (1001) to write to /app
RUN chown -R 1001:0 /app && chmod -R ug+rwx /app

# Switch back to the non-root user (1001) for subsequent operations
# This is a good security practice.
USER 1001
# --- FIX END ---

# Copy package.json and package-lock.json (if exists) to the working directory
# This allows npm to install dependencies before copying the rest of the app
COPY package*.json ./

# Install application dependencies
# The '--production' flag ensures only production dependencies are installed,
# keeping the image size smaller.
RUN npm install --production

# Copy the rest of the application code to the working directory
# This includes server.js and index.html
COPY . .

# Expose the port the application listens on.
# OpenShift/Kubernetes services will route traffic to this port.
EXPOSE 8080

# Define the command to run your application when the container starts.
# 'npm start' will execute the script defined in package.json.
CMD [ "npm", "start" ]

# Note: The final USER instruction is not strictly necessary here
# if you've already switched to 1001, but it's good for clarity
# if you had other root operations after the install.
# The current UBI Node.js image might also default to a non-root user.
# However, explicitly setting it and ensuring ownership is the most robust fix.

