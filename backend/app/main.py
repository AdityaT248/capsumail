from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import messages, auth
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TimeCapsule API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(messages.router)
app.include_router(auth.router)

@app.get("/")
async def root():
    return {"message": "Welcome to TimeCapsule API"} 