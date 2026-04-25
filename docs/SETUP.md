# Elucia Setup Guide

Complete setup instructions for local development environment.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** and npm ([Download](https://nodejs.org/))
- **PostgreSQL 15+** ([Download](https://www.postgresql.org/download/)) *OR use Supabase*
- **Redis** ([Download](https://redis.io/download)) for Celery
- **Git** ([Download](https://git-scm.com/downloads))

**Accounts Needed:**
- [Supabase](https://supabase.com) - Database + Auth
- [OpenAI](https://platform.openai.com) - API access
- [Stripe](https://stripe.com) - Payment processing (test mode)

---

## 🚀 Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/jdez23/elucia.git
cd elucia
```

### 2. Create Environment Files

Create `.env` files in both backend and frontend directories:

```bash
# Backend
touch backend/.env

# Frontend
touch frontend/.env.local
```

---

## 🐍 Backend Setup (Django)

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate

# Windows:
venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements/development.txt
```

**requirements/base.txt** should include:
```txt
Django==5.0.0
djangorestframework==3.14.0
django-cors-headers==4.3.1
psycopg2-binary==2.9.9
python-dotenv==1.0.0
openai==1.6.1
langchain==0.1.0
pgvector==0.2.4
celery==5.3.4
redis==5.0.1
stripe==7.9.0
PyPDF2==3.0.1
pdfplumber==0.10.3
supabase==2.3.0
```

### 3. Configure Environment Variables

Edit `backend/.env`:

```bash
# Django
SECRET_KEY=your-secret-key-here-generate-with-django
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (Supabase)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key

# OpenAI
OPENAI_API_KEY=sk-...your-openai-api-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_...your-webhook-secret
STRIPE_PRICE_ID=price_...your-price-id-for-premium

# Redis (for Celery)
REDIS_URL=redis://localhost:6379/0

# AWS S3 (optional, can use Vercel Blob instead)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=elucia-manuals
AWS_S3_REGION_NAME=us-east-1

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### 4. Set Up Supabase

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and anon key

2. **Enable pgvector Extension**
   - In Supabase Dashboard → SQL Editor
   - Run: `CREATE EXTENSION IF NOT EXISTS vector;`

3. **Get Database URL**
   - Settings → Database → Connection String (URI)
   - Copy and paste into `DATABASE_URL`

### 5. Configure Django Settings

The project uses split settings. Check `backend/elucia/settings/`:

**base.py** - Common settings
**development.py** - Local development
**production.py** - Production settings

Set environment variable:
```bash
export DJANGO_SETTINGS_MODULE=elucia.settings.development
```

### 6. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Superuser

```bash
python manage.py createsuperuser
```

### 8. Install pgvector Models

Add to your Django models (in `apps/rag/models.py`):

```python
from django.db import models
from pgvector.django import VectorField

class ManualChunk(models.Model):
    manual = models.ForeignKey('manuals.Manual', on_delete=models.CASCADE)
    content = models.TextField()
    embedding = VectorField(dimensions=1536)  # OpenAI embedding size
    page_number = models.IntegerField(null=True, blank=True)
    section_title = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['manual']),
        ]
```

### 9. Start Redis (for Celery)

```bash
# macOS (using Homebrew)
brew services start redis

# Linux
sudo systemctl start redis

# Windows
# Download and run Redis from: https://github.com/microsoftarchive/redis/releases
```

### 10. Start Celery Worker (optional for MVP)

In a new terminal:

```bash
cd backend
source venv/bin/activate
celery -A elucia worker -l info
```

### 11. Run Django Development Server

```bash
python manage.py runserver
```

Backend should be running at `http://localhost:8000`

Test it: `http://localhost:8000/api/`

---

## ⚛️ Frontend Setup (Next.js)

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

**Key packages** (check `package.json`):
```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "@stripe/stripe-js": "^2.4.0",
    "axios": "^1.6.5",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  }
}
```

### 3. Configure Environment Variables

Edit `frontend/.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...your-stripe-publishable-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Install Shadcn/ui Components

```bash
npx shadcn-ui@latest init
```

Follow prompts:
- Style: Default
- Base color: Slate
- CSS variables: Yes

Install needed components:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add separator
```

### 5. Set Up Supabase Client

Create `frontend/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 6. Run Development Server

```bash
npm run dev
```

Frontend should be running at `http://localhost:3000`

---

## 🔧 Additional Configuration

### Setting up Stripe

1. **Create Stripe Account** (test mode)
   - Go to [stripe.com](https://stripe.com)
   - Get your test API keys

2. **Create Product and Price**
   - Dashboard → Products → Add Product
   - Name: "Elucia Premium"
   - Price: $9.99/month (recurring)
   - Copy the Price ID → use in `STRIPE_PRICE_ID`

3. **Set Up Webhook** (for production)
   - Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### Setting up OpenAI

1. **Get API Key**
   - Go to [platform.openai.com](https://platform.openai.com)
   - API keys → Create new secret key
   - Copy and use in `OPENAI_API_KEY`

2. **Set Usage Limits** (recommended)
   - Organization settings → Limits
   - Set monthly budget to avoid unexpected costs

### Setting up AWS S3 (optional)

If you want to use S3 instead of Vercel Blob:

1. **Create S3 Bucket**
   - Name: `elucia-manuals`
   - Region: `us-east-1` (or your preferred region)
   - Block all public access: OFF (we'll use presigned URLs)

2. **Create IAM User**
   - Create user with programmatic access
   - Attach policy: `AmazonS3FullAccess` (or create custom policy)
   - Save access key and secret

3. **Configure CORS** (in S3 bucket settings)
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
        "ExposeHeaders": []
    }
]
```

---

## 🧪 Testing the Setup

### Backend Tests

```bash
cd backend
pytest

# Run specific test
pytest apps/chat/tests/test_rag.py -v

# With coverage
pytest --cov=apps --cov-report=html
```

### Frontend Tests

```bash
cd frontend
npm test

# With coverage
npm test -- --coverage
```

### Manual Testing Checklist

- [ ] Backend API accessible at `http://localhost:8000/api/`
- [ ] Frontend loads at `http://localhost:3000`
- [ ] Can create account via Supabase Auth
- [ ] Can log in and log out
- [ ] Manual library page displays
- [ ] Can start a chat conversation
- [ ] AI responds to questions (requires OpenAI key)
- [ ] Usage tracking works for free tier
- [ ] Stripe checkout redirects properly (test mode)

---

## 📦 Ingesting Your First Manual

### 1. Download a Manual PDF

Example: Download Moog Subsequent 37 manual from manufacturer website.

### 2. Run Ingestion Script

```bash
cd backend
python scripts/ingest_manual.py \
  --pdf-path /path/to/manual.pdf \
  --name "Moog Subsequent 37" \
  --manufacturer "Moog" \
  --category "synth" \
  --is-premium false
```

### 3. Verify in Database

```bash
python manage.py shell
```

```python
from apps.manuals.models import Manual
from apps.rag.models import ManualChunk

# Check manual was created
manuals = Manual.objects.all()
print(manuals)

# Check chunks were created
chunks = ManualChunk.objects.filter(manual=manuals.first())
print(f"Total chunks: {chunks.count()}")
```

### 4. Test in Frontend

- Go to `http://localhost:3000/manuals`
- Select the manual you just ingested
- Ask a question: "How do I set up the oscillator?"
- Verify you get a relevant response

---

## 🐳 Docker Setup (Optional)

For a containerized development environment:

### 1. Install Docker Desktop

[Download Docker](https://www.docker.com/products/docker-desktop/)

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: ankane/pgvector:latest
    environment:
      POSTGRES_DB: elucia
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    command: npm run dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    env_file:
      - ./frontend/.env.local
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 3. Run with Docker

```bash
docker-compose up
```

Access:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

---

## 🚨 Common Issues & Troubleshooting

### Issue: `ImportError: No module named pgvector`

**Solution:**
```bash
pip install pgvector
```

### Issue: Frontend can't connect to backend

**Solution:**
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure Django CORS settings allow `http://localhost:3000`
- Check `backend/elucia/settings/base.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

### Issue: Supabase connection failed

**Solution:**
- Verify `DATABASE_URL` format is correct
- Check if Supabase project is paused (free tier pauses after inactivity)
- Ensure pgvector extension is enabled

### Issue: OpenAI API rate limit errors

**Solution:**
- Check your OpenAI usage limits
- Implement retry logic with exponential backoff
- Consider caching responses for identical questions

### Issue: Redis connection refused

**Solution:**
```bash
# Check if Redis is running
redis-cli ping
# Should return "PONG"

# If not running, start it
brew services start redis  # macOS
sudo systemctl start redis  # Linux
```

---

## 📚 Next Steps

After setup is complete:

1. **Read the API Documentation** - See `docs/API.md`
2. **Review Database Schema** - Check `backend/apps/*/models.py`
3. **Start Building Features** - Follow the MVP roadmap in README.md
4. **Join Development** - Create feature branches and open PRs

---

## 💡 Development Tips

### Hot Reloading

Both Django and Next.js support hot reloading:
- Django: Automatically reloads on file changes
- Next.js: Fast Refresh updates React components instantly

### Debugging

**Backend:**
```python
import pdb; pdb.set_trace()  # Python debugger
```

**Frontend:**
```typescript
console.log('Debug:', variable)  // Browser console
debugger;  // Browser debugger
```

### Database Migrations

When you change Django models:
```bash
python manage.py makemigrations
python manage.py migrate
```

To reset database (⚠️ deletes all data):
```bash
python manage.py flush
```

---

## 🤝 Getting Help

- **Issues**: Open an issue on GitHub
- **Questions**: Check existing documentation first
- **Updates**: Pull latest changes regularly: `git pull origin main`

---

**Setup complete! You're ready to build Elucia. 🎉**