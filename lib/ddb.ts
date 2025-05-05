import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DynamoDBConstruct extends Construct {
    public readonly users: dynamodb.Table;  
    public readonly classes: dynamodb.Table;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // ****** Create a DynamoDB Table ******
        this.users = new dynamodb.Table(this, 'UserTable', {
            tableName: 'Course-Users',
            partitionKey: {
                name: 'user_id',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });

        // ****** Create a DynamoDB Table ******
        this.classes = new dynamodb.Table(this, 'ClassTable', {
            tableName: 'Course-Classes',
            partitionKey: {
                name: 'class_id',
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: { name: 'user_id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });
    }
}
