# Development Environment
environment = "dev"
aws_region  = "us-east-1"

# Network
vpc_cidr           = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b"]

# Backend
backend_desired_count = 1
backend_cpu           = 256
backend_memory        = 512

# Frontend
frontend_desired_count = 1
frontend_cpu           = 256
frontend_memory        = 512

# Redis
redis_node_type = "cache.t3.micro"

# Auto Scaling
enable_autoscaling = false
min_capacity       = 1
max_capacity       = 2

# Secrets (set via environment variable or CLI)
# weather_api_key = "your-api-key-here"
