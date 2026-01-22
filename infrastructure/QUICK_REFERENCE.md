# DevOps Quick Reference

## 🚀 Common Operations

### Local Development
```bash
# Start all services
docker-compose up

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend
```

### Deploy Infrastructure
```bash
# Preview changes
cd infrastructure
./scripts/deploy.sh production plan

# Apply changes
./scripts/deploy.sh production apply

# Destroy (careful!)
./scripts/deploy.sh production destroy
```

### Build & Push Images
```bash
# Build and push all services
./infrastructure/scripts/build-push.sh all latest

# Build specific service
./infrastructure/scripts/build-push.sh backend v1.2.3
```

### Deploy Application
```bash
# Manual deployment
aws ecs update-service \
  --cluster weather-app-production \
  --service weather-app-backend \
  --force-new-deployment
```

### Rollback
```bash
# Rollback backend
./infrastructure/scripts/rollback.sh production backend

# Rollback all services
./infrastructure/scripts/rollback.sh production all
```

## 🔍 Monitoring

### View Logs
```bash
# Backend logs
aws logs tail /ecs/weather-app-backend-production --follow

# Frontend logs
aws logs tail /ecs/weather-app-frontend-production --follow
```

### Check Service Status
```bash
# List services
aws ecs list-services --cluster weather-app-production

# Describe service
aws ecs describe-services \
  --cluster weather-app-production \
  --services weather-app-backend
```

### CloudWatch Metrics
```bash
# Get CPU utilization
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=weather-app-backend \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T23:59:59Z \
  --period 3600 \
  --statistics Average
```

## 🐛 Troubleshooting

### Service Not Starting
```bash
# Check task events
aws ecs describe-services \
  --cluster weather-app-production \
  --services weather-app-backend \
  --query 'services[0].events'

# Check task logs
aws logs tail /ecs/weather-app-backend-production --since 10m
```

### High Error Rate
```bash
# Check recent errors in logs
aws logs filter-pattern '"ERROR"' \
  --log-group-name /ecs/weather-app-backend-production \
  --start-time $(date -u -d '1 hour ago' +%s)000
```

### Redis Issues
```bash
# Connect to Redis
redis-cli -h <redis-endpoint> -p 6379

# Check Redis info
INFO

# Check cache keys
KEYS *

# Clear cache
FLUSHALL
```

## 📊 Useful Queries

### Get Current Task Count
```bash
aws ecs describe-services \
  --cluster weather-app-production \
  --services weather-app-backend \
  --query 'services[0].runningCount'
```

### Get Load Balancer DNS
```bash
aws elbv2 describe-load-balancers \
  --names weather-app-frontend-production \
  --query 'LoadBalancers[0].DNSName'
```

### Get Latest Task Definition
```bash
aws ecs describe-task-definition \
  --task-definition weather-app-backend-production \
  --query 'taskDefinition.revision'
```

## 🔐 Security

### Rotate API Key
```bash
# Update secret in Secrets Manager
aws secretsmanager update-secret \
  --secret-id weather-app-api-key-production \
  --secret-string "new-api-key-here"

# Force deployment to pick up new secret
aws ecs update-service \
  --cluster weather-app-production \
  --service weather-app-backend \
  --force-new-deployment
```

### View Security Group Rules
```bash
# List security groups
aws ec2 describe-security-groups \
  --filters "Name=tag:Project,Values=weather-app"
```

## 📈 Scaling

### Manual Scaling
```bash
# Scale backend to 5 tasks
aws ecs update-service \
  --cluster weather-app-production \
  --service weather-app-backend \
  --desired-count 5
```

### Update Auto-Scaling
```bash
# Update max capacity
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/weather-app-production/weather-app-backend \
  --min-capacity 3 \
  --max-capacity 15
```

## 🔄 CI/CD

### Trigger Manual Deployment
```bash
# Via GitHub CLI
gh workflow run ci-cd.yml -f environment=production
```

### Check Workflow Status
```bash
gh run list --workflow=ci-cd.yml --limit 5
```

## 💾 Backup & Restore

### Create Redis Snapshot
```bash
aws elasticache create-snapshot \
  --cache-cluster-id weather-app-production \
  --snapshot-name backup-$(date +%Y%m%d-%H%M%S)
```

### List Snapshots
```bash
aws elasticache describe-snapshots \
  --cache-cluster-id weather-app-production
```

## 📞 Emergency Contacts

- **On-Call DevOps**: PagerDuty
- **Slack**: #devops-alerts
- **Runbooks**: docs/observability/README.md
