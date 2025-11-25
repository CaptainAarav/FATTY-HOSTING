# FATTY HOSTING

Modern free server hosting website with orange/yellow dark mode theme.

## Local Development

Simply open `index.html` in your browser or use a local server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`

## Docker Deployment

### Build and run:
```bash
docker-compose up -d
```

The website will be available on port 8080.

### For Raspberry Pi deployment:
```bash
# Pull latest changes
git pull origin main

# Build and start container
docker-compose up -d --build
```

## Reverse Proxy Configuration

If using nginx as reverse proxy, add this to your config:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Features

- Modern, responsive design
- Orange/Yellow dark mode color scheme
- Smooth animations and transitions
- Mobile-friendly
- Dockerized for easy deployment
