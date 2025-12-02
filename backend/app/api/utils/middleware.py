"""
API Utilities for KrishiDrishti
This module contains API utilities like rate limiting and error handling
"""
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import time
import logging
from typing import Callable, Dict, Any

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class APIUtils:
    """
    API utilities including rate limiting, error handling, etc.
    """
    
    @staticmethod
    def setup_rate_limiting(app: FastAPI):
        """
        Set up rate limiting for the FastAPI app
        """
        app.state.limiter = limiter
        app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
        
        # Define rate limits for different endpoints
        # For example: 100 requests per hour for general endpoints
        # 50 requests per hour for analysis endpoints
        return limiter
    
    @staticmethod
    def add_request_logging(app: FastAPI):
        """
        Add request logging middleware
        """
        @app.middleware("http")
        async def log_requests(request: Request, call_next):
            start_time = time.time()
            
            # Process the request
            response = await call_next(request)
            
            # Calculate process time
            process_time = time.time() - start_time
            
            # Log the request
            logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.2f}s")
            
            return response
    
    @staticmethod
    def add_error_handling(app: FastAPI):
        """
        Add global error handling middleware
        """
        @app.exception_handler(HTTPException)
        async def http_exception_handler(request: Request, exc: HTTPException):
            logger.error(f"HTTPException: {exc.status_code} - {exc.detail}")
            return JSONResponse(
                status_code=exc.status_code,
                content={
                    "success": False,
                    "error": {
                        "type": "HTTPException",
                        "message": exc.detail,
                        "status_code": exc.status_code
                    }
                }
            )
        
        @app.exception_handler(Exception)
        async def general_exception_handler(request: Request, exc: Exception):
            logger.error(f"Unhandled exception: {str(exc)}")
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": {
                        "type": "InternalServerError",
                        "message": "An internal server error occurred",
                        "status_code": 500
                    }
                }
            )

# Initialize the API utilities
api_utils = APIUtils()