from email.message import EmailMessage
import smtplib

from ..core.config import EMAIL_ENABLED, EMAIL_RECIPIENT, EMAIL_SENDER, EMAIL_PASSWORD, SMTP_HOST, SMTP_PORT
from ..models.inquiry import InquiryRequest


def send_inquiry_email(payload: InquiryRequest) -> bool:
    if not EMAIL_ENABLED:
        return False

    subject_parts = ["New Inquiry"]
    if payload.propertyTitle:
        subject_parts.append(payload.propertyTitle)

    message_lines = [
        "A new inquiry was submitted.",
        "",
        f"Name: {payload.name}",
    ]

    if payload.email:
        message_lines.append(f"Email: {payload.email}")

    if payload.phone:
        message_lines.append(f"Phone: {payload.phone}")

    if payload.propertyId:
        message_lines.append(f"Property ID: {payload.propertyId}")

    if payload.propertyTitle:
        message_lines.append(f"Property Title: {payload.propertyTitle}")

    if payload.source:
        message_lines.append(f"Source: {payload.source}")

    if payload.message:
        message_lines.extend(["", "Message:", payload.message])

    email_message = EmailMessage()
    email_message["Subject"] = " - ".join(subject_parts)
    email_message["From"] = f"{payload.name} <{EMAIL_SENDER}>" if payload.name else EMAIL_SENDER
    email_message["To"] = EMAIL_RECIPIENT
    if payload.email:
        email_message["Reply-To"] = payload.email
    email_message.set_content("\n".join(message_lines))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
        server.starttls()
        server.login(EMAIL_SENDER, EMAIL_PASSWORD)
        server.send_message(email_message)

    return True
