# Production Environment
environment = "production"
aws_region  = "us-east-1"

# Network
vpc_cidr           = "10.2.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

# Backend
backend_desired_count = 3
backend_cpu           = 512
backend_memory        = 1024

# Frontend
frontend_desired_count = 3
frontend_cpu           = 512
frontend_memory        = 1024

# Redis
redis_node_type = "cache.t3.small"

# Auto Scaling
enable_autoscaling = true
min_capacity       = 3
max_capacity       = 10

# Secrets (set via environment variable or CLI)
# weather_api_key = "your-api-key-here"
