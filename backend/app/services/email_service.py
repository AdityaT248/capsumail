import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from typing import List, Optional
import logging

# Try to import SendGrid if available
try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition, ContentId
    import base64
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False

load_dotenv()

# Email configuration
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USERNAME = os.getenv("EMAIL_USERNAME", "")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "timecapsule@example.com")
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def send_email(
        to_email: str,
        subject: str,
        content: str,
        attachments: Optional[List[dict]] = None
    ) -> bool:
        """
        Send an email using either SendGrid or SMTP
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            content: Email content (HTML)
            attachments: List of attachment dictionaries with keys: path, type
            
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        if SENDGRID_AVAILABLE and SENDGRID_API_KEY:
            return EmailService._send_with_sendgrid(to_email, subject, content, attachments)
        else:
            return EmailService._send_with_smtp(to_email, subject, content, attachments)
    
    @staticmethod
    def _send_with_sendgrid(
        to_email: str,
        subject: str,
        content: str,
        attachments: Optional[List[dict]] = None
    ) -> bool:
        """Send email using SendGrid"""
        try:
            message = Mail(
                from_email=EMAIL_FROM,
                to_emails=to_email,
                subject=subject,
                html_content=content
            )
            
            # Add attachments if any
            if attachments:
                for attachment_data in attachments:
                    with open(attachment_data["path"], "rb") as f:
                        file_content = f.read()
                        
                    encoded_file = base64.b64encode(file_content).decode()
                    attachment = Attachment()
                    attachment.file_content = FileContent(encoded_file)
                    attachment.file_name = FileName(os.path.basename(attachment_data["path"]))
                    attachment.file_type = FileType(attachment_data["type"])
                    attachment.disposition = Disposition("attachment")
                    attachment.content_id = ContentId(os.path.basename(attachment_data["path"]))
                    
                    message.attachment = attachment
            
            sg = SendGridAPIClient(SENDGRID_API_KEY)
            response = sg.send(message)
            
            if response.status_code >= 200 and response.status_code < 300:
                logger.info(f"Email sent successfully to {to_email}")
                return True
            else:
                logger.error(f"Failed to send email via SendGrid: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending email via SendGrid: {str(e)}")
            return False
    
    @staticmethod
    def _send_with_smtp(
        to_email: str,
        subject: str,
        content: str,
        attachments: Optional[List[dict]] = None
    ) -> bool:
        """Send email using SMTP"""
        try:
            msg = MIMEMultipart()
            msg["From"] = EMAIL_FROM
            msg["To"] = to_email
            msg["Subject"] = subject
            
            # Attach HTML content
            msg.attach(MIMEText(content, "html"))
            
            # Add attachments if any
            if attachments:
                for attachment_data in attachments:
                    with open(attachment_data["path"], "rb") as f:
                        attachment = MIMEText(f.read(), _subtype=attachment_data["type"])
                        attachment.add_header(
                            "Content-Disposition", 
                            f"attachment; filename={os.path.basename(attachment_data['path'])}"
                        )
                        msg.attach(attachment)
            
            # Connect to SMTP server and send email
            with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
                server.starttls()
                if EMAIL_USERNAME and EMAIL_PASSWORD:
                    server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
                server.send_message(msg)
                
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email via SMTP: {str(e)}")
            return False 