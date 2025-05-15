# MyDictionary

A TypeScript backend service that integrates Google Sheets with a PostgreSQL database.

## Features

- OAuth2 authentication with Google Sheets API
- PostgreSQL database integration
- Docker containerization
- TypeScript/Node.js backend

## Prerequisites

- Node.js 20 or higher
- Docker and Docker Compose
- Google Cloud Platform account with Google Sheets API enabled

## Setup

1. Clone the repository
```bash
git clone <repository-url>
cd mydictionary
```

2. Create a `.env` file with your Google OAuth2 credentials:
```bash
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

3. Start the application:
```bash
docker-compose up --build
```

## API Endpoints

- `GET /api/sheets/auth` - Initiate OAuth2 authentication
- `GET /api/sheets/auth/callback` - OAuth2 callback handler
- `GET /api/sheets/:spreadsheetId` - Get spreadsheet data
- `POST /api/sheets/:spreadsheetId/sync` - Sync spreadsheet with database

## Development

The application uses Docker Compose for development. The setup includes:
- Hot reloading for TypeScript files
- PostgreSQL database with persistent volume
- Automatic TypeScript compilation

## Environment Variables

- `GOOGLE_CLIENT_ID` - Google OAuth2 client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth2 client secret
- `POSTGRES_*` - PostgreSQL configuration
- `PORT` - Application port (default: 3000)
- `NODE_ENV` - Node environment 