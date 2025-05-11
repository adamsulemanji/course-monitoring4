import boto3
import json
import os
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class NotificationService:
    @staticmethod
    def send_course_notification(user_id: str, user_email: str, course_data: Dict[str, Any]):
        """Send a notification when a course becomes available"""
        try:
            sns = boto3.client('sns', region_name=os.environ.get('AWS_REGION_NAME', 'us-east-1'))
            topic_arn = os.environ.get('SNS_TOPIC_ARN')
            
            if not topic_arn:
                logger.error("SNS_TOPIC_ARN not configured")
                return
            
            # Create the message
            message = {
                'user_id': user_id,
                'email': user_email,
                'course': {
                    'class_id': course_data.get('class_id'),
                    'crn': course_data.get('crn'),
                    'year': course_data.get('year'),
                    'semester': course_data.get('semester')
                },
                'message': f"Good news! Your tracked course {course_data.get('crn')} for {course_data.get('semester')} {course_data.get('year')} is now OPEN for registration."
            }
            
            # Publish the message to SNS
            response = sns.publish(
                TopicArn=topic_arn,
                Message=json.dumps(message),
                Subject=f"Course {course_data.get('crn')} is now OPEN!",
                MessageAttributes={
                    'user_id': {
                        'DataType': 'String',
                        'StringValue': user_id
                    },
                    'course_id': {
                        'DataType': 'String',
                        'StringValue': course_data.get('class_id')
                    }
                }
            )
            
            logger.info(f"SNS notification sent. MessageId: {response.get('MessageId')}")
            return response
            
        except Exception as e:
            logger.error(f"Error sending SNS notification: {e}")
            raise e
    
    @staticmethod
    def subscribe_user_to_notifications(email: str, phone_number: str = None):
        """Subscribe a user to the SNS topic for notifications"""
        try:
            sns = boto3.client('sns', region_name=os.environ.get('AWS_REGION_NAME', 'us-east-1'))
            topic_arn = os.environ.get('SNS_TOPIC_ARN')
            
            if not topic_arn:
                logger.error("SNS_TOPIC_ARN not configured")
                return
            
            # Subscribe email to the topic
            if email:
                email_response = sns.subscribe(
                    TopicArn=topic_arn,
                    Protocol='email',
                    Endpoint=email
                )
                
                logger.info(f"Email subscription created. SubscriptionArn: {email_response.get('SubscriptionArn')}")
            
            # Subscribe phone number to the topic if provided
            if phone_number:
                phone_response = sns.subscribe(
                    TopicArn=topic_arn,
                    Protocol='sms',
                    Endpoint=phone_number
                )
                
                logger.info(f"SMS subscription created. SubscriptionArn: {phone_response.get('SubscriptionArn')}")
            
            return {
                'message': 'Subscriptions created successfully',
                'email': email,
                'phone_number': phone_number
            }
            
        except Exception as e:
            logger.error(f"Error creating subscriptions: {e}")
            raise e 