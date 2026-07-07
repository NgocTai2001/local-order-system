FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache libstdc++ \
  && apk add --no-cache --virtual .build-deps python3 make g++ \
  && npm install --omit=dev \
  && npm cache clean --force \
  && apk del .build-deps

COPY src ./src

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "src/server.js"]
