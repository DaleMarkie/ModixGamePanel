from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Modix Panel Backend (Stub)")

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check route
@app.get("/health")
def health_check():
    return {"success": True, "status": "ok"}

# Example stub API for frontend testing
@app.get("/api/example")
def example_api():
    return {"message": "Backend is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api_main:app", host="0.0.0.0", port=2010, reload=True)
