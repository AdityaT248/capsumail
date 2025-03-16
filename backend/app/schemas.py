from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import List, Optional

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Message schemas
class MessageBase(BaseModel):
    recipient_email: EmailStr
    recipient_name: str
    sender_name: str
    subject: str
    content: str
    scheduled_date: datetime

class MessageCreate(MessageBase):
    pass

    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

class MessageResponse(MessageBase):
    id: int
    user_id: int
    is_sent: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

# Attachment schemas
class AttachmentBase(BaseModel):
    file_type: str

class AttachmentCreate(AttachmentBase):
    file_path: str

class AttachmentResponse(AttachmentBase):
    id: int
    message_id: int
    file_path: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Message with attachments
class MessageWithAttachments(MessageResponse):
    attachments: List[AttachmentResponse] = []
    
    class Config:
        from_attributes = True 