ARG BUILD_IMAGE=node:20.1.0
ARG RUN_IMAGE=gcr.io/distroless/nodejs20-debian11

FROM ${BUILD_IMAGE} AS build

WORKDIR /shortner

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

FROM ${RUN_IMAGE}

WORKDIR /backend

COPY --from=build /shortner .

CMD ["node","index.js"] 
