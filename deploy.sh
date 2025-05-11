#!/bin/bash
# Script to deploy the Course Monitoring application

set -e

# Default environment is dev
ENVIRONMENT=${1:-dev}

echo "Deploying Course Monitoring application to $ENVIRONMENT environment"

# Build the TypeScript code
echo "Building TypeScript..."
npm run build

# Prepare the deployment command
DEPLOY_CMD="cdk deploy CourseMonitoringStack-$ENVIRONMENT --require-approval never --context environment=$ENVIRONMENT"

# Execute the deployment
echo "Executing: $DEPLOY_CMD"
eval $DEPLOY_CMD

echo "Deployment completed successfully!" 