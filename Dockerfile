# Use the official Node.js image as the base
FROM node:20-alpine3.20

# Set the working directory inside the container
WORKDIR /usr/app

# Copy package.json and package-lock.json (if available) into the container
COPY package*.json /usr/app/

# Install dependencies
RUN npm install

# Copy the rest of the application files into the container
COPY . .

# Set environment variables
ENV MONGO_URI=uriPlaceholder
ENV MONGO_USERNAME=usernamePlaceholder
ENV MONGO_PASSWORD=passwordPlaceholder

# Expose the port the app will run on
EXPOSE 3000

# Command to start the Node.js application
CMD ["npm", "start"]
