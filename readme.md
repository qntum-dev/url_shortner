# Url Shortner
This is a backend service for an url shortening software. This backend is capable to shorten url and also get their analytics.

## Built with
NodeJs, Express, PostgreSQL, Redis and containerized with Docker.

### Features
- Shorten any url
- All CRUD operations on that shortened url
- A tracking mechanism like click_count, ip_address of the click, etc.

## Starting the server

You can build the server using docker.

To build the server you have to create a .env file.

You can create your own .env file from the .env.template or you can use the .env.demo.

If you want to use .env.demo run this command in the root directory

```
cp ./.env.demo ./.env
```

Then run the server
```
docker compose up
```

To stop the servers
```
docker compose down
```

## Develop and modify the project

You can modify this project using docker and don't need to install any dependencies on your local dev environment, you just need to code it in your host and it will be automatically updated in the development docker conatainer.

Here is how you can do so

To build the development server you have to create a .env file.

You can create your own .env file from the .env.template or you can use the .env.demo.

If you want to use .env.demo run this command in the root directory

```
cp ./.env.demo ./.env.dev
```

```
docker compose -f docker-compose.dev.yml up -d
```
#### Note: you have to use this command to stop your dev server!!!

```
docker compose -f docker-compose.dev.yml down
```

As simple as that 😄, you can now start coding ! 

You can use postman or any other http client for testing the endpoints

Following are the endpoints

- `POST /shorten/`
```
curl -L -X POST 'http://192.168.1.100:7000/shorten' -H 'Content-Type: application/json' -d '{"url":"https://example.com"}'
```

Here "hsi1oo" is the shorcode for the url given by the shorten endpoint

- `POST /shorten/update_dest/hsi1oo`
```
curl -L -X POST 'http://192.168.1.100:7000/shorten/update_dest/hsi1oo' -H 'Content-Type: application/json' -d '{"newurl": "https://google.com"}'
```

- `GET /goto/hsi1oo`
```
curl -L -X GET 'http://192.168.1.100:7000/hsi1oo'
```

- `GET /analytics/hsi1oo`
```
curl -L -X GET 'http://192.168.1.100:7000/analytics/hsi1oo'
```

- `GET /viewurl/hsi1oo`
```
curl -L -X GET 'http://192.168.1.100:7000/viewurl/hsi1oo'
```

- `DELETE /del/hb58x2`
```
curl -L -X DELETE 'http://localhost:7000/del/hsi1oo'
```

