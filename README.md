# TimeCapsule

TimeCapsule is a web application that allows users to write messages to themselves and schedule them to be emailed back at a future date. It's a digital time capsule for your thoughts, reflections, and memories.

## Features

- User registration and authentication
- Email verification
- Create and schedule messages to be sent in the future
- Upload file attachments with messages
- View and manage your scheduled messages
- Automatic email delivery on the scheduled date

## Tech Stack

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- PostgreSQL/SQLite database
- Celery for background tasks
- Redis as message broker
- JWT authentication
- SendGrid/SMTP for email delivery

### Frontend
- React.js
- React Router for navigation
- Axios for API requests
- Formik for form handling
- CSS for styling

## Project Structure

```
timecapsule/
├── backend/             # FastAPI backend
│   ├── app/             # Application code
│   │   ├── models/      # Database models
│   │   ├── routers/     # API routes
│   │   ├── services/    # Business logic
│   │   ├── main.py      # FastAPI app
│   │   └── ...
│   ├── requirements.txt # Python dependencies
│   └── ...
├── frontend/            # React frontend
│   ├── public/          # Static files
│   ├── src/             # Source code
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   ├── services/    # API services
│   │   └── ...
│   ├── package.json     # Node.js dependencies
│   └── ...
└── README.md            # This file
```

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- PostgreSQL (optional, SQLite is used by default)
- Redis (for Celery)

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example` and configure your environment variables.

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

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## API Documentation

When the backend is running, you can access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## License

This project is licensed under the MIT License. 