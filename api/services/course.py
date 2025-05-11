import boto3
import uuid
import time
from typing import List, Dict, Any, Optional
import os
import logging
from datetime import datetime

from schemas.course import CourseCreate, Course, UserCourse
from services.notification import NotificationService
from services.scraper import CourseScraperService

logger = logging.getLogger(__name__)

class CourseService:
    @staticmethod
    def create_course_id(crn: str, year: int, semester: str) -> str:
        """Create a unique course ID from course details"""
        return f"{crn}-{year}-{semester}"
    
    @staticmethod
    async def add_course(user_id: str, course_data: CourseCreate):
        """Add a course for a user to track"""
        dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION_NAME', 'us-east-1'))
        classes_table = dynamodb.Table(os.environ.get('CLASSES_TABLE_NAME', 'Course-Classes'))
        user_courses_table = dynamodb.Table(os.environ.get('USER_COURSES_TABLE_NAME', 'Course-UserCourses'))
        
        # Create class_id from course details
        class_id = CourseService.create_course_id(
            course_data.crn, course_data.year, course_data.semester
        )
        
        # Check if class already exists
        try:
            response = classes_table.get_item(
                Key={'class_id': class_id}
            )
            
            # If class doesn't exist, add it
            if 'Item' not in response:
                # Check course availability when adding
                availability = await CourseScraperService.simulate_course_availability(
                    course_data.crn, course_data.year, course_data.semester
                )
                
                classes_table.put_item(
                    Item={
                        'class_id': class_id,
                        'crn': course_data.crn,
                        'year': course_data.year,
                        'semester': course_data.semester,
                        'is_open': availability.get('is_open', False),
                        'seats_available': availability.get('seats_available', 0),
                        'last_checked': datetime.now().isoformat(),
                    }
                )
        
            # Add the class to user's tracked classes
            user_courses_table.put_item(
                Item={
                    'user_id': user_id,
                    'class_id': class_id
                }
            )
            
            return {'message': 'Course added successfully', 'class_id': class_id}
            
        except Exception as e:
            logger.error(f"Error adding course: {e}")
            raise e
    
    @staticmethod
    async def get_user_courses(user_id: str) -> List[Course]:
        """Get all courses tracked by a user"""
        dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION_NAME', 'us-east-1'))
        user_courses_table = dynamodb.Table(os.environ.get('USER_COURSES_TABLE_NAME', 'Course-UserCourses'))
        classes_table = dynamodb.Table(os.environ.get('CLASSES_TABLE_NAME', 'Course-Classes'))
        
        try:
            # Get user's tracked classes
            response = user_courses_table.query(
                KeyConditionExpression="user_id = :user_id",
                ExpressionAttributeValues={
                    ':user_id': user_id
                }
            )
            
            if 'Items' not in response or not response['Items']:
                return []
                
            # Get details for each class
            courses = []
            for item in response['Items']:
                class_id = item['class_id']
                class_response = classes_table.get_item(
                    Key={'class_id': class_id}
                )
                
                if 'Item' in class_response:
                    courses.append(class_response['Item'])
            
            return courses
            
        except Exception as e:
            logger.error(f"Error getting user courses: {e}")
            raise e
    
    @staticmethod
    async def check_course_availability(class_id: str):
        """Check if a course is available using the web scraper"""
        dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION_NAME', 'us-east-1'))
        classes_table = dynamodb.Table(os.environ.get('CLASSES_TABLE_NAME', 'Course-Classes'))
        
        # Get the course details
        course_response = classes_table.get_item(
            Key={'class_id': class_id}
        )
        
        if 'Item' not in course_response:
            logger.error(f"Course with ID {class_id} not found")
            return {
                'class_id': class_id,
                'error': 'Course not found'
            }
            
        course = course_response['Item']
        previous_status = course.get('is_open', False)
        
        # Use the scraper to check availability
        # In production, use the real scraper
        # availability = await CourseScraperService.check_course_availability(
        availability = await CourseScraperService.simulate_course_availability(
            course.get('crn'),
            course.get('year'),
            course.get('semester')
        )
        
        is_open = availability.get('is_open', False)
        seats_available = availability.get('seats_available', 0)
        
        # Update course status
        classes_table.update_item(
            Key={'class_id': class_id},
            UpdateExpression="SET is_open = :is_open, seats_available = :seats_available, last_checked = :last_checked",
            ExpressionAttributeValues={
                ':is_open': is_open,
                ':seats_available': seats_available,
                ':last_checked': datetime.now().isoformat()
            }
        )
        
        # Return status change information
        return {
            'class_id': class_id, 
            'is_open': is_open,
            'seats_available': seats_available,
            'status_changed': is_open != previous_status,
            'previous_status': previous_status
        }
    
    @staticmethod
    async def check_all_courses():
        """Check all courses for availability"""
        dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION_NAME', 'us-east-1'))
        classes_table = dynamodb.Table(os.environ.get('CLASSES_TABLE_NAME', 'Course-Classes'))
        
        # Scan all classes
        response = classes_table.scan()
        courses = response.get('Items', [])
        
        results = []
        for course in courses:
            result = await CourseService.check_course_availability(course['class_id'])
            results.append(result)
            
        return results
        
    @staticmethod
    async def notify_users_for_open_courses():
        """Notify users when their tracked courses become available"""
        dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION_NAME', 'us-east-1'))
        users_table = dynamodb.Table(os.environ.get('USERS_TABLE_NAME', 'Course-Users'))
        classes_table = dynamodb.Table(os.environ.get('CLASSES_TABLE_NAME', 'Course-Classes'))
        user_courses_table = dynamodb.Table(os.environ.get('USER_COURSES_TABLE_NAME', 'Course-UserCourses'))
        
        # First check all courses
        course_results = await CourseService.check_all_courses()
        
        # Filter for courses that are now open and have changed status
        newly_open_courses = [result for result in course_results 
                            if result['is_open'] and result['status_changed']]
        
        if not newly_open_courses:
            return {'message': 'No newly opened courses found'}
        
        # For each newly open course, find users tracking it and notify them
        notifications_sent = 0
        
        for course_result in newly_open_courses:
            class_id = course_result['class_id']
            
            # Get the class details
            class_response = classes_table.get_item(
                Key={'class_id': class_id}
            )
            
            if 'Item' not in class_response:
                continue
                
            course_data = class_response['Item']
            
            # Find users tracking this class
            user_courses_response = user_courses_table.query(
                IndexName='class-users-index',
                KeyConditionExpression="class_id = :class_id",
                ExpressionAttributeValues={
                    ':class_id': class_id
                }
            )
            
            for user_course in user_courses_response.get('Items', []):
                user_id = user_course['user_id']
                
                # Get user details
                user_response = users_table.get_item(
                    Key={'user_id': user_id}
                )
                
                if 'Item' in user_response:
                    user = user_response['Item']
                    user_email = user.get('email')
                    
                    if user_email:
                        # Send notification
                        NotificationService.send_course_notification(
                            user_id=user_id,
                            user_email=user_email,
                            course_data=course_data
                        )
                        notifications_sent += 1
        
        return {
            'message': f'Notifications sent for {len(newly_open_courses)} newly opened courses',
            'notifications_sent': notifications_sent
        } 