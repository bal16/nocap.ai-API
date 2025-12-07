# API CONTRACT

## Info

- App Name: NoCap.AI – Marketing Sosmed App
- Version: 1.0.0
- Description: Backend API for social media marketing workflows: auth, image uploads, AI-assisted content generation, and engagement analytics.
- Authentication:
  - Scheme: Bearer JWT (Authorization: Bearer `<token>`)
  - Providers: Email/Password, Google OAuth
- Tags (Feature Groups):
  - Auth
  - Image Curation
  - Caption Generation
  - Song Recommendation
  - Topic Generation
  - History Generation
  - Engagement Analytics

## Feature

### Auth

#### SignUp

Sign up a user using email and password

**POST** `/auth/sign-up/email`

**Request (Example with comments)**:

```json
{
  "email": "new.user@example.com",
  "name": "New User",
  "password": "StrongP@ssw0rd!",
  "callbackURL": "https://app.example.com/verify-email",
  "image": "https://cdn.example.com/avatars/new-user.png",
  "rememberMe": true
}
```

**Response (Success)**:

```json
{
  "token": "SESSION_JWT_TOKEN_OR_NULL",
  "user": {
    "id": "usr_abc123",
    "email": "new.user@example.com",
    "name": "New User",
    "image": "https://cdn.example.com/avatars/new-user.png",
    "emailVerified": false,
    "createdAt": "2025-12-03T07:21:16.471Z",
    "updatedAt": "2025-12-03T07:21:16.471Z"
  }
}
```

**Response (Error)**:

```json
{
  "message": "Email already in use"
}
```

#### SignIn

Sign in with email and password

**POST** `/auth/sign-in/email`

**Request (Example with comments)**:

```json
{
  "email": "user@example.com",
  "password": "StrongP@ssw0rd!",
  "callbackURL": "/verify",
  "rememberMe": null
}
```

**Response (Success: Session)**:

```json
{
  "redirect": false,
  "token": "SESSION_JWT_TOKEN",
  "user": {
    "id": "usr_123",
    "name": "Jane Doe",
    "email": "user@example.com",
    "emailVerified": false,
    "image": "https://cdn/avatar.png",
    "createdAt": "2025-12-03T07:21:16Z",
    "updatedAt": "2025-12-03T07:21:16Z"
  },
  "url": null
}
```

**Response (Success: Redirect)**:

```json
{
  "redirect": true,
  "token": null,
  "user": null,
  "url": "/verify"
}
```

**Response (Error)**:

```json
{
  "message": "Invalid email or password"
}
```

#### Google SignIn

Sign in with a social provider

**POST** `/auth/sign-in/social`

**Request (Example with comments)**:

```json
{
  "provider": "google",
  "callbackURL": "/dashboard",
  "newUserCallbackURL": "/welcome",
  "errorCallbackURL": "/error",
  "disableRedirect": false,
  "idToken": {
    "token": "ID_TOKEN_VALUE",
    "nonce": "random-nonce",
    "accessToken": "ACCESS_TOKEN",
    "refreshToken": null,
    "expiresAt": 1735900000000
  },
  "scopes": ["email", "profile"],
  "requestSignUp": false,
  "loginHint": "user@example.com",
  "additionalData": "utm=campaign"
}
```

**Response (Success)**:

```json
{
  "token": "JWT_OR_SESSION_TOKEN",
  "user": {
    "id": "usr_123",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "emailVerified": true,
    "image": "https://cdn/avatar",
    "createdAt": "2025-12-03T07:21:16.471Z",
    "updatedAt": "2025-12-03T07:21:16.471Z"
  },
  "url": "/dashboard",
  "redirect": false
}
```

**Response (Error)**:

```json
{
  "message": "Invalid provider or token"
}
```

#### SignOut

Sign out the current user

**POST** `/auth/sign-out`

**Headers**:

- `Authorization: Bearer SESSION_JWT_TOKEN`

**Request (Example with comments)**:

```json
{}
```

**Response (Success)**:

```json
{
  "success": true
}
```

**Response (Error)**:

```json
{
  "message": "Unauthorized"
}
```

#### GetSession

Get the current session

**GET** `/auth/get-session`

**Headers**:

- `Authorization: Bearer SESSION_JWT_TOKEN`

**Response (Success)**:

```json
{
  "session": {
    "id": "sess_123",
    "token": "SESSION_JWT_TOKEN",
    "userId": "usr_123",
    "createdAt": "2025-12-03T07:21:16Z",
    "updatedAt": "2025-12-03T07:21:16Z",
    "expiresAt": "2025-12-10T07:21:16Z",
    "ipAddress": "203.0.113.42",
    "userAgent": "Mozilla/5.0 ..."
  },
  "user": {
    "id": "usr_123",
    "email": "user@example.com",
    "name": "Jane Doe",
    "image": "https://cdn/avatar.png",
    "emailVerified": false,
    "createdAt": "2025-12-03T07:21:16Z",
    "updatedAt": "2025-12-03T07:21:16Z"
  }
}
```

**Response (Error)**:

```json
{
  "message": "Unauthorized"
}
```

### Image

#### Get Presign URL Image

Get a pre-signed URL to upload an image directly to storage (S3 Compatible). The URL is time-limited and scoped to the provided path and content type.

**POST** `/image/get-presign-url`

**Headers**:

- `Authorization: Bearer SESSION_JWT_TOKEN`

**Request (Example with comments)**:

```json
{
  "fileName": "profile.png",
  "contentType": "image/png"
}
```

**Response (Success)**:

```json
{
  "uploadUrl": "https://my-bucket.s3.aws.com/users/123/550e8400-e29b-41d4-a716-446655440000.png?Signature=...",
  "fileKey": "users/123/550e8400-e29b-41d4-a716-446655440000.png",
  "bucket": "my-bucket",
  "region": "us-east-1",
  "expiresIn": 300,
  "maxSize": 5242880
}
```

**Response (Error)**:

```json
{
  "message": "Unsupported content type"
}
```

#### Get Access URL Image

Generate a short-lived access URL to read an uploaded image by its fileKey.

**POST** `/image/get-access-url`

**Headers**:

- `Authorization: Bearer SESSION_JWT_TOKEN`

**Request (Example with comments)**:

```json
{
  "fileKey": "users/123/550e8400-e29b-41d4-a716-446655440000.png"
}
```

**Response (Success)**:

```json
{
  "accessUrl": "https://my-bucket.s3.aws.com/users/123/550e8400-e29b-41d4-a716-446655440000.png?Signature=...",
  "fileKey": "users/123/550e8400-e29b-41d4-a716-446655440000.png",
  "bucket": "my-bucket",
  "region": "us-east-1",
  "expiresIn": 300
}
```

**Response (Error)**:

```json
{
  "message": "fileKey is required"
}
```

### AI Generation

#### Generate from Image

Generate curation, caption, songs, topics, and engagement analytics from an image.

**POST** `/generate/from-image`

**Headers**:

- `Authorization: Bearer SESSION_JWT_TOKEN`

**Request (Example with comments)**:

```json
{
  "fileKey": "users/123/posts/foto-unik.jpg",
  "imageUrl": "https://cdn.example.com/backup/foto-unik.jpg",
  "tasks": ["curation", "caption", "songs", "topics", "engagement"],
  "language": "en",
  "context": { "userId": "usr_123", "postIntent": "travel vlog" },
  "limits": { "maxSongs": 5, "maxTopics": 8 }
}
```

Notes:

- fileKey is required. Server derives a short-lived access URL internally from fileKey.
- imageUrl is optional and only for back-compat; service will prefer fileKey.

**Response (Success)**:

```json
{
  "imageUrl": "https://my-bucket.s3.aws.com/users/123/posts/foto-unik.jpg?Signature=...",
  "curation": {
    "isAppropriate": true,
    "labels": ["outdoor", "landscape"],
    "risk": "low",
    "notes": "No sensitive content detected."
  },
  "caption": {
    "text": "Sunset hues over the quiet coastline.",
    "alternatives": ["Golden hour by the sea.", "A calm evening embracing the shore."]
  },
  "songs": [
    { "title": "Ocean Eyes", "artist": "Billie Eilish", "reason": "Calm coastal vibe" },
    { "title": "Sunset Lover", "artist": "Petit Biscuit", "reason": "Warm sunset mood" }
  ],
  "topics": [
    { "topic": "Travel", "confidence": 0.94 },
    { "topic": "Photography", "confidence": 0.89 },
    { "topic": "Nature", "confidence": 0.87 }
  ],
  "engagement": {
    "estimatedScore": 0.78,
    "drivers": ["color palette", "subject clarity"],
    "suggestions": ["Add a human subject", "Include location tag"]
  },
  "meta": {
    "language": "en",
    "generatedAt": "2025-12-03T07:30:16Z"
  }
}
```

**Response (Error)**:

```json
{
  "status": 400,
  "message": "Image URL not accessible",
  "code": "IMAGE_FETCH_FAILED",
  "hint": "Ensure the image is publicly accessible or provide a valid signed URL."
}
```

#### Get Generation History (Per Session/Image)

Fetch generated outputs history for the current session.

**GET** `/generate/history`

**Headers**:

- `Authorization: Bearer SESSION_JWT_TOKEN`

**Query Params**:

- `limit=20`
- `cursor=hist_abc123`

**Response (Success)**:

```json
{
  "items": [
    {
      "id": "hist_001",
      "fileKey": "users/123/posts/foto-unik.jpg",
      "engagement": {
        "estimatedScore": 0.78
      },
      "createdAt": "2025-12-03T07:35:16Z"
    }
  ],
  "pageInfo": {
    "limit": 20,
    "nextCursor": "hist_002",
    "hasNextPage": true
  }
}
```

**Response (Error)**:

```json
{
  "message": "Unauthorized",
  "code": "AUTH_REQUIRED"
}
```

#### Get Generation History Detailed (Per Session/Image)

Fetch a single generated item by ID.

**GET** `/generate/history/:id`

**Headers**:

- `Authorization: Bearer SESSION_JWT_TOKEN`

**Response (Success: Single Item)**:

```json
{
  "item": {
    "id": "hist_001",
    "fileKey": "users/123/posts/foto-unik.jpg",
    "tasks": ["curation", "caption", "songs", "topics", "engagement"],
    "curation": {
      "isAppropriate": true,
      "labels": ["outdoor", "landscape"],
      "risk": "low",
      "notes": "No sensitive content detected."
    },
    "caption": {
      "text": "Sunset hues over the quiet coastline.",
      "alternatives": ["Golden hour by the sea.", "A calm evening embracing the shore."]
    },
    "songs": [{ "title": "Ocean Eyes", "artist": "Billie Eilish", "reason": "Calm coastal vibe" }],
    "topics": [
      { "topic": "Travel", "confidence": 0.94 },
      { "topic": "Photography", "confidence": 0.89 }
    ],
    "engagement": {
      "estimatedScore": 0.78,
      "drivers": ["color palette", "subject clarity"],
      "suggestions": ["Add a human subject", "Include location tag"]
    },
    "meta": {
      "language": "en",
      "generatedAt": "2025-12-03T07:30:16Z"
    }
  }
}
```

**Response (Error)**:

```json
{
  "message": "Unauthorized",
  "code": "AUTH_REQUIRED"
}
```
