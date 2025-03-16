# TimeCapsule Backend

This is the backend API for the TimeCapsule application, which allows users to schedule messages to be sent to themselves in the future.

## Features

- User authentication and registration
- Email verification
- Create, read, and delete time capsule messages
- File attachments support
- Scheduled email delivery

## Tech Stack

- FastAPI: Modern, fast web framework for building APIs
- SQLAlchemy: SQL toolkit and ORM
- Pydantic: Data validation and settings management
- Celery: Distributed task queue for background processing
- Redis: Message broker for Celery
- SendGrid/SMTP: Email delivery

## Setup

1. Clone the repository
2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and configure your environment variables:
   ```
   cp .env.example .env
   ```
5. Run the application:
   ```
   python run.py
   ```
6. Start Celery worker (in a separate terminal):
   ```
   celery -A app.celery_worker worker --loglevel=info
   ```
7. Start Celery beat for scheduled tasks (in a separate terminal):
   ```
   celery -A app.celery_worker beat --loglevel=info
   ```

## API Endpoints

### Authentication

- `POST /auth/register`: Register a new user
- `GET /auth/verify`: Verify email with token
- `POST /auth/token`: Login and get access token
- `GET /auth/me`: Get current user information

### Messages

- `POST /messages/`: Create a new time capsule message
- `POST /messages/with-attachment`: Create a message with file attachment
- `GET /messages/`: Get all messages for current user
- `GET /messages/{message_id}`: Get a specific message
- `DELETE /messages/{message_id}`: Delete a message

## Development

- API documentation is available at `/docs` when the server is running
- Swagger UI is available at `/redoc` for an alternative API documentation view 