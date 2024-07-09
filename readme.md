# Url Shortner
This is a backend service for an url shortening software. This backend is capable to shorten url and also get their analytics.

### Built with
NodeJs, Express, PostgreSQL, Redis and containerized with Docker.

## Features
- Shorten any url
- All CRUD operations on that shortened url
- A tracking mechanism like click_count, ip_address of the click, etc.

## Starting the server

You can build the server using docker.

To build the server you have to create a .env file.

You can create your own .env file from the .env.template or you can use the .env.demo.

If you want to use .env.demo run this command in the root directory

```
cp .env.demo .env
```

Then run the server
```
docker compose up
```
