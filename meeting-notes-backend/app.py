from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from groq import Groq
import re
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import html

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

# Initialize Groq client
client = Groq(
    api_key=os.getenv("GROQ_API_KEY"),
)

# Initialize SendGrid client
sg = SendGridAPIClient(api_key=os.getenv('SENDGRID_API_KEY'))

# Basic route
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "Meeting Notes Summarizer API is running!",
        "status": "success",
        "email_configured": bool(os.getenv('SENDGRID_API_KEY'))
    })

# Generate summary route
@app.route('/api/summary/generate', methods=['POST'])
def generate_summary():
    try:
        # Get data from request
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        transcript = data.get('transcript')
        custom_prompt = data.get('customPrompt')
        
        # Validation
        if not transcript:
            return jsonify({"error": "Transcript is required"}), 400
        
        if not custom_prompt:
            return jsonify({"error": "Custom prompt is required"}), 400
        
        # Create the prompt for Groq
        system_prompt = """You are an AI assistant that specializes in summarizing meeting transcripts. 
        Follow the user's specific instructions for how they want the summary formatted.
        Provide clear, well-structured summaries that are easy to read and understand."""
        
        user_prompt = f"""Please summarize this meeting transcript according to these instructions: "{custom_prompt}"

Meeting Transcript:
{transcript}

Please provide a well-structured summary following the given instructions."""

        # Call Groq API
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],
            model="llama3-8b-8192",
            temperature=0.7,
            max_tokens=1000,
        )
        
        summary = chat_completion.choices[0].message.content
        
        if not summary:
            return jsonify({"error": "No summary generated"}), 500
        
        return jsonify({
            "summary": summary,
            "success": True
        })
        
    except Exception as e:
        print(f"Error generating summary: {str(e)}")
        return jsonify({
            "error": "Failed to generate summary",
            "details": str(e)
        }), 500

def create_email_html(summary, subject):
    """Create a nice HTML email template"""
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{html.escape(subject)}</title>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 24px; font-weight: 600; }}
            .content {{ padding: 30px; }}
            .summary {{ background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; }}
            .footer {{ background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }}
            pre {{ white-space: pre-wrap; word-wrap: break-word; font-family: inherit; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📝 {html.escape(subject)}</h1>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>Please find the meeting summary below:</p>
                <div class="summary">
                    <pre>{html.escape(summary)}</pre>
                </div>
                <p>Best regards,<br>Meeting Notes Summarizer</p>
            </div>
            <div class="footer">
                <p>This email was generated automatically by Meeting Notes Summarizer</p>
            </div>
        </div>
    </body>
    </html>
    """
    return html_content

# Send email route
@app.route('/api/email/send', methods=['POST'])
def send_email():
    try:
        # Get data from request
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        subject = data.get('subject')
        recipients = data.get('recipients')
        summary = data.get('summary')
        
        # Validation
        if not subject:
            return jsonify({"error": "Subject is required"}), 400
        
        if not recipients:
            return jsonify({"error": "Recipients are required"}), 400
        
        if not summary:
            return jsonify({"error": "Summary is required"}), 400
        
        # Check if SendGrid is configured
        if not os.getenv('SENDGRID_API_KEY'):
            print(f"Email would be sent to: {recipients}")
            print(f"Subject: {subject}")
            print(f"Summary length: {len(summary)} characters")
            return jsonify({
                "success": True,
                "message": f"Email simulation successful (SendGrid not configured)",
                "note": "Configure SENDGRID_API_KEY for real email sending"
            })
        
        # Process recipients - handle both comma and newline separated
        if '\n' in recipients:
            email_list = [email.strip() for email in recipients.split('\n') if email.strip()]
        else:
            email_list = [email.strip() for email in recipients.split(',') if email.strip()]
        
        # Validate email format
        email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        for email in email_list:
            if not re.match(email_regex, email):
                return jsonify({"error": f"Invalid email format: {email}"}), 400
        
        # Create HTML email content
        html_content = create_email_html(summary, subject)
        
        # Create plain text version
        plain_text = f"Meeting Summary: {subject}\n\n{summary}\n\nBest regards,\nMeeting Notes Summarizer"
        
        # Send to each recipient
        from_email = os.getenv('SENDGRID_FROM_EMAIL', 'noreply@meetingsummarizer.com')
        
        sent_count = 0
        failed_emails = []
        
        for recipient in email_list:
            try:
                message = Mail(
                    from_email=from_email,
                    to_emails=recipient,
                    subject=subject,
                    html_content=html_content,
                    plain_text_content=plain_text
                )
                
                response = sg.send(message)
                
                if response.status_code == 202:  # SendGrid success status
                    sent_count += 1
                    print(f"Email sent successfully to {recipient}")
                else:
                    failed_emails.append(recipient)
                    print(f"Failed to send to {recipient}: Status {response.status_code}")
                    
            except Exception as e:
                failed_emails.append(recipient)
                print(f"Error sending to {recipient}: {str(e)}")
        
        if sent_count > 0:
            message = f"Summary successfully sent to {sent_count} recipient(s)"
            if failed_emails:
                message += f". Failed to send to: {', '.join(failed_emails)}"
            
            return jsonify({
                "success": True,
                "message": message,
                "sent_count": sent_count,
                "failed_count": len(failed_emails)
            })
        else:
            return jsonify({
                "error": "Failed to send emails to any recipients",
                "failed_emails": failed_emails
            }), 500
        
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return jsonify({
            "error": "Failed to send email",
            "details": str(e)
        }), 500

# Health check for deployment
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "groq_configured": bool(os.getenv("GROQ_API_KEY")),
        "sendgrid_configured": bool(os.getenv("SENDGRID_API_KEY"))
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_ENV') == 'development')