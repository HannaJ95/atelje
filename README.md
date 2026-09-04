# Atelje

A 3D picture wall designer application that allows users to digitally design and visualize picture wall layouts in a 3D environment. Built as a full-stack web application with modern technologies.

## 🎨 Features

- **3D Design Interface**: Interactive 3D canvas for designing picture walls using Three.js and React Three Fiber
- **User Authentication**: Secure JWT-based authentication with ASP.NET Core Identity
- **Email Confirmation**: Automated email confirmation system powered by Resend
- **Design Management**: Create, save, edit, and delete picture wall designs
- **Screenshot Capture**: Automatic thumbnail generation for designs using Cloudflare R2 storage
- **Responsive UI**: Modern, intuitive interface built with Next.js and TypeScript

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.5 with App Router
- **Language**: TypeScript
- **3D Graphics**: React Three Fiber, Three.js 0.180.0
- **UI Library**: @react-three/drei for 3D helpers
- **Testing**: Jest 29.7.0 with React Testing Library

### Backend
- **Framework**: ASP.NET Core Web API (.NET 9)
- **Database**: PostgreSQL with Entity Framework Core 9.0
- **Authentication**: ASP.NET Core Identity with JWT tokens
- **Testing**: xUnit 2.4.2 with Moq
- **Email**: Resend API
- **File Storage**: Cloudflare R2

### DevOps
- **Hosting**: Railway (both frontend and backend)
- **CI/CD**: GitHub Actions
- **Containerization**: Docker

## 🔧 External Services

### Email - Resend
- **Purpose**: User registration confirmation emails
- **Dashboard**: [resend.com/emails](https://resend.com/emails)
- **Configuration**: `Email:ApiKey` in Railway environment variables
- **Required Variables**:
  - `Email:ApiKey`: Resend API key
  - `Email:FromEmail`: Sender email (e.g., `onboarding@resend.dev`)
  - `Email:FromName`: Sender display name (e.g., `Atelje`)
- **Testing**: Register a new user and verify confirmation email delivery

### File Storage - Cloudflare R2
- **Purpose**: Design screenshot thumbnails and storage
- **Dashboard**: Cloudflare Dashboard → R2
- **Configuration**: `R2:*` variables in Railway environment variables
- **Bucket Name**: `atelje-screenshots`
- **Public URL**: `https://pub-20ea7aa8a86f43f4be960730b132a87f.r2.dev`
- **Required Variables**:
  - `R2:AccountId`: Cloudflare account ID
  - `R2:AccessKey`: R2 access key
  - `R2:SecretKey`: R2 secret key
  - `R2:BucketName`: Bucket name
  - `R2:PublicUrl`: Public bucket URL
- **Testing**: Create a new design and verify screenshot thumbnail appears

### Database - PostgreSQL
- **Purpose**: Primary data storage (users, designs, authentication)
- **Provider**: Railway PostgreSQL
- **Configuration**: Automatically detected via Railway environment variables
- **Variables**: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
- **Local Alternative**: Local PostgreSQL installation (see installation steps)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.18.0+ or v20.0.0+ (v23.x recommended)
- **.NET SDK**: 9.0.x
- **PostgreSQL**: 14+ (local installation or Railway database)
- **IDE**: 
  - JetBrains Rider (recommended for backend)
  - Visual Studio Code (recommended for frontend)

### macOS-Specific Setup

For Node.js:
```bash
# Using Homebrew
brew install node

# Or using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 23
nvm use 23
```

For .NET:
```bash
# Using Homebrew
brew install --cask dotnet-sdk
```

For PostgreSQL:
```bash
# Using Homebrew
brew install postgresql@14
brew services start postgresql@14
```

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd atelje
```

### 2. Backend Setup

#### 2.1 Navigate to Backend Directory

```bash
cd backend
```

#### 2.2 Restore Dependencies

Using Rider:
- Open `backend.sln` in Rider
- Right-click the solution → "Restore NuGet Packages"
- Build → Build Solution

Using CLI:
```bash
dotnet restore backend.sln
dotnet build backend.sln
```

#### 2.3 Configure Database Connection

**Option A: Local PostgreSQL Database**

Create a local PostgreSQL database:
```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE atelje_db;

# Create user (optional)
CREATE USER atelje_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE atelje_db TO atelje_user;

# Exit
\q
```

Update `backend/Atelje/appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "TestDatabase": "Host=localhost;Database=atelje_db;Username=atelje_user;Password=your_password"
  }
}
```

**Option B: Railway Database**

The application automatically detects Railway database environment variables:
- `PGHOST`
- `PGPORT`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`

No additional configuration needed if these are set.

#### 2.4 Configure User Secrets

Store sensitive configuration in user secrets (NOT in appsettings.json):

Using Rider:
- Right-click `Atelje.csproj` → "Manage User Secrets"

Using CLI:
```bash
cd backend/Atelje
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "your-super-secret-jwt-key-min-32-chars"
dotnet user-secrets set "Jwt:Issuer" "http://localhost:5225"
dotnet user-secrets set "Jwt:Audience" "http://localhost:3000"
dotnet user-secrets set "Email:ApiKey" "your-resend-api-key"
dotnet user-secrets set "Jwt:ExpiryInDays" "30"
```

**Required User Secrets:**
- `Jwt:Key`: Secret key for JWT token generation (minimum 32 characters)
- `Jwt:Issuer`: Backend URL (e.g., `http://localhost:5225`)
- `Jwt:Audience`: Frontend URL (e.g., `http://localhost:3000`)
- `Email:ApiKey`: Resend API key for email confirmation
- `ExpiryInDays`: Days until Hwt key expires. "30" can be changed into preffered number of days

**Optional Cloudflare R2 Secrets** (for screenshot uploads):
- `R2:AccountId`
- `R2:AccessKey`
- `R2:SecretKey`
- `R2:BucketName`
- `R2:PublicUrl`

#### 2.5 Apply Database Migrations

The application automatically applies migrations on startup, but you can run them manually:

```bash
cd backend/Atelje
dotnet ef database update
```

Or using Rider:
- Tools → Entity Framework Core → Update Database

#### 2.6 Run the Backend

Using Rider:
- Select "http" or "https" run configuration
- Click the green play button

Using CLI:
```bash
cd backend/Atelje
dotnet run
```

The API will be available at:
- **HTTP**: `http://localhost:5225`
- **HTTPS**: `https://localhost:7020`

API Documentation (Scalar):
- **Development**: `http://localhost:5225/scalar/v1`

### 3. Frontend Setup

#### 3.1 Navigate to Frontend Directory

```bash
cd frontend  # From project root
```

#### 3.2 Install Dependencies

```bash
npm install
```

**Note**: You may see `EBADENGINE` warnings for Node v23 - these are safe to ignore. Jest and other packages work correctly on Node v23.

#### 3.3 Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5225
```

**For Production:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

#### 3.4 Generate API Client (Optional)

If the backend API has changed, regenerate the TypeScript API client:

```bash
# Ensure backend is running first
npm run generate:api
```

This generates TypeScript types and API functions from the OpenAPI specification.

#### 3.5 Run the Frontend

Development mode:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

Production build:
```bash
npm run build
npm run start
```

## 🧪 Testing

### Backend Tests (xUnit)

Run all tests:
```bash
cd backend
dotnet test
```

Run with detailed output:
```bash
dotnet test --verbosity detailed
```

Exclude local-only tests (useful for CI):
```bash
dotnet test --filter "Category!=LocalOnly"
```

In Rider:
- View → Tool Windows → Unit Tests
- Right-click → Run All Tests

### Frontend Tests (Jest)

Run all tests:
```bash
cd frontend
npm test
```

Watch mode:
```bash
npm run test:watch
```

Run with coverage:
```bash
npm test -- --coverage
```

## 📚 Project Structure

```
atelje/
├── backend/
│   ├── Atelje/                    # Main API project
│   │   ├── Controllers/           # API endpoints
│   │   ├── Services/              # Business logic
│   │   ├── Data/                  # Database context
│   │   ├── Models/                # Entity models
│   │   ├── DTOs/                  # Data transfer objects
│   │   ├── Migrations/            # EF Core migrations
│   │   └── Program.cs             # Application entry point
│   ├── Atelje.Tests/              # xUnit test project
│   ├── backend.sln                # Solution file
│   └── Dockerfile                 # Backend container config
│
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js App Router pages
│   │   ├── api/                   # Generated API client
│   │   ├── components/            # React components
│   │   ├── contexts/              # React contexts (Auth, Modal)
│   │   ├── features/              # Feature-based modules
│   │   └── hooks/                 # Custom React hooks
│   ├── public/                    # Static assets
│   ├── jest.config.mjs            # Jest configuration
│   ├── next.config.ts             # Next.js configuration
│   └── package.json               # Frontend dependencies
│
├── TESTING_GUIDE.md               # Frontend testing guide
├── BACKEND_TESTING_GUIDE.md       # Backend testing guide
└── README.md                      # This file
```

## 🔐 Environment Variables Reference

### Backend (`appsettings.json` / User Secrets)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `Jwt:Key` | Yes | JWT signing key (32+ chars) | `your-super-secret-key-here` |
| `Jwt:Issuer` | Yes | JWT token issuer | `http://localhost:5225` |
| `Jwt:Audience` | Yes | JWT token audience | `http://localhost:3000` |
| `Email:ApiKey` | Yes | Resend API key | `re_xxxxxxxxx` |
| `Email:FromEmail` | Yes | Sender email address | `noreply@atelje.app` |
| `Email:FromName` | Yes | Sender name | `Atelje` |
| `R2:AccountId` | No | Cloudflare R2 account ID | - |
| `R2:AccessKey` | No | Cloudflare R2 access key | - |
| `R2:SecretKey` | No | Cloudflare R2 secret key | - |
| `R2:BucketName` | No | Cloudflare R2 bucket name | - |
| `R2:PublicUrl` | No | Public R2 bucket URL | - |

### Railway Production Variables

The backend automatically detects these Railway variables:

| Variable | Description |
|----------|-------------|
| `PGHOST` | PostgreSQL host |
| `PGPORT` | PostgreSQL port (default: 5432) |
| `PGDATABASE` | Database name |
| `PGUSER` | Database username |
| `PGPASSWORD` | Database password |

### Frontend (`.env.local`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL | `http://localhost:5225` |

## 🚢 Deployment

### Railway Deployment

Both frontend and backend are configured for Railway deployment:

**Backend:**
- Uses the included `Dockerfile`
- Automatically applies migrations on startup
- Detects Railway PostgreSQL environment variables

**Frontend:**
- Configured in `package.json` build script
- Uses Next.js standalone output
- Requires `NEXT_PUBLIC_API_URL` environment variable

### Health Check

The backend includes a health check endpoint:
```
GET /health
```

Returns database connection status and overall application health.

## 📖 Additional Documentation

- [Frontend Testing Guide](frontend/TESTING_GUIDE.md) - Jest and React Testing Library setup
- [Backend Testing Guide](backend/BACKEND_TESTING_GUIDE.md) - xUnit and integration testing
## 🤝 Contributing

This is a student capstone project. For questions or issues, please contact the development team.

## 📝 License

MIT License

Copyright (c) 2025 Andrea Wingårdh, Jennie Westerlund, Josefine Ahlstrand

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE

## 👥 Team

- **Development Team**: Andy, Josefine, Jennie
- **Project Duration**: 5 weeks
- **Institution**: YRGO

## 🔧 Troubleshooting

### Backend won't start
- ✅ Check database connection string in `appsettings.Development.json`
- ✅ Verify PostgreSQL is running: `pg_isready`
- ✅ Check user secrets are configured: `dotnet user-secrets list`
- ✅ Review logs for specific error messages

### Frontend can't connect to backend
- ✅ Verify backend is running on `http://localhost:5225`
- ✅ Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
- ✅ Check browser console for CORS errors
- ✅ Verify backend CORS is configured for `http://localhost:3000`

### Database migration issues
- ✅ Delete `Migrations` folder and run `dotnet ef migrations add InitialCreate`
- ✅ Drop database and recreate: `dotnet ef database drop` then `dotnet ef database update`
- ✅ Check connection string format is correct

### Tests not running in Rider
- ✅ Build → Build Solution
- ✅ Right-click solution → Restore NuGet Packages
- ✅ Invalidate Caches: File → Invalidate Caches → Invalidate and Restart

### Email confirmation not working
- ✅ Check Resend API key is set in user secrets
- ✅ Verify email configuration in `appsettings.json`
- ✅ Check spam folder for confirmation emails
- ✅ Review backend logs for email sending errors

## 📚 API Documentation

When running in development mode, interactive API documentation is available:

- **Scalar UI**: `http://localhost:5225/scalar/v1`
- **OpenAPI Spec**: `http://localhost:5225/openapi/v1.json`

## 🎯 Getting Started Quickly

Quick start for local development:

```bash
# Terminal 1 - Backend
cd backend/Atelje
dotnet user-secrets set "Jwt:Key" "your-super-secret-jwt-key-at-least-32-characters"
dotnet user-secrets set "Jwt:Issuer" "http://localhost:5225"
dotnet user-secrets set "Jwt:Audience" "http://localhost:3000"
dotnet user-secrets set "Email:ApiKey" "your-resend-key"
dotnet run

# Terminal 2 - Frontend
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:5225" > .env.local
npm run dev
```

Open `http://localhost:3000` and start designing! 🎨
