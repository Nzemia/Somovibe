# ✅ Deployment Checklist

Use this to verify your deployment is complete and working correctly.

---

## Pre-Deployment

### Infrastructure
- [ ] VPS created (Hetzner CX11 or similar)
- [ ] VPS IP address noted
- [ ] Domain registered
- [ ] Domain DNS pointed to VPS IP (A records for @ and www)
- [ ] Neon PostgreSQL database created
- [ ] Database connection strings ready

### Code & Repository
- [ ] All code pushed to GitHub
- [ ] `.env.production` is in `.gitignore`
- [ ] Docker files committed
- [ ] Scripts are in repository

---

## VPS Setup

### Initial Configuration
- [ ] SSH access works
- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] Git installed
- [ ] Deployer user created
- [ ] Repository cloned to `/opt/questy`

### Environment
- [ ] `.env.production` created
- [ ] `DATABASE_URL` configured
- [ ] `NEXTAUTH_URL` set to your domain
- [ ] `NEXTAUTH_SECRET` generated
- [ ] `NEXT_PUBLIC_BASE_URL` set
- [ ] OAuth credentials added (if using)
- [ ] M-Pesa credentials added (if using)
- [ ] Resend API key added (if using)

### SSL Certificate
- [ ] Domain in `nginx/conf.d/default.conf` updated
- [ ] SSL certificate obtained
- [ ] Certificate auto-renewal configured
- [ ] HTTPS working (green padlock)

---

## Deployment

### Application
- [ ] `./scripts/deploy.sh` ran successfully
- [ ] Containers are running: `docker-compose ps`
- [ ] No errors in logs: `docker-compose logs app`
- [ ] Health check passes: `curl http://localhost:3000/api/health`
- [ ] Site accessible at `https://your-domain.com`

### Database
- [ ] Migrations applied successfully
- [ ] Can connect to database
- [ ] Prisma Client generated

---

## Functionality Testing

### Basic Features
- [ ] Homepage loads
- [ ] User registration works
- [ ] Login works (credentials)
- [ ] Login works (Google OAuth) - if configured
- [ ] Login works (GitHub OAuth) - if configured

### Teacher Features
- [ ] Teacher registration works
- [ ] PDF upload works
- [ ] Teacher dashboard accessible
- [ ] Wallet visible

### Student Features
- [ ] Browse materials works
- [ ] Material details page works
- [ ] Purchase flow works (M-Pesa) - if configured
- [ ] Download works after purchase

### Admin Features
- [ ] Admin dashboard accessible
- [ ] Teacher approval works
- [ ] Material approval works
- [ ] User management works

---

## Security

### Firewall
- [ ] UFW enabled (if using)
- [ ] Port 22 (SSH) allowed
- [ ] Port 80 (HTTP) allowed
- [ ] Port 443 (HTTPS) allowed
- [ ] All other ports blocked

### SSL/TLS
- [ ] HTTPS working
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate valid
- [ ] Certificate auto-renewal configured

### Access Control
- [ ] Root login disabled (optional but recommended)
- [ ] SSH key authentication working
- [ ] Fail2ban installed (optional but recommended)

---

## Monitoring & Backups

### Monitoring
- [ ] Health endpoint working: `/api/health`
- [ ] Can view logs: `docker-compose logs`
- [ ] Can check status: `docker-compose ps`
- [ ] Monitoring script works: `./scripts/monitor.sh`

### Backups
- [ ] Manual backup works: `./scripts/backup-db.sh`
- [ ] Backup file created in `backups/` directory
- [ ] GitHub Actions backup workflow configured
- [ ] Daily backups running at 2 AM UTC

---

## Automation (Optional)

### GitHub Actions
- [ ] SSH key generated on VPS
- [ ] GitHub secrets configured:
  - [ ] `VPS_HOST`
  - [ ] `VPS_USERNAME`
  - [ ] `VPS_SSH_KEY`
  - [ ] `VPS_PORT`
- [ ] Auto-deploy workflow tested
- [ ] Deployment succeeds on push to main

---

## Performance

### Speed
- [ ] Site loads quickly (< 3 seconds)
- [ ] Images load properly
- [ ] No console errors in browser

### Resources
- [ ] Memory usage acceptable: `docker stats`
- [ ] Disk space sufficient: `df -h`
- [ ] CPU usage normal

---

## Documentation

### Team Access
- [ ] Team members have VPS access (if applicable)
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Emergency contacts listed

---

## Cost Verification

### Monthly Costs
- [ ] VPS: $5/month ✅
- [ ] Domain: ~$1/month ✅
- [ ] Database: Free ✅
- [ ] SSL: Free ✅
- [ ] **Total: ~$6/month** ✅ Under $10 budget!

---

## Post-Deployment

### Monitoring Setup
- [ ] Uptime monitoring configured (Uptime Robot, etc.)
- [ ] Error tracking setup (optional)
- [ ] Analytics configured (optional)

### Maintenance Plan
- [ ] Know how to deploy updates
- [ ] Know how to check logs
- [ ] Know how to restart services
- [ ] Know how to restore from backup

---

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ Site is live at `https://your-domain.com`
- ✅ SSL certificate working (green padlock)
- ✅ All core features functional
- ✅ Health endpoint responding
- ✅ Backups running
- ✅ Monitoring in place
- ✅ Under $10/month cost

---

## 🆘 If Something is Wrong

### Quick Fixes

**Site not loading?**
```bash
docker-compose ps
docker-compose logs app
docker-compose restart
```

**SSL not working?**
```bash
./scripts/setup-ssl.sh your-domain.com your-email@example.com
```

**Database errors?**
```bash
docker-compose run --rm app npx prisma db pull
# Check Neon dashboard
```

**Need to restart everything?**
```bash
docker-compose down
docker-compose up -d
```

---

## 📚 Next Steps

After completing this checklist:

1. ✅ Bookmark [2-COMMANDS.md](./2-COMMANDS.md) for daily operations
2. ✅ Setup external monitoring (Uptime Robot)
3. ✅ Test all features thoroughly
4. ✅ Invite beta users
5. ✅ Monitor logs regularly

---

**All checked?** Congratulations! Your Questy app is successfully deployed! 🎊

**Need help?** Check [2-COMMANDS.md](./2-COMMANDS.md) or open a GitHub issue.
