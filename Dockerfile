# Base image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

# Install app dependencies
RUN npm ci

#Run all the test cases
RUN npm test

#Run all End2End test case, can be removed later and another approach can be considered
# RUN npm run test:e2e

# Creates a "dist" folder with the production build
RUN npm run build

EXPOSE 3000

# Start the server using the production build
CMD [ "npm", "run", "start:build:prod" ]