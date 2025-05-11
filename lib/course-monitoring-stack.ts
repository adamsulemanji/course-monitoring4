import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DynamoDBConstruct } from './ddb';
import { CognitoConstruct } from './cognito';
import { ApiGatewayConstruct } from './apigateway';
import { EventBridgeConstruct } from './eventbridge';
import { SNSConstruct } from './sns';

export interface CourseMonitoringStackProps extends cdk.StackProps {
    environment?: string;
}

export class CourseMonitoringStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: CourseMonitoringStackProps) {
        super(scope, id, props);
        
        const env = props?.environment || 'dev';
        
        // Create DynamoDB tables
        const dynamoDb = new DynamoDBConstruct(this, 'DynamoDB');
        
        // Create Cognito user pool
        const cognito = new CognitoConstruct(this, 'Cognito');
        
        // Create Cognito app client
        const userPoolClient = cognito.userPool.addClient('course-monitoring-client', {
            authFlows: {
                userPassword: true,
                userSrp: true,
                adminUserPassword: true
            },
            generateSecret: false
        });
        
        // Create SNS for notifications
        const sns = new SNSConstruct(this, 'SNS');
        
        // Create API Gateway with Lambda function
        const api = new ApiGatewayConstruct(this, 'ApiGateway', {
            cognitoUserPoolId: cognito.userPool.userPoolId,
            cognitoAppClientId: userPoolClient.userPoolClientId,
            classesTableName: dynamoDb.classes.tableName,
            usersTableName: dynamoDb.users.tableName,
            userCoursesTableName: dynamoDb.userCourses.tableName,
            snsTopicArn: sns.courseNotificationTopic.topicArn
        });
        
        // Create EventBridge rule to trigger course checking lambda function
        const eventBridge = new EventBridgeConstruct(this, 'EventBridge', api.lambdaFunction);
        
        // Output important resource information
        new cdk.CfnOutput(this, 'UserPoolId', {
            value: cognito.userPool.userPoolId,
            description: 'Cognito User Pool ID'
        });
        
        new cdk.CfnOutput(this, 'UserPoolClientId', {
            value: userPoolClient.userPoolClientId,
            description: 'Cognito User Pool Client ID'
        });
        
        new cdk.CfnOutput(this, 'ApiEndpoint', {
            value: api.api.url,
            description: 'API Gateway Endpoint URL'
        });
        
        new cdk.CfnOutput(this, 'ApiGatewayId', {
            value: api.api.restApiId,
            description: 'API Gateway ID'
        });
        
        new cdk.CfnOutput(this, 'SNSTopicArn', {
            value: sns.courseNotificationTopic.topicArn,
            description: 'SNS Topic ARN for Course Notifications'
        });
        
        new cdk.CfnOutput(this, 'LambdaFunctionName', {
            value: api.lambdaFunction.functionName,
            description: 'Lambda Function Name'
        });
    }
} 