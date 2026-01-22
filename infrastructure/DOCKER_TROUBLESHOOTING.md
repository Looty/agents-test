# Docker Compose Troubleshooting Guide

## Issues Resolved - January 22, 2026

### Problem 1: UI Changes Not Applied (Cache Issue)

**Root Cause**: Docker was using cached layers from previous builds, not picking up new changes to source files.

**Symptoms**:
- UI changes made to `page.tsx` or other frontend files
- Website still looks the same after restart
- Old styles or components still showing

**Solution**:
```bash
# Force rebuild without cache
docker compose build --no-cache frontend
docker compose up -d
```

**Why It Happens**:
- Docker uses layer caching to speed up builds
- If file checksums appear same (timestamps ignored), Docker reuses cached layers
- Source code changes require a rebuild, not just a restart

**Prevention**:
- Always rebuild after source code changes
- Use `docker compose up --build` to rebuild on every start (slower but ensures freshness)

---

### Problem 2: Hardcoded API URL in Frontend

**Root Cause**: Frontend code had `http://localhost:8080` hardcoded instead of using the environment variable.

**Fixed In**: [services/frontend/src/app/page.tsx](../services/frontend/src/app/page.tsx#L24)

**Before**:
```tsx
const res = await fetch(`http://localhost:8080/weather?...`);
```

**After**:
```tsx
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
const res = await fetch(`${apiUrl}/weather?...`);
```

**Why This Matters**:
- In Docker, services communicate via service names (e.g., `backend:8080`)
- From browser (client-side), users access via `localhost:8081`
- Using environment variables makes the app configurable for different environments

---

### Problem 3: Missing CSS Files in Docker Build

**Root Cause**: `.dockerignore` was too aggressive, excluding necessary files.

**Dockerfile Change**: [services/frontend/Dockerfile](../services/frontend/Dockerfile#L13)
- Changed from explicitly copying each file to `COPY . .`
- Relies on `.dockerignore` to exclude unwanted files
- Ensures all source files (including `globals.css`) are included

**Updated .dockerignore**:
- Keeps test files excluded
- Keeps coverage, node_modules, .next excluded
- Allows all CSS and source files through

---

### Problem 4: Slow Frontend Startup Time

**Why It's Slow** (takes 40-60 seconds):

1. **Multi-Stage Build Process**:
   ```dockerfile
   FROM node:20-alpine AS builder  # Base image pull
   RUN npm ci                       # Install ~500-1000 packages (25-30s)
   RUN npm run build               # Next.js optimization (10-15s)
   RUN npm prune --production      # Remove dev dependencies (5s)
   FROM node:20-alpine             # New layer
   COPY --from=builder ...         # Copy artifacts (10-15s)
   ```

2. **Next.js Build Optimization**:
   - Static analysis of all pages and components
   - Bundle splitting and tree shaking
   - Image optimization
   - CSS extraction and minification
   - Production optimizations

3. **Docker Layer Operations**:
   - Each `COPY` and `RUN` creates a new layer
   - Layers are compressed and committed
   - Multi-stage builds require layer transfers between stages

**Trade-off**: This is **intentional** for production deployments:
- ✅ Smaller final image (~200MB vs ~1GB)
- ✅ Optimized performance at runtime
- ✅ No dev dependencies in production
- ✅ Better security posture
- ❌ Slower build times (40-60s)

**For Development**: Consider using dev mode instead:
```yaml
# docker-compose.dev.yml
frontend:
  build:
    target: development  # Skip production optimizations
  volumes:
    - ./services/frontend:/app  # Live reload
    - /app/node_modules
  command: npm run dev
```

---

## Common Docker Compose Commands

### Rebuild After Code Changes
```bash
# Rebuild specific service
docker compose build --no-cache frontend
docker compose build --no-cache backend

# Rebuild and restart
docker compose up --build -d
```

### Check Service Status
```bash
# List all services
docker compose ps

# Check health status
docker compose ps --format json | jq '.[] | {name:.Name, status:.Health}'
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f frontend
docker compose logs -f backend

# Last N lines
docker compose logs --tail 50 frontend
```

### Restart Services
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart frontend
docker compose restart backend
```

### Clean Up
```bash
# Stop and remove containers
docker compose down

# Remove volumes too (clears Redis data)
docker compose down -v

# Remove images
docker compose down --rmi all
```

### Debugging
```bash
# Execute command in running container
docker compose exec frontend sh
docker compose exec backend sh

# Check environment variables
docker compose exec frontend env | grep NEXT_PUBLIC
docker compose exec backend env | grep REDIS
```

---

## Service Access Points

After running `docker compose up -d`:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8081
- **Backend Health**: http://localhost:8081/health
- **Redis**: localhost:6379

---

## Build Time Optimization Tips

### 1. Use Build Cache Strategically
```dockerfile
# Copy package files first (changes less often)
COPY package*.json ./
RUN npm ci

# Copy source code last (changes often)
COPY . .
RUN npm run build
```

### 2. Use .dockerignore Effectively
- Exclude test files, coverage, node_modules
- Smaller context = faster transfers

### 3. Multi-Stage Builds
- Already implemented in our Dockerfile
- Keeps production image small

### 4. Parallel Builds
```bash
# Build all services in parallel
docker compose build --parallel
```

---

## Environment-Specific Configurations

### Development (Fast Iteration)
```yaml
frontend:
  volumes:
    - ./services/frontend:/app
    - /app/node_modules
  command: npm run dev
```

### Staging/Production (Optimized)
```yaml
frontend:
  build:
    dockerfile: Dockerfile
  # No volumes - baked into image
```

---

## When to Rebuild vs Restart

**Rebuild Required** (`docker compose build`):
- Source code changes (`.tsx`, `.ts`, `.go`, `.css`)
- Dependency changes (`package.json`, `go.mod`)
- Dockerfile changes
- Build arguments changes

**Restart Sufficient** (`docker compose restart`):
- Environment variable changes (if loaded at runtime)
- Configuration file changes (if mounted as volumes)
- Service health issues

---

## Troubleshooting Checklist

1. ❓ **Changes not showing up?**
   - Did you rebuild? → `docker compose build --no-cache [service]`
   - Check logs → `docker compose logs [service]`

2. ❓ **Service not starting?**
   - Check dependencies → Are backend and Redis healthy?
   - Check ports → Is something else using the port?
   - Check environment → Are required env vars set?

3. ❓ **API calls failing?**
   - Check network → Services in same Docker network?
   - Check URLs → Using correct service names or localhost?
   - Check CORS → Backend allowing frontend origin?

4. ❓ **Build taking too long?**
   - Expected for production builds (40-60s)
   - Use dev mode for faster iteration
   - Check Docker resources (CPU/memory limits)

---

## Performance Metrics

**Build Times** (on typical dev machine):
- Backend: ~15-20s (Go compilation)
- Frontend: ~40-60s (npm ci + Next.js build + multi-stage)
- Redis: <5s (pre-built image)

**Startup Times**:
- Redis: ~2s (health check ready)
- Backend: ~5-8s (wait for Redis + health check)
- Frontend: ~10-15s (wait for backend + Next.js startup)

**Total Stack Startup**: ~15-20s (if images already built)

---

## Related Documentation

- [Infrastructure README](./README.md) - Main infrastructure overview
- [DevOps Summary](./DEVOPS_SUMMARY.md) - Deployment strategies
- [Quick Reference](./QUICK_REFERENCE.md) - Common commands
