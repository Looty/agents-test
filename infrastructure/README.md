# Weather App Infrastructure

**Owner:** DevOps

This directory contains Infrastructure as Code (IaC) for the Weather Application, including Terraform configurations, deployment scripts, and CI/CD pipelines.

## Architecture Overview

- **Frontend**: Next.js app on AWS ECS Fargate
- **Backend**: Go API on AWS ECS Fargate
- **Cache**: AWS ElastiCache (Redis)
- **Load Balancing**: Application Load Balancers
- **Container Registry**: Amazon ECR
- **Secrets**: AWS Secrets Manager
- **Monitoring**: CloudWatch Logs and Container Insights
- **Auto-scaling**: CPU and memory-based scaling

## Directory Structure

```
infrastructure/
├── terraform/              # Terraform IaC
│   ├── main.tf            # Provider configuration
│   ├── variables.tf       # Input variables
│   ├── outputs.tf         # Output values
│   ├── vpc.tf             # VPC and networking
│   ├── security_groups.tf # Security groups
│   ├── ecs.tf             # ECS cluster and services
│   ├── redis.tf           # ElastiCache cluster
│   ├── secrets.tf         # Secrets Manager
│   ├── autoscaling.tf     # Auto-scaling policies
│   └── terraform.tfvars.example
└── scripts/
    ├── deploy.sh          # Deployment script
    ├── build-push.sh      # Build and push images
    └── rollback.sh        # Rollback script
```

## Prerequisites

- **Terraform**: >= 1.0
- **AWS CLI**: Configured with appropriate credentials
- **Docker**: For building images
- **Go**: 1.21+ (for backend development)
- **Node.js**: 20+ (for frontend development)

## Quick Start

### 1. Configure AWS Credentials

```bash
aws configure
# Or use environment variables
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_REGION=us-east-1
```

### 2. Set Up Terraform Variables

```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars and set your values
```

Required variables:
- `environment`: Environment name (dev, staging, production)
- `weather_api_key`: Your WeatherAPI.com API key

### 3. Initialize and Deploy Infrastructure

```bash
# Plan the deployment
./scripts/deploy.sh production plan

# Apply the deployment
./scripts/deploy.sh production apply
```

### 4. Build and Push Docker Images

```bash
# Build and push all services
./scripts/build-push.sh all latest

# Or build individually
./scripts/build-push.sh backend v1.0.0
./scripts/build-push.sh frontend v1.0.0
```

### 5. Deploy Services

The CI/CD pipeline automatically deploys on push to `main` or `develop` branches. 

For manual deployment:

```bash
# Update ECS services
aws ecs update-service \
  --cluster weather-app-production \
  --service weather-app-backend \
  --force-new-deployment

aws ecs update-service \
  --cluster weather-app-production \
  --service weather-app-frontend \
  --force-new-deployment
```

## Environment Configuration

### Development/Staging
- **Cluster**: 2 tasks per service
- **CPU**: 256 units per task
- **Memory**: 512 MB per task
- **Redis**: cache.t3.micro
- **Auto-scaling**: Disabled

### Production
- **Cluster**: 3-10 tasks per service (auto-scaled)
- **CPU**: 512 units per task
- **Memory**: 1024 MB per task
- **Redis**: cache.t3.small
- **Auto-scaling**: Enabled (CPU 70%, Memory 80%)

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci-cd.yml`):

1. **Test Backend**: Run Go tests
2. **Test Frontend**: Run npm tests and build
3. **Build & Push**: Build Docker images and push to ECR
4. **Deploy Staging**: Auto-deploy on `develop` branch
5. **Deploy Production**: Auto-deploy on `main` branch

### Required Secrets

Configure in GitHub repository settings:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## Monitoring & Observability

### Logs
- **Location**: CloudWatch Logs
- **Groups**: 
  - `/ecs/weather-app-backend-{environment}`
  - `/ecs/weather-app-frontend-{environment}`
- **Retention**: 30 days (production), 14 days (staging)

### Metrics
- **Container Insights**: Enabled on ECS cluster
- **CloudWatch Metrics**: CPU, Memory, Network I/O
- **Custom Metrics**: Request rate, error rate, latency

### Health Checks
- **Backend**: `GET /health` - Returns Redis connectivity status
- **Frontend**: `GET /` - Returns 200 if app is running
- **Interval**: 30 seconds
- **Timeout**: 5 seconds

## Deployment Strategies

### Blue/Green Deployment
ECS automatically performs rolling updates with health checks.

### Canary Deployment
1. Update task definition with new image
2. Set desired count to 1 (canary)
3. Monitor metrics for 10 minutes
4. Scale up if healthy, rollback if issues

### Rollback

```bash
# Rollback to previous task definition
./scripts/rollback.sh production backend
./scripts/rollback.sh production frontend
./scripts/rollback.sh production all
```

## Disaster Recovery

### Backup Strategy
- **Redis**: Automated snapshots (daily)
- **ECS Task Definitions**: Versioned automatically
- **Infrastructure State**: Terraform state in S3 (optional)

### Recovery Time Objective (RTO)
- **Application**: < 15 minutes
- **Data (Redis)**: < 5 minutes

### Recovery Point Objective (RPO)
- **Redis Cache**: 0 (ephemeral, can be rebuilt)

## Cost Optimization

### Current Monthly Estimate (Production)
- **ECS Fargate** (6 tasks): ~$50
- **ALB** (2 instances): ~$40
- **ElastiCache** (1 node): ~$15
- **NAT Gateway** (2 AZs): ~$65
- **Data Transfer**: ~$10
- **Total**: ~$180/month

### Savings Opportunities
1. Use Spot instances for non-critical environments
2. Right-size tasks based on metrics
3. Use single NAT gateway for non-prod
4. Enable S3 VPC endpoint to reduce data transfer

## Security Best Practices

- ✅ Secrets stored in AWS Secrets Manager
- ✅ Private subnets for compute resources
- ✅ Security groups with least privilege
- ✅ Container image scanning enabled
- ✅ IAM roles with minimal permissions
- ✅ HTTPS termination at ALB (configure SSL certificates)
- ✅ VPC Flow Logs for network monitoring

## Troubleshooting

### Service Won't Start
1. Check CloudWatch Logs for errors
2. Verify environment variables
3. Check Redis connectivity
4. Review security group rules

### High Latency
1. Check cache hit rate in logs
2. Monitor Redis CPU/memory
3. Review auto-scaling policies
4. Check WeatherAPI.com rate limits

### Deployment Failures
1. Check ECS service events
2. Verify task definition
3. Check health check configuration
4. Review security group rules

## Maintenance Windows

- **Preferred**: Sunday 2-4 AM EST
- **Emergency**: Any time with approval

## Runbooks

See [docs/observability/README.md](../docs/observability/README.md) for detailed runbooks.

## Support

- **DevOps Team**: devops@example.com
- **On-Call**: Use PagerDuty
- **Documentation**: [Architecture Docs](../docs/architecture/README.md)

## Contributing

1. Create feature branch
2. Update Terraform configurations
3. Run `terraform fmt` and `terraform validate`
4. Test in dev environment first
5. Create pull request with detailed description
6. Get approval from DevOps team lead

## License

Internal use only - Proprietary
