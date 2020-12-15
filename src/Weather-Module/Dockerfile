FROM node:latest
ENV NODE_ENV=production
#todo, load from .env
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production 
COPY . .
RUN npm run tsc
CMD ["npm", "start"]