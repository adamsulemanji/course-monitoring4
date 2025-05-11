import { Construct } from 'constructs';


export class CourseMonitoring4 extends Construct {

  constructor(scope: Construct, id: string) {
    super(scope, id);

   
  }
}

export * from './course-monitoring-stack';
export * from './ddb';
export * from './cognito';
export * from './eventbridge';
export * from './apigateway';
export * from './sns';
export * from './cloudfront';
