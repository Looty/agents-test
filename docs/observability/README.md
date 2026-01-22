# Observability Strategy

**Owner:** DevOps

## Overview
This document outlines the observability strategy for the Weather Application, including logging, metrics, tracing, and alerting.

## Logging

### Log Levels
- **ERROR**: System errors requiring immediate attention
- **WARN**: Potential issues that should be monitored
- **INFO**: General operational events (API calls, cache hits/misses)
- **DEBUG**: Detailed debugging information (disabled in production)

### Log Format (JSON)
```json
{
  "timestamp": "2026-01-22T10:30:00Z",
  "level": "INFO",
  "service": "backend",
  "message": "Weather data fetched",
  "location": "London",
  "cache": "miss",
  "duration_ms": 234,
  "trace_id": "abc123"
}
```

### Retention
- **Production**: 30 days
- **Staging**: 14 days
- **Development**: 7 days

### Implementation
- Backend: Structured logging with Go's `log/slog` or `zap`
- Frontend: Browser console + error tracking (Sentry)
- Centralized: CloudWatch Logs or ELK stack

## Metrics (SLIs/SLOs)

### Service Level Indicators (SLIs)

#### Backend API
- **Request Rate**: Requests per second
- **Error Rate**: 4xx/5xx responses per total requests
- **Latency**: p50, p95, p99 response times
- **Cache Hit Rate**: Redis cache hits / total requests

#### Frontend
- **Page Load Time**: Time to interactive
- **API Call Latency**: Time from request to response
- **Error Rate**: JavaScript errors per session

### Service Level Objectives (SLOs)

| Metric | Target | Measurement Window |
|--------|--------|-------------------|
| API Availability | 99.5% | 30 days |
| API Latency (p95) | < 200ms | 5 minutes |
| Frontend Load Time | < 2s | 24 hours |
| Cache Hit Rate | > 80% | 1 hour |
| Error Rate | < 1% | 1 hour |

### Error Budget
- **Monthly Budget**: 0.5% downtime = ~3.6 hours/month
- **Policy**: If error budget exhausted, prioritize reliability over features

## Tracing

### Distributed Tracing
- **Tool**: OpenTelemetry or AWS X-Ray
- **Sampling**: 100% of errors, 10% of successful requests in production
- **Trace Context**: Propagated via HTTP headers (traceparent)

### Trace Spans
1. **Frontend → Backend**: HTTP request span
2. **Backend → Redis**: Cache lookup span
3. **Backend → WeatherAPI**: External API call span

### Critical Paths to Trace
- Search flow: User input → Autocomplete → Selection → Weather display
- Cache performance: Request → Cache check → API call (if miss)

## Alerting

### Alert Rules

#### Critical (PagerDuty)
- **Service Down**: 5xx error rate > 5% for 2 minutes
- **High Latency**: p95 latency > 500ms for 5 minutes
- **External API Failure**: WeatherAPI error rate > 10% for 3 minutes

#### Warning (Slack)
- **Cache Degradation**: Hit rate < 70% for 10 minutes
- **Elevated Error Rate**: 4xx rate > 5% for 5 minutes
- **High Memory Usage**: Container memory > 80% for 10 minutes

#### Info (Slack)
- **Deployment Success/Failure**
- **Daily Health Summary**

### Alert Format
```
[CRITICAL] Backend API - High 5xx Error Rate
Current: 7.3% | Threshold: 5%
Duration: 3 minutes
Runbook: https://wiki/runbooks/backend-5xx
Dashboard: https://grafana/backend
```

## Dashboards

### Backend Dashboard
- Request rate (RPS)
- Error rate by status code
- Latency percentiles (p50, p95, p99)
- Cache hit/miss rate
- Redis connection pool stats
- External API call success rate

### Frontend Dashboard
- Page load time distribution
- API call latency
- Error rate by type
- User sessions
- Geographic distribution

### Infrastructure Dashboard
- CPU/Memory usage per service
- Container restart count
- Auto-scaling events
- Network I/O

## Runbooks

### High Error Rate (5xx)
1. Check CloudWatch/Grafana for error spike timing
2. Review recent deployments (rollback if needed)
3. Check Redis connectivity and health
4. Verify WeatherAPI.com status
5. Scale up backend containers if CPU/memory constrained
6. Escalate to on-call engineer if unresolved in 15 min

### Cache Performance Degradation
1. Check Redis metrics (memory, connections, latency)
2. Verify cache TTL configuration (should be 15 min)
3. Check for hot keys or unusual traffic patterns
4. Consider scaling Redis instance
5. Monitor WeatherAPI rate limits

### External API Failures
1. Check WeatherAPI.com status page
2. Verify API key validity and rate limits
3. Review recent traffic patterns for unusual spikes
4. Consider serving stale cache data temporarily
5. Communicate to users via status page

## Monitoring Ownership

- **DevOps Team**: Infrastructure metrics, alerting, dashboards
- **Backend Team**: API metrics, cache performance
- **Frontend Team**: Client-side errors, performance
- **On-Call Rotation**: 24/7 coverage for critical alerts

## Tools

- **Metrics**: CloudWatch, Prometheus, Grafana
- **Logging**: CloudWatch Logs, ELK Stack
- **Tracing**: AWS X-Ray, OpenTelemetry
- **Alerting**: CloudWatch Alarms, PagerDuty
- **Error Tracking**: Sentry (frontend)
- **Uptime Monitoring**: Pingdom, UptimeRobot
