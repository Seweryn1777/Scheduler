## Installation

```bash
$ npm install
```
or using yarn
```bash
$ yarn install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Building and testing Docker image
1. Clone repository

2. Build docker image to verify it working
```bash
$ docker build -t api-name .
```

3. Run image to test it's working as expected and go to exposed port 8080
```bash
$ docker run -p 8080:3000 --env-file .env api-name
```