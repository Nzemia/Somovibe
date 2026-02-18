# 🚀 Deploy Questy to Production

Complete guide to deploy your app to a VPS with Docker. Takes about 30 minutes.

---

## 📋 What You Need

- [ ] VPS (Hetzner CX11 - $5/month)
- [ ] Domain name (~$1/month)
- [ ] Neon PostgreSQL (free)
- [ ] GitHub account

---

## Step 1: Test Locally (5 minutes)

Before deploying, test Docker works on your machine:

```bash
# Copy environment
cp .env.example .env

# Test Docker
npm run docker:test

# Visit http://localhost:3000
```

✅ If it works locally, it will work in production!

---

## Step 2: Get Your VPS (5 minutes)

### A. Sign up for Hetzner

1. Go to [hetzner.com/cloud](https://www.hetzner.com/cloud)
2. Create account
3. Add payment method

### B. Create Server

- **Location**: Closest to your users
- **Image**: Ubuntu 22.04
- **Type**: CX11 (2GB RAM, 20GB SSD) - $5/month
- **SSH**: Add your SSH key or create password

### C. Note Your IP

Write down your server IP: `___.___.___.___ `

---

## Step 3: Point Your Domain (2 minutes)

Go to your domain registrar (Namecheap, GoDaddy, etc.):

1. Add A record:
   ```
   Type: A
   Name: @
   Value: YOUR_VPS_IP
   TTL: 300
   ```

2. Add www A record:
   ```
   Type: A
   Name: www
   Value: YOUR_VPS_IP
   TTL: 300
   ```

3. Wait 5-10 minutes for DNS to update

---

## Step 4: Setup VPS (10 minutes)

### A. SSH into your server

```bash
ssh root@YOUR_VPS_IP
```

### B. Install Docker and Git

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose and Git
apt install -y docker-compose git

# Start Docker
systemctl start docker
systemctl enable docker
```

### C. Create deployer user

```bash
# Create user
adduser deployer
usermod -aG docker deployer
usermod -aG sudo deployer

# Switch to deployer
su - deployer
```

### D. Clone your repository

```bash
# Create directory
sudo mkdir -p /opt/questy
sudo chown deployer:deployer /opt/questy

# Clone
cd /opt/questy
git clone https://github.com/YOUR_USERNAME/questy.git .
```

---

## Step 5: Configure Environment (5 minutes)

```bash
# Copy production template
cp .env.production .env.production

# Edit with your values
nano .env.production
```

### Required Values:

```bash
# Database (from Neon)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# Base URL
NEXT_PUBLIC_BASE_URL="https://your-domain.com"

# Admin
PLATFORM_ADMIN_ID="admin@questy.app"

# Add your OAuth, M-Pesa, and Resend credentials
```

Save: `Ctrl+X`, then `Y`, then `Enter`

---

## Step 6: Setup SSL (3 minutes)

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Update domain in nginx config
nano nginx/conf.d/default.conf
# Replace 'your-domain.com' with your actual domain
# Save and exit

# Get SSL certificate
./scripts/setup-ssl.sh your-domain.com your-email@example.com
```

---

## Step 7: Deploy! (5 minutes)

```bash
# Deploy
./scripts/deploy.sh
```

This will:
- Build Docker images
- Run database migrations
- Start all containers
- Setup health checks

### Verify Deployment

```bash
# Check containers
docker-compose ps

# Check health
curl http://localhost:3000/api/health

# View logs
docker-compose logs -f app
```

---

## Step 8: Visit Your Site! 🎉

Open your browser: `https://your-domain.com`

You should see your app running with SSL!

---

## 🔄 Setup Auto-Deploy (Optional, 5 minutes)

### A. Generate SSH key on VPS

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github-actions  # Copy this private key
```

### B. Add to GitHub Secrets

Go to: **Repository → Settings → Secrets and variables → Actions**

Add these secrets:
- `VPS_HOST`: Your VPS IP
- `VPS_USERNAME`: `deployer`
- `VPS_SSH_KEY`: The private key you copied
- `VPS_PORT`: `22`

### C. Test Auto-Deploy

```bash
# On your local machine
git add .
git commit -m "Test auto-deploy"
git push origin main

# GitHub Actions will automatically deploy!
```

---

## 🎊 Success!

Your app is now live at `https://your-domain.com`!

**What you have:**
- ✅ Production app with SSL
- ✅ Automated deployments (if setup)
- ✅ Daily backups at 2 AM UTC
- ✅ Health monitoring
- ✅ All under $6/month!

---

## 🆘 Troubleshooting

### App won't start?
```bash
docker-compose logs app
```

### SSL issues?
```bash
./scripts/setup-ssl.sh your-domain.com your-email@example.com
```

### Database connection issues?
```bash
docker-compose run --rm app npx prisma db pull
# Check Neon dashboard
```

### Need to restart?
```bash
docker-compose restart
```

---

## 📚 Next Steps

1. ✅ Test all features on your live site
2. ✅ Read [2-COMMANDS.md](./2-COMMANDS.md) for daily operations
3. ✅ Use [3-CHECKLIST.md](./3-CHECKLIST.md) to verify everything
4. ✅ Setup monitoring (Uptime Robot)
5. ✅ Invite users!

---

**Need help?** Check [2-COMMANDS.md](./2-COMMANDS.md) for common commands or open a GitHub issue.
