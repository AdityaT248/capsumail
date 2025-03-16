from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from app.routers import messages, auth
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

# Get static directory path
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
print(f"Static directory path: {static_dir}")
print(f"Static directory exists: {os.path.exists(static_dir)}")

app = FastAPI(title="TimeCapsule API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api prefix
app.include_router(messages.router, prefix="/api")
app.include_router(auth.router, prefix="/api")

# API root endpoint
@app.get("/api")
async def api_root():
    return {"message": "Welcome to TimeCapsule API"}

# Serve static files if the directory exists
if os.path.exists(static_dir):
    # Mount static files directory for JS, CSS, etc.
    if os.path.exists(os.path.join(static_dir, "static")):
        app.mount("/static", StaticFiles(directory=os.path.join(static_dir, "static")), name="static")
    
    # Serve individual files at root level
    for file in os.listdir(static_dir):
        file_path = os.path.join(static_dir, file)
        if os.path.isfile(file_path) and file != "index.html":
            @app.get(f"/{file}")
            async def serve_file(file_name=file):
                return FileResponse(os.path.join(static_dir, file_name))
    
    # Serve index.html for root path
    @app.get("/")
    async def serve_root():
        return FileResponse(os.path.join(static_dir, "index.html"))
    
    # Catch-all route for client-side routing
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Skip API routes
        if full_path.startswith("api/"):
            return {"message": "API endpoint not found"}
        
        # Return index.html for all other routes (client-side routing)
        return FileResponse(os.path.join(static_dir, "index.html"))
else:
    # If static directory doesn't exist, show a message
    @app.get("/")
    async def serve_root_fallback():
        return {"message": "Frontend not found. Please build the React app and copy it to the backend/static directory."} 