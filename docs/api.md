# API Reference
Complete endpoint and payload reference for the implemented FastAPI service.

## Base URL
- Local: `http://localhost`
- Render: `https://<your-service>.onrender.com`

## Error Response Format

```json
{
  "detail": "Human-readable error"
}
```

Validation failures use FastAPI/Pydantic 422 format.

## Event Types

| Event Type | Source | Description |
|---|---|---|
| user_created | API | Emitted when a user is created via `/users` or `/users/bulk` |
| url_created | API | Emitted when a URL is created via `/urls` |
| url_visited | API | Emitted when a short code redirect succeeds |
| url_deactivated | API | Emitted when URL is set inactive |
| created | Seed CSV | Legacy seeded event taxonomy loaded at startup |
| updated | Seed CSV | Legacy seeded update taxonomy (if present in source data) |

## GET /health

### Purpose
Service liveness/readiness probe.

### Response 200
```json
{"status":"ok"}
```

### Curl
```bash
curl -i http://localhost/health
```

## POST /users

### Request
```json
{
  "username": "alice",
  "email": "alice@example.com"
}
```

### Responses
| Code | Meaning |
|---:|---|
| 201 | User created |
| 409 | Username or email already exists |
| 422 | Invalid payload |

### Curl
```bash
curl -i -X POST http://localhost/users \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com"}'
```

## GET /users

### Query Params
- `page` (optional int)
- `per_page` (optional int)

### Responses
| Code | Meaning |
|---:|---|
| 200 | User list |

### Curl
```bash
curl -i "http://localhost/users?page=1&per_page=10"
```

## GET /users/{user_id}

### Responses
| Code | Meaning |
|---:|---|
| 200 | User found |
| 404 | User not found |

### Curl
```bash
curl -i http://localhost/users/1
```

## PUT /users/{user_id}

### Request
```json
{
  "username": "alice-new",
  "email": "alice-new@example.com"
}
```

### Responses
| Code | Meaning |
|---:|---|
| 200 | User updated |
| 404 | User not found |
| 409 | Username/email conflict |
| 422 | Invalid payload |

### Curl
```bash
curl -i -X PUT http://localhost/users/1 \
  -H "Content-Type: application/json" \
  -d '{"username":"alice-new"}'
```

## POST /users/bulk

### Content Type
`multipart/form-data` with CSV file field named `file`

Expected CSV columns:
- `id,username,email,created_at`

### Responses
| Code | Meaning |
|---:|---|
| 200 | Import completed |

### Curl
```bash
curl -i -X POST http://localhost/users/bulk \
  -F "file=@backend/data/users.csv"
```

## POST /urls

### Request
```json
{
  "user_id": 1,
  "original_url": "https://example.com/page",
  "title": "Example"
}
```

### Responses
| Code | Meaning |
|---:|---|
| 201 | URL created |
| 404 | User not found |
| 422 | Invalid payload (including invalid URL format) |

### Curl
```bash
curl -i -X POST http://localhost/urls \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"original_url":"https://example.com/page"}'
```

## GET /urls

### Query Params
- `user_id` (optional int)

### Responses
| Code | Meaning |
|---:|---|
| 200 | URL list |

### Curl
```bash
curl -i "http://localhost/urls?user_id=1"
```

## GET /urls/{url_id}

### Responses
| Code | Meaning |
|---:|---|
| 200 | URL found |
| 404 | URL not found |

### Curl
```bash
curl -i http://localhost/urls/1
```

## PUT /urls/{url_id}

### Request
```json
{
  "title": "new title",
  "is_active": false
}
```

### Responses
| Code | Meaning |
|---:|---|
| 200 | URL updated |
| 404 | URL not found |
| 422 | Invalid payload |

### Curl
```bash
curl -i -X PUT http://localhost/urls/1 \
  -H "Content-Type: application/json" \
  -d '{"is_active":false}'
```

## GET /events

### Query Params
- `user_id` (optional int)
- `url_id` (optional int)

### Responses
| Code | Meaning |
|---:|---|
| 200 | Event list |
| 500 | Query error |

### Curl
```bash
curl -i "http://localhost/events?user_id=1"
```

## GET /{short_code}

### Responses
| Code | Meaning |
|---:|---|
| 302 | Redirect to original URL |
| 404 | URL missing or inactive |
| 503 | Temporary backend failure |

### Curl
```bash
curl -i http://localhost/HudIG9
```
