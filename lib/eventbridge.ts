import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class EventBridgeConstruct extends Construct {
    public eventRule: events.Rule;

    constructor(scope: Construct, id: string, lambdaFunction: lambda.Function) {
        super(scope, id);

        // Create EventBridge rule that runs every 3 minutes
        this.eventRule = new events.Rule(this, 'CourseCheckSchedule', {
            ruleName: 'CoursesCheckRule',
            schedule: events.Schedule.rate(cdk.Duration.minutes(3)),
            enabled: true, // Enable by default
        });
        
        // Add target to invoke the Lambda function directly with a specific event
        this.eventRule.addTarget(
            new targets.LambdaFunction(lambdaFunction, {
                event: events.RuleTargetInput.fromObject({
                    path: '/check-courses',
                    httpMethod: 'POST',
                    body: JSON.stringify({
                        source: 'EventBridge',
                        detail: 'Scheduled course availability check'
                    })
                })
            })
        );
    }
}
