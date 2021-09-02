FROM node:16

COPY package.json package-lock.json ./

RUN npm i

COPY . ./

RUN npm run build

CMD ["npm", "run", "start"]
