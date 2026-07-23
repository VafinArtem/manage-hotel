FROM node:24-alpine

WORKDIR /manage-hotel

ADD package.json package.json
RUN npm install

ADD . .
RUN npm run build
RUN npm prune --production

CMD ["node", "dist/main.js"]
