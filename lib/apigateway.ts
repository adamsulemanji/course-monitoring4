import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';

export interface ApiGatewayConstructProps {
    cognitoUserPoolId: string;
    cognitoAppClientId: string;
    classesTableName: string;
    usersTableName: string;
    userCoursesTableName: string;
    snsTopicArn: string;
}

export class ApiGatewayConstruct extends Construct {
    public readonly api: apigateway.RestApi;
    public readonly lambdaFunction: lambda.Function;
    
    constructor(scope: Construct, id: string, props: ApiGatewayConstructProps) {
        super(scope, id);
        
        // Create a log group for the Lambda function
        const logGroup = new logs.LogGroup(this, 'CourseMonitoringLogGroup', {
            logGroupName: '/aws/lambda/course-monitoring-api',
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            retention: logs.RetentionDays.ONE_WEEK
        });
        
        // Create an IAM role for the Lambda function
        const lambdaRole = new iam.Role(this, 'CourseMonitoringLambdaRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            description: 'Role for Course Monitoring Lambda function'
        });
        
        // Add permissions to access DynamoDB
        lambdaRole.addToPolicy(new iam.PolicyStatement({
            actions: [
                'dynamodb:GetItem',
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
                'dynamodb:Query',
                'dynamodb:Scan'
            ],
            resources: [
                `arn:aws:dynamodb:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:table/${props.classesTableName}`,
                `arn:aws:dynamodb:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:table/${props.usersTableName}`,
                `arn:aws:dynamodb:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:table/${props.userCoursesTableName}`,
                `arn:aws:dynamodb:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:table/${props.classesTableName}/index/*`,
                `arn:aws:dynamodb:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:table/${props.usersTableName}/index/*`,
                `arn:aws:dynamodb:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:table/${props.userCoursesTableName}/index/*`
            ]
        }));
        
        // Add permissions to access Cognito
        lambdaRole.addToPolicy(new iam.PolicyStatement({
            actions: [
                'cognito-idp:AdminInitiateAuth',
                'cognito-idp:AdminCreateUser',
                'cognito-idp:AdminSetUserPassword',
                'cognito-idp:AdminGetUser',
                'cognito-idp:AdminUpdateUserAttributes',
                'cognito-idp:AdminConfirmSignUp',
                'cognito-idp:ForgotPassword',
                'cognito-idp:ConfirmForgotPassword',
                'cognito-idp:AdminRespondToAuthChallenge'
            ],
            resources: [`arn:aws:cognito-idp:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:userpool/${props.cognitoUserPoolId}`]
        }));
        
        // Add permissions to access CloudWatch Logs
        lambdaRole.addToPolicy(new iam.PolicyStatement({
            actions: [
                'logs:CreateLogGroup',
                'logs:CreateLogStream',
                'logs:PutLogEvents'
            ],
            resources: ['*']
        }));
        
        // Add permissions to publish to SNS
        lambdaRole.addToPolicy(new iam.PolicyStatement({
            actions: [
                'sns:Publish',
                'sns:Subscribe'
            ],
            resources: [props.snsTopicArn]
        }));
        
        // Create the Lambda function using the Docker image
        this.lambdaFunction = new lambda.DockerImageFunction(this, 'CourseMonitoringLambda', {
            code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../api')),
            timeout: cdk.Duration.seconds(30),
            memorySize: 512,
            environment: {
                AWS_REGION_NAME: cdk.Aws.REGION,
                AWS_COGNITO_USER_POOL_ID: props.cognitoUserPoolId,
                AWS_COGNITO_APP_CLIENT_ID: props.cognitoAppClientId,
                CLASSES_TABLE_NAME: props.classesTableName,
                USERS_TABLE_NAME: props.usersTableName,
                USER_COURSES_TABLE_NAME: props.userCoursesTableName,
                SNS_TOPIC_ARN: props.snsTopicArn
            },
            role: lambdaRole,
            description: 'Lambda function for Course Monitoring API'
        });
        
        // Create the API Gateway
        this.api = new apigateway.LambdaRestApi(this, 'CourseMonitoringApi', {
            handler: this.lambdaFunction,
            proxy: true,
            restApiName: 'Course Monitoring API',
            description: 'API for Course Monitoring application',
            deployOptions: {
                stageName: 'prod',
                loggingLevel: apigateway.MethodLoggingLevel.INFO,
                dataTraceEnabled: true
            }
        });
    }
} 