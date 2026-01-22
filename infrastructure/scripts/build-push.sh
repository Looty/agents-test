#!/bin/bash
set -e

# Build and push Docker images to ECR
# Usage: ./build-push.sh [backend|frontend|all] [tag]
# Example: ./build-push.sh all v1.0.0

SERVICE=${1:-all}
TAG=${2:-latest}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$SCRIPT_DIR/../.."

echo "================================================"
echo "Building and pushing Docker images"
echo "Service: $SERVICE"
echo "Tag: $TAG"
echo "================================================"

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}

# ECR login
echo "Logging in to Amazon ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

build_and_push() {
    local service=$1
    local ecr_repo="weather-app-${service}"
    local context="$REPO_ROOT/services/${service}"
    
    echo "Building $service..."
    docker build -t $ecr_repo:$TAG $context
    
    echo "Tagging $service..."
    docker tag $ecr_repo:$TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ecr_repo:$TAG
    docker tag $ecr_repo:$TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ecr_repo:latest
    
    echo "Pushing $service..."
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ecr_repo:$TAG
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ecr_repo:latest
    
    echo "$service pushed successfully!"
}

case $SERVICE in
    backend)
        build_and_push "backend"
        ;;
    frontend)
        build_and_push "frontend"
        ;;
    all)
        build_and_push "backend"
        build_and_push "frontend"
        ;;
    *)
        echo "Unknown service: $SERVICE"
        echo "Valid services: backend, frontend, all"
        exit 1
        ;;
esac

echo "================================================"
echo "Build and push completed"
echo "================================================"
