ARG BUILD_IMAGE=node:20.1.0
ARG RUN_IMAGE=gcr.io/distroless/nodejs20-debian11

FROM ${BUILD_IMAGE} AS build

RUN npm install -g pnpm

WORKDIR /app

COPY package*.json ./

RUN pnpm install --no-save --production --only=production

COPY . .

FROM ${RUN_IMAGE}

COPY --from=build /app /app

WORKDIR /app

CMD ["index.js"]