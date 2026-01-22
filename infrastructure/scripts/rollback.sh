#!/bin/bash
set -e

# Rollback to previous ECS task definition
# Usage: ./rollback.sh [environment] [backend|frontend|all]
# Example: ./rollback.sh production backend

ENVIRONMENT=${1:-staging}
SERVICE=${2:-all}

echo "================================================"
echo "Rollback Weather App"
echo "Environment: $ENVIRONMENT"
echo "Service: $SERVICE"
echo "================================================"

CLUSTER_NAME="weather-app-${ENVIRONMENT}"

rollback_service() {
    local service=$1
    local service_name="weather-app-${service}"
    
    echo "Rolling back ${service}..."
    
    # Get current task definition
    CURRENT_TASK_DEF=$(aws ecs describe-services \
        --cluster $CLUSTER_NAME \
        --services $service_name \
        --query 'services[0].taskDefinition' \
        --output text)
    
    echo "Current task definition: $CURRENT_TASK_DEF"
    
    # Extract family and revision
    FAMILY=$(echo $CURRENT_TASK_DEF | cut -d'/' -f2 | cut -d':' -f1)
    CURRENT_REVISION=$(echo $CURRENT_TASK_DEF | cut -d':' -f2)
    PREVIOUS_REVISION=$((CURRENT_REVISION - 1))
    
    if [ $PREVIOUS_REVISION -lt 1 ]; then
        echo "Error: No previous revision to rollback to"
        exit 1
    fi
    
    PREVIOUS_TASK_DEF="${FAMILY}:${PREVIOUS_REVISION}"
    
    echo "Rolling back to: $PREVIOUS_TASK_DEF"
    
    # Update service with previous task definition
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service $service_name \
        --task-definition $PREVIOUS_TASK_DEF \
        --force-new-deployment
    
    echo "Waiting for service to stabilize..."
    aws ecs wait services-stable \
        --cluster $CLUSTER_NAME \
        --services $service_name
    
    echo "${service} rolled back successfully!"
}

case $SERVICE in
    backend)
        rollback_service "backend"
        ;;
    frontend)
        rollback_service "frontend"
        ;;
    all)
        rollback_service "backend"
        rollback_service "frontend"
        ;;
    *)
        echo "Unknown service: $SERVICE"
        echo "Valid services: backend, frontend, all"
        exit 1
        ;;
esac

echo "================================================"
echo "Rollback completed"
echo "================================================"
