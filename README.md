# Creator Card API

Node.js/Express Creator Card microservice built on the required R17 backend template.

## Endpoints

- `POST /creator-cards` creates a card.
- `GET /creator-cards/:slug` retrieves a published public card, or a private card with `?access_code=`.
- `DELETE /creator-cards/:slug` soft-deletes a card.

All endpoints live at the root of the base URL. There is no `/api`, `/v1`, authentication, bearer token, or API key requirement.

## Requirements Covered

- MongoDB persistence through the template model/repository pattern.
- VSL validation for field-level request validation.
- Custom business errors: `SL02`, `AC01`, `AC05`, `NF01`, `NF02`, `AC03`, `AC04`.
- API responses serialize Mongo `_id` as `id` and never expose `_id`.
- Retrieval responses omit `access_code`.
- Draft and deleted cards are not publicly retrievable.
- Slugs auto-generate from title when omitted.

## Local Setup

```bash
npm install
cp .env.example .env
npm test
```

For local server execution, set at least:

```bash
PORT=3000
APP_NAME=nodejs-assessment
MONGODB_URI=mongodb://localhost:27017/nodejs-assessment
QUEUE_NAME=nodejs-assessment
```

Then start the server:

```bash
npm start
```

## Render Deployment

Use a Node Web Service with:

- Build command: `npm install`
- Start command: `npm start`
- Node version: `>=20 <26`

Set environment variables:

```bash
APP_NAME=nodejs-assessment
MONGODB_URI=<mongodb-atlas-uri>
QUEUE_NAME=nodejs-assessment
PINO_LOG_LEVEL=info
```

Submit only the deployed base URL, for example `https://nodejs-assessment.onrender.com`.

## Test Notes

The service tests use the template mock-model system and do not require MongoDB:

```bash
npm test
```

If your local machine is on Node v26, use Node 20-24 because the template's current Mocha dependency chain is not compatible with Node v26.
