from fastapi import FastAPI
from mangum import Mangum
from fastapi.middleware.cors import CORSMiddleware
from routes import base, auth, protected, course, notification

app = FastAPI(title="Course Monitoring API")

origins = [
    "https://adamsulemanji.com",
    "https://adamsulemanji.com/",

    "https://api.fast.adamsulemanji.com",
    "https://api.fast.adamsulemanji.com/",

    "http://localhost:8000",
    "http://localhost:8000/",

    "http://localhost:3000",
    "http://localhost:3000/",

    "https://www.adamsulemanji.com",
    "https://www.adamsulemanji.com/",

    "https://monitoring.adamsulemanji.com",
    "https://monitoring.adamsulemanji.com/",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(protected.router, prefix="/protected", tags=["Protected"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(course.router, prefix="/courses", tags=["Courses"])
app.include_router(notification.router, prefix="/notifications", tags=["Notifications"])
app.include_router(base.router, tags=["Base"])


handler = Mangum(app)
