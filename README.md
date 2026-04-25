# Elucia

**AI-Powered Music Gear Manual Assistant**

Elucia helps music producers and beginners learn synthesizers and drum machines through conversational AI. Instead of reading dense technical manuals, users can ask questions and get instant, context-aware answers powered by RAG (Retrieval Augmented Generation).

---

## 🎯 Vision

Make music production equipment accessible to everyone by transforming static manuals into interactive learning experiences.

**Problem**: Technical manuals for synths and drum machines are overwhelming for beginners.

**Solution**: Chat with an AI that knows your gear inside and out.

---

## ✨ Features

### Free Tier
- Browse 3-5 curated music gear manuals
- Ask 3-5 basic "how do I..." questions per day
- Instant AI-powered responses
- No account required

### Premium Tier ($9.99/month)
- Full library of all manuals (Moog synths, Akai drum machines, etc.)
- Unlimited questions
- Advanced sound design questions
- Chat history saved across sessions
- Priority support

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14+** (App Router) - React framework with SSR
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Component library
- **Vercel** - Deployment

### Backend
- **Django 5.0+** - Python web framework
- **Django REST Framework** - API toolkit
- **PostgreSQL** - Primary database
- **Supabase** - Managed Postgres + Auth + pgvector
- **Celery** - Async task processing (PDF ingestion)
- **Redis** - Celery broker + caching

### AI/ML
- **OpenAI API** - GPT-4 for chat responses
- **OpenAI Embeddings** - text-embedding-3-small
- **Supabase pgvector** - Vector similarity search
- **LangChain** - RAG orchestration (optional)

### Storage & Services
- **AWS S3** / **Vercel Blob** - PDF storage
- **Stripe** - Payment processing
- **Supabase Auth** - User authentication

---

## 📁 Project Structure

```
elucia/
├── backend/                    # Django backend
│   ├── elucia/                 # Django project
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── accounts/           # User management
│   │   ├── manuals/            # Manual CRUD
│   │   ├── chat/               # Chat API
│   │   ├── payments/           # Stripe integration
│   │   └── rag/                # RAG pipeline
│   ├── scripts/
│   │   └── ingest_manual.py    # PDF ingestion script
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── development.txt
│   │   └── production.txt
│   ├── manage.py
│   └── pytest.ini
│
├── frontend/                   # Next.js frontend
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/
│   │   │   ├── manuals/
│   │   │   └── chat/[id]/
│   │   ├── api/                # API route handlers (proxy to Django)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                 # Shadcn components
│   │   ├── ChatInterface.tsx
│   │   ├── ManualCard.tsx
│   │   ├── ManualLibrary.tsx
│   │   └── UsageMeter.tsx
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   ├── supabase.ts         # Supabase client
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   ├── public/
│   ├── next.config.js
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                       # Documentation
│   ├── SETUP.md
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── .gitignore
├── docker-compose.yml          # Local development
└── README.md
```

---

## 🚀 Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

```bash
# Clone the repository
git clone https://github.com/jdez23/elucia.git
cd elucia

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements/development.txt
python manage.py migrate
python manage.py runserver

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` for the frontend and `http://localhost:8000/api` for the backend.

---

## 📊 Database Schema

### Core Tables

**users** (Supabase Auth)
- id, email, subscription_tier, stripe_customer_id, created_at

**manuals**
- id, name, manufacturer, category, pdf_url, thumbnail_url, is_premium, created_at

**manual_chunks** (Vector storage)
- id, manual_id, content, embedding (vector), page_number, section_title, created_at

**conversations**
- id, user_id (nullable), manual_id, title, created_at, updated_at

**messages**
- id, conversation_id, role (user/assistant), content, created_at

**usage_logs**
- id, user_id, session_id, action_type, created_at

---

## 🔄 RAG Pipeline

### Manual Ingestion Flow
1. Download PDF from manufacturer
2. Extract text using PyPDF2/pdfplumber
3. Split into chunks (~500-1000 tokens)
4. Generate embeddings via OpenAI API
5. Store in `manual_chunks` with pgvector

### Query Flow
1. User asks question
2. Generate question embedding
3. Similarity search in pgvector (top 5-10 chunks)
4. Construct prompt with context
5. Stream GPT-4 response
6. Save to chat history (if premium)

---

## 🎯 MVP Roadmap

### Phase 1: Core Infrastructure (Weeks 1-2)
- ✅ Django project setup
- ✅ Next.js project setup
- ✅ Database schema design
- ✅ Supabase integration
- ✅ Basic authentication

### Phase 2: PDF Ingestion (Weeks 2-3)
- PDF processing pipeline
- Embedding generation
- Vector storage setup
- Test retrieval accuracy

### Phase 3: Chat Interface (Weeks 3-4)
- Chat API endpoints
- Real-time streaming
- Frontend chat UI
- Manual selection

### Phase 4: Premium Features (Weeks 4-5)
- Usage tracking
- Stripe integration
- Subscription flow
- Feature gating

### Phase 5: Polish & Launch (Weeks 5-6)
- UI/UX refinements
- Error handling
- Landing page
- Production deployment

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

---

## 📝 Environment Variables

Required environment variables (see `.env.example`):

**Backend**
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `REDIS_URL`

**Frontend**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- Music producers who struggle with gear manuals
- Open source community
- Moog, Akai, and other manufacturers for making incredible instruments

---

## 📧 Contact

**Jesse Hernandez** - Software Engineering Apprentice @ Apple

- GitHub: [@jdez23](https://github.com/jdez23)
- Portfolio: [jesse-hernandez-portfolio.netlify.app](https://jesse-hernandez-portfolio.netlify.app)
- Email: jessemhernandez123@gmail.com

---