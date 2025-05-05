// import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface CourseMonitoring4Props {
  // Define construct properties here
}

export class CourseMonitoring4 extends Construct {

  constructor(scope: Construct, id: string, props: CourseMonitoring4Props = {}) {
    super(scope, id);

    // Define construct contents here

    // example resource
    // const queue = new sqs.Queue(this, 'CourseMonitoring4Queue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
