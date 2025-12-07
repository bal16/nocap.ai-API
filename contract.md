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
  "email": "new.user@example.com", // required string: user's email address
  "name": "New User", // required string: user's display name
  "password": "StrongP@ssw0rd!", // required string: user's password
  "callbackURL": "https://app.example.com/verify-email", // optional string: URL used for email verification callback
  "image": "https://cdn.example.com/avatars/new-user.png", // optional string: profile image URL
  "rememberMe": true // optional boolean: if false, do not persist session; default true
}
```

**Response (Success)**:

```json
{
  "token": "SESSION_JWT_TOKEN_OR_NULL", // string | null: session auth token; null if not issued yet
  "user": {
    "id": "usr_abc123", // string: unique user identifier
    "email": "new.user@example.com", // string (email): user's email
    "name": "New User", // string: user's name
    "image": "https://cdn.example.com/avatars/new-user.png", // string | null (uri): profile image URL
    "emailVerified": false, // boolean: whether email is verified (usually false right after signup)
    "createdAt": "2025-12-03T07:21:16.471Z", // string (ISO date-time): when the user was created
    "updatedAt": "2025-12-03T07:21:16.471Z" // string (ISO date-time): last update timestamp
  }
}
```

**Response (Error)**:

```json
{
  "message": "Email already in use" // string: human-readable error description
}
```

#### SignIn

Sign in with email and password

**POST** `/auth/sign-in/email`

**Request (Example with comments)**:

```json
{
  "email": "user@example.com", // required string: user's email
  "password": "StrongP@ssw0rd!", // required string: user's password
  "callbackURL": "/verify", // optional string | null: redirect URL for email verification
  "rememberMe": null // optional string | null: client flag; null uses server default
}
```

**Response (Success: Session)**:

```json
{
  "redirect": false, // boolean: false indicates a direct session response (no redirect)
  "token": "SESSION_JWT_TOKEN", // string: session token to authenticate subsequent requests
  "user": {
    "id": "usr_123", // string: unique user identifier
    "name": "Jane Doe", // string: user's display name
    "email": "user@example.com", // string: user's email
    "emailVerified": false, // boolean (read-only): whether email is verified; default false
    "image": "https://cdn/avatar.png", // string: profile image URL
    "createdAt": "2025-12-03T07:21:16Z", // string (RFC 3339 date-time): generated at runtime
    "updatedAt": "2025-12-03T07:21:16Z" // string (RFC 3339 date-time): generated at runtime
  },
  "url": null // string | null: redirect URL not used in session response
}
```

**Response (Success: Redirect)**:

```json
{
  "redirect": true, // boolean: true indicates client should follow the redirect URL
  "token": null, // string | null: token is absent when redirecting to complete auth
  "user": null, // object | null: user not returned for redirect flows
  "url": "/verify" // string | null: redirect URL for verification or provider flow
}
```

**Response (Error)**:

```json
{
  "message": "Invalid email or password" // string: human-readable error message
}
```

#### Google SignIn

Sign in with a social provider

**POST** `/auth/sign-in/social`

**Request (Example with comments)**:

```json
{
  "provider": "google", // required: name of social provider ("google")
  "callbackURL": "/dashboard", // optional string: where to redirect after success; null to skip
  "newUserCallbackURL": "/welcome", // optional string: redirect for newly created users; null to skip
  "errorCallbackURL": "/error", // optional string: redirect if an error occurs; null to skip
  "disableRedirect": false, // optional boolean: if true, do not auto-redirect; you handle flow
  "idToken": {
    // optional object: tokens obtained from the provider
    "token": "ID_TOKEN_VALUE", // required if idToken provided: provider ID token (JWT)
    "nonce": "random-nonce", // optional string: nonce used to generate/validate the token
    "accessToken": "ACCESS_TOKEN", // optional string: provider access token
    "refreshToken": null, // optional string: provider refresh token
    "expiresAt": 1735900000000 // optional number (ms since epoch): token expiry time
  },
  "scopes": ["email", "profile"], // optional array: requested scopes; overrides defaults
  "requestSignUp": false, // optional boolean: force a sign-up flow when implicit sign-up is disabled
  "loginHint": "user@example.com", // optional string: hint for provider login UI
  "additionalData": "utm=campaign" // optional string: any extra data you want to persist/log
}
```

**Response (Success)**:

```json
{
  "token": "JWT_OR_SESSION_TOKEN", // string: token for authenticating subsequent requests
  "user": {
    "id": "usr_123", // string: internal user ID
    "name": "Jane Doe", // string: user's display name
    "email": "jane@example.com", // string: user's email
    "emailVerified": true, // boolean: whether provider/email has been verified
    "image": "https://cdn/avatar", // string: URL to profile image (if available)
    "createdAt": "2025-12-03T07:21:16.471Z", // ISO datetime: when the user was created
    "updatedAt": "2025-12-03T07:21:16.471Z" // ISO datetime: last update time
  },
  "url": "/dashboard", // string | null: redirect URL if applicable
  "redirect": false // boolean: server suggests client should redirect (true) or not (false)
}
```

**Response (Error)**:

```json
{
  "message": "Invalid provider or token" // string: human-readable error message
}
```

#### SignOut

Sign out the current user

**POST** `/auth/sign-out`

**Headers**:

- `Authorization: Bearer SESSION_JWT_TOKEN` // required: token of the currently signed-in user

**Request (Example with comments)**:

```json
{} // empty body; sign-out uses the Authorization header to identify the session
```

**Response (Success)**:

```json
{
  "success": true // boolean: indicates the session was invalidated successfully
}
```

**Response (Error)**:

```json
{
  "message": "Unauthorized" // string: error description, e.g., missing/invalid token
}
```

#### GetSession

Get the current session

**GET** `/auth/get-session`

**Headers**:

- `Authorization: Bearer SESSION_JWT_TOKEN` // required: current session token

**Response (Success)**:

```json
{
  "session": {
    "id": "sess_123", // string: unique session identifier
    "token": "SESSION_JWT_TOKEN", // string: session token (same as provided)
    "userId": "usr_123", // string: ID of the user who owns the session
    "createdAt": "2025-12-03T07:21:16Z", // string (RFC 3339): generated at runtime
    "updatedAt": "2025-12-03T07:21:16Z", // string (RFC 3339): generated at runtime
    "expiresAt": "2025-12-10T07:21:16Z", // string (RFC 3339): when the session expires
    "ipAddress": "203.0.113.42", // string: last seen IP address (if collected)
    "userAgent": "Mozilla/5.0 ..." // string: last seen user agent (if collected)
  },
  "user": {
    "id": "usr_123", // string: unique user identifier
    "email": "user@example.com", // string: user's email
    "name": "Jane Doe", // string: user's display name
    "image": "https://cdn/avatar.png", // string: profile image URL
    "emailVerified": false, // boolean (read-only): whether email is verified; default false
    "createdAt": "2025-12-03T07:21:16Z", // string (RFC 3339): generated at runtime
    "updatedAt": "2025-12-03T07:21:16Z" // string (RFC 3339): generated at runtime
  }
}
```

**Response (Error)**:

```json
{
  "message": "Unauthorized" // string: error description, e.g., missing/invalid token
}
```

### Image

#### Get Presign URL Image

Get a pre-signed URL to upload an image directly to storage (S3 Compatible). The URL is time-limited and scoped to the provided path and content type.

**POST** `/image/get-presign-url`

**Headers**:

- `Authorization: Bearer SESSION_JWT_TOKEN` // required: authenticated user session

**Request (Example with comments)**:

```json
{
  "fileName": "profile.png", // required string: original file name; used for key/extension validation
  "contentType": "image/png" // required string: MIME type (e.g., image/png, image/jpeg, image/webp)
}
```

**Response (Success)**:

```json
{
  "uploadUrl": "https://my-bucket.s3.aws.com/users/123/550e8400-e29b-41d4-a716-446655440000.png?Signature=...", // string: pre-signed URL for upload (PUT)
  "fileKey": "users/123/550e8400-e29b-41d4-a716-446655440000.png", // string: storage object key to persist
  "bucket": "my-bucket", // string: bucket name
  "region": "us-east-1", // string: storage region
  "expiresIn": 300, // number (seconds): how long the presign stays valid
  "maxSize": 5242880 // number (bytes): max allowed upload size
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

- `Authorization: Bearer SESSION_JWT_TOKEN` // required: authenticated user session

**Request (Example with comments)**:

```json
{
  "fileKey": "users/123/550e8400-e29b-41d4-a716-446655440000.png" // required string: storage object key
}
```

**Response (Success)**:

```json
{
  "accessUrl": "https://my-bucket.s3.aws.com/users/123/550e8400-e29b-41d4-a716-446655440000.png?Signature=...", // string: pre-signed URL for GET
  "fileKey": "users/123/550e8400-e29b-41d4-a716-446655440000.png", // string
  "bucket": "my-bucket", // string
  "region": "us-east-1", // string
  "expiresIn": 300 // number (seconds)
}
```

**Response (Error)**:

```json
{
  "message": "fileKey is required"
}
```

#### Generate from Image

- Image Curation
- Caption Generation
- Song Recommendation
- Topics Recommendation
- Engagement Analytic

**POST** `/generate/from-image`

**Headers**:

- `Authorization: Bearer SESSION_JWT_TOKEN` // required

**Request (Example with comments)**:

```json
{
  "fileKey": "users/123/550e8400-e29b-41d4-a716-446655440000.png", // required: storage key of the image
  "tasks": ["curation", "caption", "songs", "topics", "engagement"], // required: which outputs to generate
  "language": "en", // optional
  "context": {
    "userId": "usr_123",
    "postIntent": "travel vlog"
  },
  "limits": {
    "maxSongs": 5,
    "maxTopics": 8
  }
}
```

Note: If the generator needs a URL, the server should derive a presigned access URL internally from fileKey (do not persist long-lived URLs).

**Response (Success)**:

```json
{
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
  "message": "Image access failed",
  "code": "IMAGE_FETCH_FAILED",
  "hint": "Ensure the fileKey exists and the server can generate a valid signed URL."
}
```

#### Get Generation History (Per Session/Image)

Fetch generated outputs history for the current session, optionally filtered by image fileKey.

**GET** `/generate/history`

**Headers**:

- `Authorization: Bearer SESSION_JWT_TOKEN` // required: authenticated user session

**Query Params (Example with comments)**:

- `limit=20` // optional: max items to return (default: 20, max: 100)
- `cursor=hist_abc123` // optional: pagination cursor for next page

**Response (Success)**:

```json
{
  "items": [
    {
      "id": "hist_001", // string: history entry ID
      "fileKey": "users/123/posts/foto-unik.jpg", // string: image storage key
      "accessUrl": "https://my-bucket.s3.aws.com/users/123/posts/foto-unik.jpg", // string: access URL with timeout
      "createdAt": "2025-12-03T07:35:16Z" // string (RFC 3339): when this was generated
    }
  ],
  "pageInfo": {
    "limit": 20, // number: requested page size
    "nextCursor": "hist_002", // string | null: use to fetch the next page
    "hasNextPage": true // boolean: indicates if more items exist
  }
}
```

**Response (Error)**:

```json
{
  "message": "Unauthorized", // string: error description
  "code": "AUTH_REQUIRED" // string: machine-readable error code
}
```

#### Get Generation History Detailed (Per Session/Image)

Fetch detailed generation results for the current session. You can request a specific history entry or list all entries for an image.

**GET** `/generate/history/:id`

**Headers**:

- `Authorization: Bearer SESSION_JWT_TOKEN` // required: authenticated user session

**Query Params (Example with comments)**:

- `id=hist_001` // optional: fetch a single detailed history entry by its ID

**Response (Success: Single Item)**:

```json
{
  "item": {
    "id": "hist_001", // string: history entry ID
    "fileKey": "users/123/posts/foto-unik.jpg", // string: image storage key
    "accessUrl": "https://my-bucket.s3.aws.com/users/123/posts/foto-unik.jpg", // string: access URL with timeout
    "tasks": ["curation", "caption", "songs", "topics", "engagement"], // array: tasks executed
    "curation": {
      "isAppropriate": true, // boolean
      "labels": ["outdoor", "landscape"], // array
      "risk": "low", // string: low/medium/high
      "notes": "No sensitive content detected." // string
    },
    "caption": {
      "text": "Sunset hues over the quiet coastline.", // string
      "alternatives": ["Golden hour by the sea.", "A calm evening embracing the shore."] // array
    },
    "songs": [{ "title": "Ocean Eyes", "artist": "Billie Eilish", "reason": "Calm coastal vibe" }],
    "topics": [
      { "topic": "Travel", "confidence": 0.94 },
      { "topic": "Photography", "confidence": 0.89 }
    ],
    "engagement": {
      "estimatedScore": 0.78, // number 0–1
      "drivers": ["color palette", "subject clarity"], // array
      "suggestions": ["Add a human subject", "Include location tag"] // array
    },
    "meta": {
      "language": "en", // string
      "generatedAt": "2025-12-03T07:30:16Z" // string (RFC 3339)
    }
  }
}
```

**Response (Error)**:

```json
{
  "message": "Unauthorized", // string: error description
  "code": "AUTH_REQUIRED" // string: machine-readable error code
}
```
