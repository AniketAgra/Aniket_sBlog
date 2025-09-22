## Email setup (Brevo SMTP)

This project uses SMTP for transactional emails. It's pre-configured to work with Brevo (formerly Sendinblue).

### 1) Create a Brevo account and get SMTP credentials

- In Brevo, go to SMTP & API → SMTP.
- Copy your SMTP login and the SMTP key (not your account password).
- Add/verify a sender email address and domain.

### 2) Configure environment variables

Copy `.env.example` to `.env` and fill the values:

- SMTP_HOST=smtp-relay.brevo.com
- SMTP_PORT=587 (STARTTLS) or 465 (SSL)
- SMTP_SECURE=false for 587, true for 465
- SMTP_USER=your Brevo SMTP login
- SMTP_PASS=your Brevo SMTP key
- SMTP_FROM=the verified sender email in Brevo
- SMTP_FROM_NAME=optional friendly display name

Other required vars:

- MONGO_URL, JWT_SECRET, FRONTEND_URL, PORT

### 3) Dev-friendly behavior

- If SMTP credentials are missing, the server logs the email instead of sending.
- If SMTP auth fails and `NODE_ENV` is not `production`, send is simulated when `EMAIL_SIMULATE_ON_ERROR=true`.

### 4) Test

- Start the API with your `.env` in place and trigger any action that sends an email (e.g., newsletter subscribe).
- Check server logs for either a successful send or a simulated email output.

### 5) Security

- Do not commit real secrets. `.env` is ignored by git.
- Rotate any keys that may have been accidentally shared.

