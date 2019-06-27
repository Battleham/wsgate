FROM node:7
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD SLEEPERSVC=sleeper1 node index.js
EXPOSE 3000