"""
Database connection and operations for MongoDB using Motor.
"""

import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
from typing import Dict, Any, List
from datetime import datetime

logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        self.mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        self.client = None
        self.db = None
        self.submissions = None
        self.answers = None
        self.evaluations = None
        self.connected = False

    async def connect(self):
        try:
            self.client = AsyncIOMotorClient(self.mongodb_url)
            # Test connection
            await self.client.admin.command('ping')
            self.db = self.client.exam_evaluation
            self.submissions = self.db.submissions
            self.answers = self.db.answers
            self.evaluations = self.db.evaluations
            self.connected = True
            logger.info("Connected to MongoDB")
        except ConnectionFailure as e:
            logger.warning(f"MongoDB connection failed: {e}. Running in offline mode.")
            self.connected = False
            raise  # Re-raise to let main.py handle it

    async def disconnect(self):
        if self.client and self.connected:
            self.client.close()
            logger.info("Disconnected from MongoDB")

    async def save_submission(self, submission: Dict[str, Any]) -> str:
        if not self.connected:
            # Return a mock ID for testing without database
            import uuid
            return str(uuid.uuid4())
        try:
            result = await self.submissions.insert_one(submission)
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Failed to save submission: {e}")
            raise

    async def save_answers(self, answers: Dict[str, Any]) -> str:
        if not self.connected:
            # Return a mock ID for testing without database
            import uuid
            return str(uuid.uuid4())
        try:
            result = await self.answers.insert_one(answers)
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Failed to save answers: {e}")
            raise

    async def save_evaluation(self, evaluation: Dict[str, Any]) -> str:
        if not self.connected:
            # Return a mock ID for testing without database
            import uuid
            return str(uuid.uuid4())
        try:
            result = await self.evaluations.insert_one(evaluation)
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Failed to save evaluation: {e}")
            raise

    async def get_submission(self, submission_id: str) -> Dict[str, Any]:
        if not self.connected:
            # Return mock data for testing
            return {"id": submission_id, "status": "completed", "student_name": "Test Student", "subject": "Test Subject"}
        try:
            return await self.submissions.find_one({"_id": submission_id})
        except Exception as e:
            logger.error(f"Failed to get submission: {e}")
            raise

    async def get_answers(self, submission_id: str) -> Dict[str, Any]:
        if not self.connected:
            # Return mock data for testing
            return {"submission_id": submission_id, "answers": {"q1": "A", "q2": "B"}}
        try:
            return await self.answers.find_one({"submission_id": submission_id})
        except Exception as e:
            logger.error(f"Failed to get answers: {e}")
            raise

    async def get_evaluation(self, submission_id: str) -> Dict[str, Any]:
        if not self.connected:
            # Return mock data for testing
            return {"submission_id": submission_id, "results": {"total_score": 85, "max_score": 100}, "total_score": 85, "max_score": 100}
        try:
            return await self.evaluations.find_one({"submission_id": submission_id})
        except Exception as e:
            logger.error(f"Failed to get evaluation: {e}")
            raise

    async def get_analytics(self) -> Dict[str, Any]:
        if not self.connected:
            # Return mock analytics for testing
            return {
                "total_submissions": 10,
                "average_score": 78.5,
                "subject_breakdown": {"Mathematics": 5, "Physics": 3, "Chemistry": 2}
            }
        try:
            total_submissions = await self.submissions.count_documents({})
            pipeline = [
                {"$group": {"_id": None, "avg_score": {"$avg": "$total_score"}, "total_max": {"$sum": "$max_score"}}}
            ]
            result = await self.evaluations.aggregate(pipeline).to_list(1)
            avg_score = result[0]["avg_score"] if result else 0

            subject_pipeline = [
                {"$group": {"_id": "$subject", "count": {"$sum": 1}}}
            ]
            subject_breakdown = await self.submissions.aggregate(subject_pipeline).to_list(None)
            subject_dict = {item["_id"]: item["count"] for item in subject_breakdown}

            return {
                "total_submissions": total_submissions,
                "average_score": avg_score,
                "subject_breakdown": subject_dict
            }
        except Exception as e:
            logger.error(f"Failed to get analytics: {e}")
            raise

# Global instance
db = Database()

# Global instance
db = Database()