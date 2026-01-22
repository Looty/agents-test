# Docker Compose Fixes Applied

## Latest Fixes - January 22, 2026

### 1. Fixed Hardcoded API URL in Frontend
**Problem**: Frontend had `http://localhost:8080` hardcoded, not respecting environment variables
**Fix**: Updated `page.tsx` to use `process.env.NEXT_PUBLIC_API_URL` with fallback to `http://localhost:8081`
**Impact**: Frontend now works correctly in Docker environment

### 2. Fixed Docker Build Not Picking Up Changes
**Problem**: UI changes weren't reflected after rebuild due to overly specific COPY commands
**Fix**: Changed Dockerfile to use `COPY . .` and rely on `.dockerignore` for exclusions
**Impact**: All source files (including CSS) now properly included in builds

### 3. Corrected API URL in docker-compose.yml
**Problem**: Frontend environment variable pointed to `http://backend:8080` (internal Docker network)
**Fix**: Changed to `http://localhost:8081` since Next.js API calls are client-side (browser)
**Impact**: API calls now work from browser

### 4. Optimized .dockerignore
**Problem**: Too aggressive exclusions
**Fix**: Properly structured to exclude only test files, coverage, and node_modules
**Impact**: All necessary source files included without bloat

---

## Previous Fixes

### 1. Go Version Mismatch
**Problem**: `go.mod` specified `go 1.25.5` which doesn't exist
**Fix**: Changed to `go 1.21` to match the Dockerfile's `golang:1.21-alpine` base image

### 2. Frontend Build Including Test Files
**Problem**: Test files were being included in the production build, causing TypeScript errors (`vi` is not defined)
**Fix**: 
- Created `.dockerignore` file to exclude test files, coverage, and vitest config
- Modified Dockerfile to explicitly copy only necessary files
- Changed `npm ci --only=production` to `npm ci` (need dev dependencies for build) then `npm prune --production` after build

### 3. Port Conflict
**Problem**: Port 8080 was already in use by Open WebUI
**Fix**: Changed backend port mapping from `8080:8080` to `8081:8080` in docker-compose.yml

### 4. Missing Environment Variable
**Problem**: WEATHER_API_KEY warning on every command
**Fix**: Created `.env` file with placeholder for API key

## Services Status

All services are now **running and healthy**:

```
✅ test-redis-1      - Port 6379 (Redis cache)
✅ test-backend-1    - Port 8081 → 8080 (Go API)
✅ test-frontend-1   - Port 3000 (Next.js)
```

## Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8081
- **Backend Health**: http://localhost:8081/health
- **Redis**: localhost:6379

## Next Steps

1. Add your WeatherAPI.com API key to `.env`:
   ```bash
   WEATHER_API_KEY=your-actual-api-key-here
   ```

2. Restart services to pick up the API key:
   ```bash
   docker compose restart backend
   ```

3. Test the application in your browser at http://localhost:3000

## Files Modified

- `/services/backend/go.mod` - Fixed Go version
- `/services/frontend/Dockerfile` - Exclude test files from build
- `/services/frontend/.dockerignore` - Created to exclude test files
- `/docker-compose.yml` - Changed backend port mapping
- `/.env` - Created for environment variables
