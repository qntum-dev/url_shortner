ARG BUILD_IMAGE=node:20.1.0
ARG RUN_IMAGE=gcr.io/distroless/nodejs20-debian11

FROM ${BUILD_IMAGE} AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

FROM ${RUN_IMAGE}

WORKDIR /app

COPY --from=build /app .

CMD ["node","index.js"] 
