# Staging Environment
environment = "staging"
aws_region  = "us-east-1"

# Network
vpc_cidr           = "10.1.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b"]

# Backend
backend_desired_count = 2
backend_cpu           = 256
backend_memory        = 512

# Frontend
frontend_desired_count = 2
frontend_cpu           = 256
frontend_memory        = 512

# Redis
redis_node_type = "cache.t3.micro"

# Auto Scaling
enable_autoscaling = true
min_capacity       = 2
max_capacity       = 5

# Secrets (set via environment variable or CLI)
# weather_api_key = "your-api-key-here"
