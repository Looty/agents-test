# Local Development Setup

## Prerequisites

- Docker & Docker Compose
- Go 1.21+
- Node.js 20+
- Redis (or use Docker)

## Quick Start with Docker Compose

### 1. Set Environment Variables

Create a `.env` file in the project root:

```bash
WEATHER_API_KEY=your_weatherapi_key_here
```

### 2. Start All Services

```bash
# Start all services (Redis, Backend, Frontend)
docker-compose up

# Or run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080
- **Redis**: localhost:6379

## Development Without Docker

### Backend Setup

```bash
cd services/backend

# Install dependencies
go mod download

# Set environment variables
export WEATHER_API_KEY=your_key
export REDIS_ADDR=localhost:6379

# Run Redis (in separate terminal)
redis-server

# Run backend
go run .

# Or build and run
go build -o backend .
./backend
```

Test endpoints:
- Health: `curl http://localhost:8080/health`
- Search: `curl http://localhost:8080/search?q=London`
- Weather: `curl http://localhost:8080/weather?location=London`

### Frontend Setup

```bash
cd services/frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
npm start
```

Open http://localhost:3000 in your browser.

## Running Tests

### Backend Tests
```bash
cd services/backend
go test -v ./...
go test -race -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

### Frontend Tests
```bash
cd services/frontend
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
npm run test:ui       # Interactive UI
```

## Development Tips

### Hot Reload
- **Backend**: Use `air` for hot reload
  ```bash
  go install github.com/cosmtrek/air@latest
  cd services/backend
  air
  ```

- **Frontend**: Next.js has built-in hot reload with `npm run dev`

### Debug Logging
- **Backend**: Set log level in code or via environment
- **Frontend**: Check browser console (React DevTools recommended)

### Redis CLI
```bash
# Connect to Redis
redis-cli

# View all keys
KEYS *

# Get a cached value
GET "London"

# Clear all cache
FLUSHALL
```

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Redis Connection Error
- Verify Redis is running: `redis-cli ping`
- Check connection string in `REDIS_ADDR`

### API Key Issues
- Verify your WeatherAPI.com key is valid
- Check API rate limits
- Test directly: `curl "http://api.weatherapi.com/v1/current.json?key=YOUR_KEY&q=London"`

## Environment Variables

### Backend
- `WEATHER_API_KEY` (required): WeatherAPI.com API key
- `REDIS_ADDR` (optional): Redis address, default `localhost:6379`

### Frontend
- `NEXT_PUBLIC_API_URL` (optional): Backend API URL, default `http://localhost:8080`

## Code Style

### Backend (Go)
```bash
# Format code
go fmt ./...

# Run linter
golangci-lint run
```

### Frontend (TypeScript/React)
```bash
# Run linter
npm run lint

# Format with Prettier (if configured)
npm run format
```

## Git Workflow

1. Create feature branch from `develop`
2. Make changes
3. Run tests
4. Commit with descriptive message
5. Push and create PR
6. Wait for CI checks to pass
7. Request review

## Performance Testing

### Backend Load Test (with Apache Bench)
```bash
# Test weather endpoint
ab -n 1000 -c 10 http://localhost:8080/weather?location=London

# Test search endpoint
ab -n 1000 -c 10 http://localhost:8080/search?q=London
```

### Frontend Performance
- Use Chrome DevTools Lighthouse
- Check Core Web Vitals
- Monitor bundle size: `npm run build` shows sizes

## VS Code Extensions (Recommended)

- **Go**: Official Go extension
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **Docker**: Docker file support
- **Thunder Client**: API testing

## Useful Commands

```bash
# Clean up Docker
docker-compose down -v    # Remove volumes
docker system prune -a    # Remove unused images

# Check service health
curl http://localhost:8080/health
curl http://localhost:3000

# Monitor logs in real-time
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a single service
docker-compose restart backend
docker-compose restart frontend
```
