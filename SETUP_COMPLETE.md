# FATTY HOSTING - Setup Complete! 🎉

## ✅ What's Been Implemented

### Frontend Features
- **User Authentication**: Login and registration system with JWT tokens
- **Server Request Form**: Users can request free server hosting
- **Dashboard**: Users can view their server requests and status
- **Modern UI**: Orange/yellow dark mode theme with animations
- **Responsive Design**: Works on desktop and mobile

### Backend Features
- **Express.js API**: RESTful API with authentication
- **SQLite Database**: Stores user accounts and server requests
- **JWT Authentication**: Secure token-based authentication
- **Email Notifications**: Sends emails when users request servers
- **Rate Limiting**: Protects against abuse
- **Input Validation**: Ensures data integrity

### Deployment
- **Docker**: Full-stack deployment with docker-compose
- **HTTPS/SSL**: Let's Encrypt certificate configured
- **Nginx Reverse Proxy**: Routes traffic to containers
- **Live at**: https://fattyhosting.com

## 🔧 What You Need to Do

### 1. Set Up Gmail App Password for Email Notifications

The website needs to send emails when users request servers. To enable this:

1. Go to your Google Account: https://myaccount.google.com/
2. Enable 2-Factor Authentication if not already enabled
3. Go to App Passwords: https://myaccount.google.com/apppasswords
4. Generate a new app password:
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Enter name: "FATTY HOSTING"
5. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

6. SSH into your Raspberry Pi and update the .env file:
```bash
ssh aarav@192.168.0.132
cd ~/FATTY-HOSTING/backend
nano .env
```

7. Replace `REPLACE_WITH_APP_PASSWORD` with your actual app password (remove spaces):
```env
EMAIL_PASSWORD=abcdefghijklmnop
```

8. Restart the backend container:
```bash
cd ~/FATTY-HOSTING
docker compose restart backend
```

### 2. Test the Website

1. Visit https://fattyhosting.com
2. Click "Sign Up" to create an account
3. Log in with your new account
4. Click "Get Started" to request a server
5. Fill out the server request form:
   - Server Name: A name for the server
   - Expected Players: How many people will use it
   - AMP Username: Username for amp.fattysmp.com
   - AMP Password: Password for amp.fattysmp.com
6. Submit the request
7. Check your email (aaravsahni1037@gmail.com) - you should receive a notification!

### 3. When You Receive a Server Request

When someone requests a server, you'll get an email with:
- User's name and email
- Requested server name
- Expected number of players
- AMP login credentials they want

**Your workflow:**
1. Create the AMP account on your server with their requested username/password
2. Manually send them an email (or we can add an admin panel later) saying their server is ready
3. They can then log in at amp.fattysmp.com

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Server Requests
- `POST /api/servers/request` - Submit server request (requires auth)
- `GET /api/servers/my-requests` - Get user's requests (requires auth)

### Health Check
- `GET /api/health` - Check API status

## 🐳 Docker Commands

### View logs:
```bash
ssh aarav@192.168.0.132
cd ~/FATTY-HOSTING

# View all logs
docker compose logs

# View frontend logs
docker logs fatty-hosting-frontend

# View backend logs
docker logs fatty-hosting-backend

# Follow logs in real-time
docker compose logs -f
```

### Restart containers:
```bash
docker compose restart
```

### Rebuild after code changes:
```bash
git pull
docker compose up -d --build
```

### Stop containers:
```bash
docker compose down
```

## 📁 File Structure

```
FATTY-HOSTING/
├── backend/
│   ├── database/
│   │   └── db.js           # Database setup
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   └── servers.js      # Server request routes
│   ├── utils/
│   │   └── email.js        # Email sending functions
│   ├── data/
│   │   └── fatty_hosting.db # SQLite database (auto-created)
│   ├── .env                # Environment variables (EMAIL PASSWORD HERE!)
│   ├── server.js           # Main Express server
│   └── Dockerfile          # Backend Docker config
├── index.html              # Main HTML
├── styles.css              # Styling
├── script.js               # Frontend JavaScript
├── nginx.conf              # Nginx configuration
├── Dockerfile              # Frontend Docker config
└── docker-compose.yml      # Docker orchestration

```

## 🎯 Future Enhancements (Ideas)

1. **Admin Panel**: Dashboard to manage server requests
2. **Auto-provisioning**: Automatically create AMP accounts via API
3. **Email Templates**: Better designed email notifications
4. **Discord Integration**: Notify via Discord webhook
5. **Server Status**: Show if servers are online/offline
6. **Resource Usage**: Display server resource consumption
7. **Multiple Tiers**: Add premium hosting options

## 🚨 Important Notes

- The database file is stored at `backend/data/fatty_hosting.db`
- Make sure to backup this file regularly!
- User passwords are hashed with bcrypt (secure)
- JWT tokens expire after 7 days
- Rate limiting: Max 5 login attempts per 15 minutes
- Rate limiting: Max 3 server requests per hour per IP

## 📞 Need Help?

If something isn't working:
1. Check the Docker logs: `docker compose logs`
2. Verify containers are running: `docker ps`
3. Test the API: `curl https://fattyhosting.com/api/health`
4. Check email configuration in `.env` file

---

**Your website is live and ready to accept server requests!** 🚀

Visit: https://fattyhosting.com
