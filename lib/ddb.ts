import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DynamoDBConstruct extends Construct {
    public readonly users: dynamodb.Table;  
    public readonly classes: dynamodb.Table;
    public readonly userCourses: dynamodb.Table;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Users table to store user information
        this.users = new dynamodb.Table(this, 'UserTable', {
            tableName: 'Course-Users',
            partitionKey: {
                name: 'user_id',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });

        // Classes table to store class information (one record per unique class)
        this.classes = new dynamodb.Table(this, 'ClassTable', {
            tableName: 'Course-Classes',
            partitionKey: {
                name: 'class_id',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });
        
        // Add GSI for fast queries on semester, year
        this.classes.addGlobalSecondaryIndex({
            indexName: 'semester-year-index',
            partitionKey: {
                name: 'semester',
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: 'year',
                type: dynamodb.AttributeType.NUMBER,
            },
        });
        
        // User-Course mapping table for tracking which users follow which courses
        this.userCourses = new dynamodb.Table(this, 'UserCourseTable', {
            tableName: 'Course-UserCourses',
            partitionKey: {
                name: 'user_id',
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: 'class_id',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });
        
        // Add GSI for querying by class_id
        this.userCourses.addGlobalSecondaryIndex({
            indexName: 'class-users-index',
            partitionKey: {
                name: 'class_id',
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: 'user_id',
                type: dynamodb.AttributeType.STRING,
            },
        });
    }
}
