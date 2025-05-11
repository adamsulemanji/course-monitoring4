# Course Monitoring Application

This application helps users track course availability and receive notifications when courses become available for registration.

## Features

- User authentication with AWS Cognito
- Add courses to track (with CRN, Year, and Semester)
- Automatic checking of course availability every 3 minutes
- Notifications when courses become available
- Web scraping to check course availability

## Architecture

The application has the following components:

- **FastAPI Backend**: Handles the API requests for course tracking through AWS Lambda
- **AWS Cognito**: Manages user authentication
- **DynamoDB**: Stores course and user data
- **EventBridge**: Triggers course availability checking every 3 minutes
- **SNS**: Sends notifications when courses become available
- **API Gateway**: Routes requests to the Lambda function
- **Lambda**: Executes the FastAPI application in a serverless environment

## Development Setup

### Prerequisites

- Node.js and npm
- AWS CDK CLI (`npm install -g aws-cdk`)
- AWS CLI configured with appropriate credentials
- Docker (for local testing and building Lambda container images)
- Python 3.9+

### Install Dependencies

```bash
# Install CDK dependencies
npm install

# Install Python dependencies for local development
cd api
pip install -r requirements.txt
cd ..
```

### Local Development

1. Run the FastAPI app locally:

```bash
cd api
uvicorn main:app --reload
```

2. Test the API endpoints at http://localhost:8000/docs

### Running with Docker

You can also run the application using Docker:

```bash
cd api
docker build -t course-monitoring-api .
docker run -p 8000:8000 \
  -e AWS_REGION_NAME=us-east-1 \
  -e CLASSES_TABLE_NAME=Course-Classes \
  -e USERS_TABLE_NAME=Course-Users \
  -e USER_COURSES_TABLE_NAME=Course-UserCourses \
  course-monitoring-api
```

## Deployment

### AWS CDK Deployment

The application is deployed using AWS CDK, which provisions all necessary AWS resources.

```bash
# Simple deployment to dev environment
./deploy.sh dev

# Deployment to production environment
./deploy.sh prod
```

Alternatively, you can use CDK commands directly:

```bash
# Build the CDK code
npm run build

# Deploy to a specific environment
cdk deploy CourseMonitoringStack-dev --context environment=dev

# Deploy to production
cdk deploy CourseMonitoringStack-prod --context environment=prod
```

### Resources Created

The deployment creates the following AWS resources:

1. DynamoDB tables:
   - Course-Users: Stores user information
   - Course-Classes: Stores course information
   - Course-UserCourses: Maps users to the courses they're tracking

2. AWS Lambda function running the FastAPI application in a container

3. API Gateway for exposing the Lambda function

4. Cognito User Pool for authentication

5. EventBridge rule that runs every 3 minutes to check course availability

6. SNS Topic for sending notifications

## API Endpoints

- **Auth**: `/auth/signup`, `/auth/signin`, etc. - Authentication endpoints
- **Courses**: `/courses` - Add and manage tracked courses
- **Notifications**: `/notifications/subscribe` - Subscribe to notifications

## Monitoring and Logs

Logs from the Lambda function can be found in CloudWatch Logs under:
`/aws/lambda/course-monitoring-api`

## License

MIT
