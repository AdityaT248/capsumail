from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from app.routers import messages, auth
from app.database import engine, Base, get_db
from app.models import models
import uvicorn

# Create database tables
Base.metadata.create_all(bind=engine)

# Check if static directory exists
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
print(f"Static directory exists: {os.path.exists(static_dir)}")

app = FastAPI(
    title="TimeCapsule API",
    description="API for the TimeCapsule application",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:3000",  # React frontend
    "http://localhost:5000",  # Production frontend
    "*",  # Allow all origins (for development)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(messages.router, prefix="/api")

# API root endpoint
@app.get("/api")
async def api_root():
    return {"message": "Welcome to TimeCapsule API"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

# Serve static files if the directory exists
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Serve the index.html for any path that doesn't start with /api
        if not full_path.startswith("api"):
            index_path = os.path.join(static_dir, "index.html")
            if os.path.exists(index_path):
                return FileResponse(index_path)
        
        # If the path starts with /api or index.html doesn't exist, return a 404
        return {"detail": "Not Found"}
else:
    @app.get("/")
    async def serve_root_fallback():
        return {"message": "Frontend not found. Please build the React app and copy it to the backend/static directory."}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True) 