# 📚 Questy - Educational Materials Platform

A Next.js platform for teachers to share and monetize educational materials with integrated M-Pesa payments.

## ✨ Features

- 🎓 Teacher registration and verification
- 📄 PDF upload and management
- 💳 M-Pesa payment integration
- 👨‍🎓 Student material browsing and purchasing
- 💰 Teacher wallet and withdrawals
- 🔐 OAuth authentication (Google, GitHub)
- 👑 Admin dashboard
- ⭐ Reviews and ratings

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Fill in your environment variables

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

Visit `http://localhost:3000`

## 🐳 Docker Deployment

**Deploy to production in 30 minutes with Docker + VPS.**

Then follow the guides in order:
1. **[1-DEPLOY.md](./1-DEPLOY.md)** - Deploy to production
2. **[2-COMMANDS.md](./2-COMMANDS.md)** - Daily commands
3. **[3-CHECKLIST.md](./3-CHECKLIST.md)** - Verify deployment

### Quick Test Locally

```bash
npm run docker:test
```

### Cost: $6/month

- VPS: $5/month
- Domain: $1/month  
- Database: Free
- SSL: Free

## 📦 Tech Stack

- Next.js 16 (App Router)
- PostgreSQL (Neon)
- Prisma ORM
- NextAuth.js v5
- M-Pesa API
- Tailwind CSS
- Docker + Nginx

## 🛠️ NPM Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Docker
npm run docker:test      # Test Docker locally
npm run docker:up        # Start containers
npm run docker:down      # Stop containers
npm run docker:logs      # View logs
```

## 📚 Documentation

**Start here:** [START.md](./START.md)

Then read in order:
1. [1-DEPLOY.md](./1-DEPLOY.md) - Deployment guide
2. [2-COMMANDS.md](./2-COMMANDS.md) - Commands reference
3. [3-CHECKLIST.md](./3-CHECKLIST.md) - Verification checklist

**Quick deploy:** [QUICK-START.md](./QUICK-START.md) (for experienced devs)

## 🔒 Security

- SSL/TLS encryption
- Security headers
- CSRF protection
- Input validation
- Environment isolation

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📝 License

MIT License

---

**Ready to deploy?** Start with [START.md](./START.md)! 🚀
