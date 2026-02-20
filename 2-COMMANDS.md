# 🛠️ Daily Commands Reference

Quick reference for common operations after deployment.

---

## 🚀 Deployment Commands

### Deploy Latest Changes
```bash
cd /opt/questy
./scripts/deploy.sh
```

### View Deployment Logs
```bash
docker-compose logs -f app
```

### Restart Application
```bash
docker-compose restart
```

---

## 📊 Monitoring Commands

### Check Application Status
```bash
docker-compose ps
```

### Check Health
```bash
curl http://localhost:3000/api/health
```

### View Resource Usage
```bash
docker stats
```

### Full Monitoring Dashboard
```bash
./scripts/monitor.sh
```

---

## 📝 Log Commands

### View All Logs
```bash
docker-compose logs -f
```

### View App Logs Only
```bash
docker-compose logs -f app
```

### View Last 100 Lines
```bash
docker-compose logs --tail=100 app
```

### View Nginx Logs
```bash
docker-compose logs -f nginx
```

---

## 💾 Backup Commands

### Manual Backup
```bash
./scripts/backup-db.sh
```

### List Backups
```bash
ls -lh backups/
```

### Restore from Backup
```bash
# Example - replace with your backup file
gunzip -c backups/questy_backup_20240101_020000.sql.gz | \
docker run --rm -i \
  -e PGPASSWORD=your-password \
  postgres:15-alpine \
  psql -h your-neon-host -U your-user -d your-db
```

---

## 🗄️ Database Commands

### Run Migrations
```bash
docker-compose run --rm app npx prisma migrate deploy
```

### Open Prisma Studio (for debugging)
```bash
docker-compose run --rm -p 5555:5555 app npx prisma studio
# Visit http://YOUR_VPS_IP:5555
```

### Test Database Connection
```bash
docker-compose run --rm app npx prisma db pull
```

---

## 🔐 SSL Commands

### Renew SSL Certificate
```bash
docker-compose run --rm certbot renew
docker-compose exec nginx nginx -s reload
```

### Check Certificate Status
```bash
docker-compose run --rm certbot certificates
```

### Get New Certificate
```bash
./scripts/setup-ssl.sh your-domain.com your-email@example.com
```

---

## 🐳 Docker Commands

### Start Containers
```bash
docker-compose up -d
```

### Stop Containers
```bash
docker-compose down
```

### Restart Containers
```bash
docker-compose restart
```

### Rebuild Images
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Clean Up Old Images
```bash
docker image prune -f
docker system prune -a
```

---

## 🔧 Troubleshooting Commands

### Container Won't Start
```bash
# Check logs
docker-compose logs app

# Check status
docker-compose ps

# Restart
docker-compose restart app
```

### Out of Disk Space
```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a --volumes

# Clean old backups
rm backups/questy_backup_*.sql.gz
```

### App is Slow
```bash
# Check resource usage
docker stats

# Check disk space
df -h

# View logs for errors
docker-compose logs --tail=100 app
```

### Database Connection Issues
```bash
# Test connection
docker-compose run --rm app npx prisma db pull

# Check Neon dashboard for issues
# Verify connection strings in .env.production
```

---

## 📦 Update Commands

### Update Application Code
```bash
cd /opt/questy
git pull origin main
./scripts/deploy.sh
```

### Update Dependencies
```bash
# Edit package.json
nano package.json

# Rebuild and deploy
./scripts/deploy.sh
```

### Update Environment Variables
```bash
# Edit .env.production
nano .env.production

# Restart containers
docker-compose restart
```

---

## 🔍 Inspection Commands

### View Container Configuration
```bash
docker-compose config
```

### View Environment Variables
```bash
docker-compose run --rm app env
```

### Access Container Shell
```bash
docker-compose exec app sh
```

### View Nginx Configuration
```bash
docker-compose exec nginx cat /etc/nginx/nginx.conf
```

---

## 🚨 Emergency Commands

### Site is Down - Quick Restart
```bash
docker-compose restart
```

### Site is Down - Full Restart
```bash
docker-compose down
docker-compose up -d
```

### Rollback to Previous Version
```bash
cd /opt/questy
git log --oneline  # Find previous commit
git checkout COMMIT_HASH
./scripts/deploy.sh
```

### Emergency Stop
```bash
docker-compose down
```

---

## 📊 Useful One-Liners

### Check if App is Responding
```bash
curl -f http://localhost:3000/api/health && echo "OK" || echo "FAIL"
```

### View Last 50 Lines of Logs
```bash
docker-compose logs --tail=50 app
```

### Restart Everything
```bash
docker-compose down && docker-compose up -d
```

### Check Container Health
```bash
docker inspect --format='{{.State.Health.Status}}' questy-app
```

---

## 💡 Pro Tips

1. **Always check logs first**: `docker-compose logs -f app`
2. **Monitor regularly**: Run `./scripts/monitor.sh` weekly
3. **Keep backups**: Run `./scripts/backup-db.sh` before major changes
4. **Test locally**: Use `npm run docker:test` before deploying
5. **Use auto-deploy**: Setup GitHub Actions for easier updates

---

## 📚 Need More Help?

- **Deployment Guide**: [1-DEPLOY.md](./1-DEPLOY.md)
- **Checklist**: [3-CHECKLIST.md](./3-CHECKLIST.md)
- **GitHub Issues**: Open an issue for bugs
- **GitHub Discussions**: Ask questions

---

**Quick Reference Card:**

| Task | Command |
|------|---------|
| Deploy | `./scripts/deploy.sh` |
| Logs | `docker-compose logs -f app` |
| Restart | `docker-compose restart` |
| Status | `docker-compose ps` |
| Health | `curl http://localhost:3000/api/health` |
| Backup | `./scripts/backup-db.sh` |
| Monitor | `./scripts/monitor.sh` |
