FROM node:latest

WORKDIR /frontend
COPY package.json .

RUN npm install 
RUN npm install react-scripts@3.0.1 -g --silent

EXPOSE 3000

CMD npm start