from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
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
app.include_router(messages.router, prefix="/api")
app.include_router(auth.router, prefix="/api")

# Get static directory path
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
print(f"Static directory path: {static_dir}")
print(f"Static directory exists: {os.path.exists(static_dir)}")
if os.path.exists(static_dir):
    # List files in static directory for debugging
    print(f"Files in static directory: {os.listdir(static_dir)}")
    
    # Mount static files for assets (CSS, JS, images)
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/api")
async def api_root():
    return {"message": "Welcome to TimeCapsule API"}

@app.get("/")
async def root():
    # Serve the index.html for the root path
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    else:
        print(f"Index.html not found at {index_path}")
        return {"message": "Frontend not found. Make sure to build and copy the frontend files to the backend/static directory."}

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # Skip API routes
    if full_path.startswith("api/"):
        return {"message": "API endpoint not found"}
    
    # Try to serve the file directly if it exists
    file_path = os.path.join(static_dir, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Otherwise serve index.html for client-side routing
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    else:
        return {"message": "Frontend not found. Make sure to build and copy the frontend files to the backend/static directory."} 