#!/bin/bash
set -e

# Deploy Weather App Infrastructure
# Usage: ./deploy.sh [environment] [action]
# Example: ./deploy.sh production apply

ENVIRONMENT=${1:-staging}
ACTION=${2:-plan}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$SCRIPT_DIR/../terraform"

echo "================================================"
echo "Weather App Deployment"
echo "Environment: $ENVIRONMENT"
echo "Action: $ACTION"
echo "================================================"

# Check required tools
command -v terraform >/dev/null 2>&1 || { echo "Error: terraform is required but not installed."; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "Error: aws CLI is required but not installed."; exit 1; }

# Check AWS credentials
if ! aws sts get-caller-identity &>/dev/null; then
    echo "Error: AWS credentials not configured"
    exit 1
fi

cd "$TERRAFORM_DIR"

# Initialize Terraform
echo "Initializing Terraform..."
terraform init

# Validate configuration
echo "Validating Terraform configuration..."
terraform validate

# Select or create workspace
echo "Selecting workspace: $ENVIRONMENT..."
terraform workspace select "$ENVIRONMENT" 2>/dev/null || terraform workspace new "$ENVIRONMENT"

# Create tfvars file if it doesn't exist
if [ ! -f "environments/${ENVIRONMENT}.tfvars" ]; then
    echo "Warning: environments/${ENVIRONMENT}.tfvars not found"
    echo "Using default terraform.tfvars"
fi

# Run Terraform command
case $ACTION in
    plan)
        echo "Running Terraform plan..."
        if [ -f "environments/${ENVIRONMENT}.tfvars" ]; then
            terraform plan -var-file="environments/${ENVIRONMENT}.tfvars"
        else
            terraform plan -var="environment=${ENVIRONMENT}"
        fi
        ;;
    apply)
        echo "Applying Terraform changes..."
        if [ -f "environments/${ENVIRONMENT}.tfvars" ]; then
            terraform apply -var-file="environments/${ENVIRONMENT}.tfvars" -auto-approve
        else
            terraform apply -var="environment=${ENVIRONMENT}" -auto-approve
        fi
        echo "Deployment complete!"
        echo "Fetching outputs..."
        terraform output
        ;;
    destroy)
        echo "WARNING: This will destroy all resources in $ENVIRONMENT!"
        read -p "Are you sure? (type 'yes' to confirm): " confirm
        if [ "$confirm" = "yes" ]; then
            if [ -f "environments/${ENVIRONMENT}.tfvars" ]; then
                terraform destroy -var-file="environments/${ENVIRONMENT}.tfvars" -auto-approve
            else
                terraform destroy -var="environment=${ENVIRONMENT}" -auto-approve
            fi
            echo "Resources destroyed."
        else
            echo "Destroy cancelled."
        fi
        ;;
    output)
        terraform output
        ;;
    *)
        echo "Unknown action: $ACTION"
        echo "Valid actions: plan, apply, destroy, output"
        exit 1
        ;;
esac

echo "================================================"
echo "Deployment script completed"
echo "================================================"
