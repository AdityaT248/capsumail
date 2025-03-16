from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta, timezone
import os
import uuid
import shutil

from app.database import get_db
from app.models.models import Message, Attachment, User
from app.schemas import MessageCreate, MessageResponse, MessageWithAttachments
from app.auth import get_current_active_user
from app.services.email_service import EmailService

router = APIRouter(
    prefix="/messages",
    tags=["messages"],
    responses={404: {"description": "Not found"}},
)

# Directory for file uploads
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=MessageResponse)
async def create_message(
    message: MessageCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Validate scheduled date (must be in the future)
    # Convert both to naive UTC for comparison
    now = datetime.utcnow()
    scheduled_naive = message.scheduled_date.replace(tzinfo=None)
    
    if scheduled_naive <= now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Scheduled date must be in the future"
        )
    
    # Create new message
    db_message = Message(
        user_id=current_user.id,
        recipient_email=message.recipient_email,
        recipient_name=message.recipient_name,
        sender_name=message.sender_name,
        subject=message.subject,
        content=message.content,
        scheduled_date=scheduled_naive
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    # Send confirmation email
    background_tasks.add_task(
        send_confirmation_email,
        recipient_email=current_user.email,
        message=db_message
    )
    
    return db_message

@router.post("/with-attachment", response_model=MessageWithAttachments)
async def create_message_with_attachment(
    background_tasks: BackgroundTasks,
    recipient_email: str = Form(...),
    recipient_name: str = Form(...),
    sender_name: str = Form(...),
    subject: str = Form(...),
    content: str = Form(...),
    scheduled_date: datetime = Form(...),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Validate scheduled date (must be in the future)
    # Convert both to naive UTC for comparison
    now = datetime.utcnow()
    scheduled_naive = scheduled_date.replace(tzinfo=None)
    
    if scheduled_naive <= now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Scheduled date must be in the future"
        )
    
    # Create new message
    db_message = Message(
        user_id=current_user.id,
        recipient_email=recipient_email,
        recipient_name=recipient_name,
        sender_name=sender_name,
        subject=subject,
        content=content,
        scheduled_date=scheduled_naive
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    # Handle file upload if provided
    if file:
        # Create unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Create attachment record
        db_attachment = Attachment(
            message_id=db_message.id,
            file_path=file_path,
            file_type=file.content_type
        )
        db.add(db_attachment)
        db.commit()
        db.refresh(db_attachment)
        
        # Add attachment to message
        db_message.attachments = [db_attachment]
    
    # Send confirmation email
    background_tasks.add_task(
        send_confirmation_email,
        recipient_email=current_user.email,
        message=db_message
    )
    
    return db_message

@router.get("/", response_model=List[MessageWithAttachments])
async def read_messages(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    messages = db.query(Message).filter(
        Message.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return messages

@router.get("/{message_id}", response_model=MessageWithAttachments)
async def read_message(
    message_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    message = db.query(Message).filter(
        Message.id == message_id, 
        Message.user_id == current_user.id
    ).first()
    
    if message is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    return message

@router.delete("/{message_id}")
async def delete_message(
    message_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    message = db.query(Message).filter(
        Message.id == message_id, 
        Message.user_id == current_user.id
    ).first()
    
    if message is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Delete attachments first
    for attachment in message.attachments:
        # Delete file if it exists
        if os.path.exists(attachment.file_path):
            os.remove(attachment.file_path)
        db.delete(attachment)
    
    # Delete message
    db.delete(message)
    db.commit()
    
    return {"message": "Message deleted successfully"}

# Background task to send confirmation email
def send_confirmation_email(recipient_email: str, message: Message):
    scheduled_date_str = message.scheduled_date.strftime("%B %d, %Y at %I:%M %p")
    
    email_content = f"""
    <html>
        <body>
            <h1>TimeCapsule Confirmation</h1>
            <p>Your message has been scheduled successfully!</p>
            <p><strong>Subject:</strong> {message.subject}</p>
            <p><strong>Scheduled for:</strong> {scheduled_date_str}</p>
            <p><strong>Recipient:</strong> {message.recipient_email}</p>
            <p>Your message will be delivered on the scheduled date.</p>
        </body>
    </html>
    """
    
    EmailService.send_email(
        to_email=recipient_email,
        subject="TimeCapsule Message Confirmation",
        content=email_content
    )

# Background task to check and send scheduled messages
def send_scheduled_messages(db: Session):
    # Get messages that are scheduled to be sent and haven't been sent yet
    now = datetime.utcnow()
    messages_to_send = db.query(Message).filter(
        Message.scheduled_date <= now,
        Message.is_sent == False
    ).all()
    
    for message in messages_to_send:
        # Get attachments if any
        attachments = []
        for attachment in message.attachments:
            attachments.append({
                "path": attachment.file_path,
                "type": attachment.file_type
            })
        
        # Send email
        email_content = f"""
        <html>
            <body>
                <h1>A Message From Your Past Self</h1>
                <p>You scheduled this message to be delivered today.</p>
                <div style="border: 1px solid #ccc; padding: 20px; margin: 20px 0;">
                    {message.content}
                </div>
                <p><em>Sent via TimeCapsule</em></p>
            </body>
        </html>
        """
        
        success = EmailService.send_email(
            to_email=message.recipient_email,
            subject=message.subject,
            content=email_content,
            attachments=attachments if attachments else None
        )
        
        if success:
            # Mark message as sent
            message.is_sent = True
            db.commit()

# Endpoint to manually trigger sending scheduled messages (for testing)
@router.post("/send-scheduled")
async def trigger_send_scheduled_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Only allow admin users to trigger this manually
    if current_user.email != "admin@example.com":  # Replace with actual admin check
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    send_scheduled_messages(db)
    return {"message": "Scheduled messages processed"} 