import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';

export class EventConstruct extends Construct {
    public eventRule: events.Rule;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // ********** Event bridge Creation **********
        this.eventRule = new events.Rule(this, 'Courses', {
            ruleName: 'CoursesEvent',
            schedule: events.Schedule.rate(cdk.Duration.minutes(5)),
            enabled: false,
        });
    }
}
