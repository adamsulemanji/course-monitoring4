#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CourseMonitoringStack } from '../lib/course-monitoring-stack';

const app = new cdk.App();

// Get environment value from context or use default
const environment = app.node.tryGetContext('environment') || 'dev';

// Create the stack
new CourseMonitoringStack(app, `CourseMonitoringStack-${environment}`, {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1' 
  },
  description: `Course Monitoring Application - ${environment.toUpperCase()} Environment`,
  environment: environment
}); 