# Creator Card API

A Node.js and Express microservice for creating, retrieving, and deleting Creator Cards. The project is built on the R17 backend template and uses MongoDB for persistence.

Creator Cards are shareable profile cards for creators, including profile metadata, showcase links, service rates, publication status, and optional private access controls.

## Features

- Create published or draft Creator Cards.
- Retrieve published public cards by slug.
- Retrieve private cards with a valid `access_code`.
- Soft-delete cards by slug.
- Auto-generate slugs from card titles.
- Persist cards in MongoDB through the template repository layer.
- Serialize MongoDB `_id` as `id` in API responses.
- Omit `access_code` from public retrieval responses.

## Tech Stack

- Node.js
- Express.js
- MongoDB / Mongoose
- R17 backend template
- Mocha test runner

## API Reference

### Create Creator Card

```http
POST /creator-cards
```

Creates a Creator Card after field-level validation and business-rule checks.

```json
{
  "title": "George Cooks",
  "description": "Weekly cooking podcast",
  "slug": "george-cooks",
  "creator_reference": "crt_8f2k1m9x4p7w3q5z",
  "links": [
    { "title": "YouTube", "url": "https://youtube.com/@georgecooks" }
  ],
  "service_rates": {
    "currency": "NGN",
    "rates": [
      {
        "name": "IG Story Post",
        "description": "One story mention",
        "amount": 5000000
      }
    ]
  },
  "status": "published",
  "access_type": "public"
}
```

### Retrieve Creator Card

```http
GET /creator-cards/:slug
```

Retrieves a published card by slug. Private cards require an access code query parameter.

```http
GET /creator-cards/vip-rate-card?access_code=A1B2C3
```

### Delete Creator Card

```http
DELETE /creator-cards/:slug
```

Soft-deletes a card and returns the deleted card payload.

```json
{
  "creator_reference": "crt_8f2k1m9x4p7w3q5z"
}
```

## Error Codes

Custom business-rule errors use the following codes:

| Code | HTTP Status | Meaning |
| ---- | ----------- | ------- |
| `SL02` | 400 | Slug is already taken |
| `AC01` | 400 | Private cards require `access_code` |
| `AC05` | 400 | Public cards cannot include `access_code` |
| `NF01` | 404 | Creator Card not found |
| `NF02` | 404 | Creator Card exists but is a draft |
| `AC03` | 403 | Private card access code is required |
| `AC04` | 403 | Private card access code is invalid |

## Setup

```bash
npm install
cp .env.example .env
```

Required environment variables:

```bash
APP_NAME=nodejs-assessment
MONGODB_URI=mongodb://localhost:27017/nodejs-assessment
QUEUE_NAME=nodejs-assessment
```

Start the API:

```bash
npm start
```

## Testing

```bash
npm test
```

The test suite uses the template mock-model system, so MongoDB is not required for tests.

## Deployment

The project includes `render.yaml` for Render deployment. The build command installs development dependencies because the template's `prepare` script uses Husky during installation.

Runtime configuration:

```bash
APP_NAME=nodejs-assessment
MONGODB_URI=<mongodb-atlas-uri>
QUEUE_NAME=nodejs-assessment
PINO_LOG_LEVEL=info
```

The service expects Node.js `>=20 <26`.
