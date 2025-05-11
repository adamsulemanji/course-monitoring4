import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

export class SNSConstruct extends Construct {
    public readonly courseNotificationTopic: sns.Topic;
    
    constructor(scope: Construct, id: string) {
        super(scope, id);
        
        // Create SNS topic for course notifications
        this.courseNotificationTopic = new sns.Topic(this, 'CourseNotificationTopic', {
            topicName: 'course-notifications',
            displayName: 'Course Notifications'
        });
        
        // Create a role that allows the ECS task to publish to SNS
        const snsPublishRole = new iam.Role(this, 'SNSPublishRole', {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
            description: 'Role that allows ECS tasks to publish to SNS'
        });
        
        // Grant publish permissions to the role
        this.courseNotificationTopic.grantPublish(snsPublishRole);
    }
    
    // Helper method to subscribe an email to the topic
    public addEmailSubscription(email: string): void {
        this.courseNotificationTopic.addSubscription(
            new subs.EmailSubscription(email)
        );
    }
    
    // Helper method to subscribe an SMS to the topic
    public addSmsSubscription(phoneNumber: string): void {
        this.courseNotificationTopic.addSubscription(
            new subs.SmsSubscription(phoneNumber)
        );
    }
} 