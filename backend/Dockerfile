FROM node:20.14.0

# Install dumb-init to properly forward signals (fixes SIGTERM being reported as npm error)
RUN apt-get update && apt-get install -y dumb-init && rm -rf /var/lib/apt/lists/*

RUN npm install -g nodemon

WORKDIR /app

# Copy only package files first so npm install is cached unless dependencies change
COPY package*.json ./
RUN npm install

# Now copy the rest of the source
COPY . .

EXPOSE 5000

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start"]