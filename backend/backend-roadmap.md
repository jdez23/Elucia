# Elucia Backend Development Roadmap

## Current Status: ✅ Phase 0 Complete - Foundation Setup

---

## 📋 Remaining Work Breakdown

### **PHASE 1: Data Models & Database Schema** ✅ COMPLETED

**Why this phase first?**
- Models are the foundation - everything else depends on them
- Need to define data structure before building API endpoints
- Migrations must run before we can store any data
- Establishes relationships between entities

#### Tasks:
- [x] **1.1 - accounts/models.py**: Create UserProfile model
  - Extends Django User with subscription_tier, stripe_customer_id
  - One-to-one relationship with User
  
- [x] **1.2 - manuals/models.py**: Create Manual model
  - Store gear metadata (name, manufacturer, category, pdf_path, etc.)
  - is_premium flag for free/premium gating
  
- [x] **1.3 - chat/models.py**: Create Conversation & Message models
  - Conversation: Links user + manual + timestamps
  - Message: Stores individual chat messages (role, content)
  - ForeignKey relationships
  
- [x] **1.4 - payments/models.py**: Create StripeCustomer model (optional)
  - Skipped - using UserProfile for Stripe data
  
- [x] **1.5 - Usage tracking**: Create UsageLog model in accounts or chat app
  - Track free tier question count
  - session_id for anonymous users
  
- [x] **1.6**: Run makemigrations and migrate
- [x] **1.7**: Test models in Django shell
- [x] **1.8**: Add __str__ methods and Meta options

**Deliverable**: ✅ Fully functional database schema with all tables created

---

### **PHASE 2: Django Admin Interface** ✅ COMPLETED

**Why this phase second?**
- Gives you a UI to view/manage data immediately
- Helpful for testing and debugging
- Can manually create test data
- Quick win that helps with all future development

#### Tasks:
- [x] **2.1**: Register all models in admin.py files
- [x] **2.2**: Customize admin display (list_display, search_fields, filters)
- [x] **2.3**: Add inline editing for related models (MessageInline in Conversation)
- [x] **2.4**: Test admin interface at http://localhost:8000/admin
- [x] **2.5**: Create test data manually (2 manuals created for testing)

**Deliverable**: ✅ Working admin panel to manage all data

---

### **PHASE 3: API Serializers** ✅ COMPLETED

**Why this phase third?**
- Serializers convert models to/from JSON
- Needed before building API endpoints
- Defines what data the frontend receives
- Handles validation and data transformation

#### Tasks:
- [x] **3.1 - manuals/serializers.py**: ManualSerializer
  - All fields for list view (ManualListSerializer)
  - Detail view with additional metadata (ManualSerializer)
  
- [x] **3.2 - chat/serializers.py**: ConversationSerializer & MessageSerializer
  - Nested relationships (conversation includes messages)
  - Read-only vs writable fields
  - ConversationListSerializer for lightweight listings
  
- [x] **3.3 - accounts/serializers.py**: UserSerializer & UserProfileSerializer
  - Safe user data exposure (no passwords)
  - Subscription status
  - UserRegistrationSerializer for signup
  
- [x] **3.4**: Test serializers in Django shell

**Deliverable**: ✅ JSON serializers for all models

---

### **PHASE 4: Basic API Endpoints** ✅ COMPLETED

**Why this phase fourth?**
- Now we have models + serializers, ready to expose via API
- Start with read-only endpoints (safer, simpler)
- Build CRUD operations systematically
- Frontend needs these to display data

#### Tasks:
- [x] **4.1 - manuals/views.py & urls.py**: 
  - GET /api/manuals/ (list all manuals)
  - GET /api/manuals/:id/ (single manual detail)
  - Add pagination (DRF default)
  - Add filtering by category, manufacturer, is_premium
  
- [x] **4.2 - chat/views.py & urls.py**:
  - POST /api/conversations/ (create new conversation)
  - GET /api/conversations/ (list user's conversations)
  - GET /api/conversations/:id/ (conversation detail with messages)
  - POST /api/conversations/:id/messages/ (send message - placeholder response)
  
- [x] **4.3 - accounts/views.py & urls.py**:
  - POST /api/auth/register/ (user registration)
  - POST /api/auth/login/ (user login)
  - POST /api/auth/logout/ (user logout)
  - GET /api/users/me/ (current user profile)
  
- [x] **4.4**: Configure main urls.py to include all app routes
- [x] **4.5**: Test all endpoints with DRF browsable API

**Deliverable**: ✅ Working REST API for manuals, conversations, users

---

### **PHASE 5: External Service Integration** (Estimated: 3-4 hours)

**Why this phase fifth?**
- Need API keys from external services
- Can build endpoints without this, but need it for functionality
- RAG pipeline is core feature - should come before auth/payments
- Tests core value proposition early

#### Tasks:
- [ ] **5.1**: Create Pinecone account & index
  - Index name: elucia-manuals
  - Dimensions: 1536
  - Get API key and environment
  
- [ ] **5.2**: Get OpenAI API key
  - Set up billing (start with $5 credit)
  - Add to .env
  
- [ ] **5.3 - rag/pinecone_client.py**: Create Pinecone client wrapper
  - Initialize Pinecone connection
  - upsert_vectors() method
  - query_vectors() method
  
- [ ] **5.4 - rag/openai_client.py**: Create OpenAI client wrapper
  - get_embedding() method
  - chat_completion() method (with streaming)
  
- [ ] **5.5**: Test both clients independently

**Deliverable**: Working connections to Pinecone and OpenAI

---

### **PHASE 6: PDF Ingestion Pipeline** (Estimated: 4-5 hours)

**Why this phase sixth?**
- Need vector database set up first (Phase 5)
- Creates the knowledge base for RAG
- Once done, can test actual Q&A functionality
- Critical for MVP but can be manual process initially

#### Tasks:
- [ ] **6.1 - rag/pdf_processor.py**: Create PDF text extraction
  - Use PyPDF2 or pdfplumber
  - Extract text page by page
  - Clean and normalize text
  
- [ ] **6.2 - rag/text_chunker.py**: Create chunking logic
  - Split text into ~500-1000 token chunks
  - Preserve context (overlap between chunks)
  - Include metadata (page number, section)
  
- [ ] **6.3 - scripts/ingest_manual.py**: Create command-line script
  - Accept PDF path as argument
  - Extract → Chunk → Embed → Upload to Pinecone
  - Store manual metadata in Django
  - Progress indicators
  
- [ ] **6.4**: Test with 1-2 real manual PDFs
- [ ] **6.5**: Verify vectors stored in Pinecone
- [ ] **6.6**: Create Django management command (optional but cleaner)
  - python manage.py ingest_manual --pdf path/to/manual.pdf

**Deliverable**: Working pipeline to ingest PDFs into vector database

---

### **PHASE 7: RAG Query Pipeline & Chat Endpoint** (Estimated: 4-5 hours)

**Why this phase seventh?**
- Have models, API, vector DB, and ingested content
- This is the CORE feature - chat with AI about manuals
- Everything comes together here
- Most complex part, so build on solid foundation

#### Tasks:
- [ ] **7.1 - rag/query_pipeline.py**: Create RAG query logic
  - Take user question → generate embedding
  - Query Pinecone for top 5-10 relevant chunks
  - Format chunks as context for LLM
  - Call OpenAI with context + question
  - Return streaming response
  
- [ ] **7.2 - chat/views.py**: Implement chat message endpoint
  - POST /api/conversations/:id/messages/
  - Call RAG pipeline
  - Stream response back to client (Server-Sent Events or WebSocket)
  - Save user message + AI response to database
  
- [ ] **7.3**: Add error handling
  - Rate limit errors
  - OpenAI API errors
  - Pinecone connection issues
  
- [ ] **7.4**: Test full flow end-to-end
  - Create conversation
  - Ask question about manual
  - Verify correct chunks retrieved
  - Verify coherent AI response
  
- [ ] **7.5**: Add response quality improvements
  - Better prompt engineering
  - Citation of sources (page numbers)
  - Handle "I don't know" cases

**Deliverable**: Fully functional AI chat about gear manuals

---

### **PHASE 8: Authentication & Permissions** (Estimated: 3 hours)

**Why this phase eighth?**
- Core functionality works, now add access control
- Need working endpoints before securing them
- Easier to test without auth first
- Can gate features behind premium tier

#### Tasks:
- [ ] **8.1**: Set up Django authentication
  - Use Django's built-in auth (session-based)
  - Or add django-rest-framework-simplejwt for JWT tokens
  
- [ ] **8.2**: Create login/logout/signup endpoints
  - POST /api/auth/register/
  - POST /api/auth/login/
  - POST /api/auth/logout/
  
- [ ] **8.3**: Create permission classes
  - IsAuthenticatedOrReadOnly
  - IsPremiumUser (custom)
  - IsOwner (can only access own conversations)
  
- [ ] **8.4**: Apply permissions to endpoints
  - Chat requires authentication
  - Some manuals require premium
  
- [ ] **8.5**: Implement usage tracking
  - Count questions for free users
  - Enforce 3-5 question daily limit
  - Reset counter daily (Celery task or check timestamp)

**Deliverable**: Secure API with user authentication and tier-based access

---

### **PHASE 9: Stripe Payment Integration** (Estimated: 3-4 hours)

**Why this phase ninth?**
- Need auth system first (users must exist)
- Payment is important but not needed for core testing
- Can test everything else without payment working
- Easier to debug without payment complexity

#### Tasks:
- [ ] **9.1**: Create Stripe account (test mode)
- [ ] **9.2**: Create product & price ($9.99/month recurring)
- [ ] **9.3 - payments/views.py**: Create checkout endpoint
  - POST /api/payments/create-checkout-session/
  - Creates Stripe checkout session
  - Returns checkout URL for frontend
  
- [ ] **9.4**: Create webhook endpoint
  - POST /api/payments/stripe-webhook/
  - Handle checkout.session.completed
  - Handle customer.subscription.updated
  - Handle customer.subscription.deleted
  - Update user's subscription_tier in database
  
- [ ] **9.5**: Test with Stripe test cards
  - 4242 4242 4242 4242 (success)
  - Test subscription lifecycle
  
- [ ] **9.6**: Add subscription status endpoint
  - GET /api/users/me/subscription/

**Deliverable**: Working payment flow with subscription management

---

### **PHASE 10: Polish & Error Handling** (Estimated: 2-3 hours)

**Why this phase tenth?**
- Core functionality complete
- Now improve user experience
- Handle edge cases
- Production readiness

#### Tasks:
- [ ] **10.1**: Add comprehensive error handling
  - Validation errors (clear messages)
  - 404s for missing resources
  - 403s for permission denied
  - 500s with safe error messages (no stack traces)
  
- [ ] **10.2**: Add rate limiting
  - django-ratelimit or DRF throttling
  - Per-endpoint limits
  - Different limits for free vs premium
  
- [ ] **10.3**: Add logging
  - Log all API requests
  - Log errors with context
  - Use Python logging module
  
- [ ] **10.4**: Add API documentation
  - Use drf-spectacular for OpenAPI/Swagger
  - Or write manual docs
  
- [ ] **10.5**: Optimize queries
  - Add select_related/prefetch_related
  - Database indexes on frequent lookups
  
- [ ] **10.6**: Add CORS properly
  - Lock down to specific frontend domain in production

**Deliverable**: Production-ready, polished API

---

### **PHASE 11: Testing** (Estimated: 4-6 hours)

**Why this phase eleventh?**
- Should write tests throughout, but can batch them
- Core functionality must work before comprehensive testing
- Tests ensure nothing breaks as you add features
- Required for production confidence

#### Tasks:
- [ ] **11.1**: Set up test database configuration
- [ ] **11.2**: Write model tests
  - Test all model methods
  - Test model relationships
  - Test constraints and validations
  
- [ ] **11.3**: Write API endpoint tests
  - Test all CRUD operations
  - Test authentication/permissions
  - Test error cases
  
- [ ] **11.4**: Write RAG pipeline tests
  - Mock Pinecone/OpenAI calls
  - Test chunking logic
  - Test embedding generation
  
- [ ] **11.5**: Write integration tests
  - Full user flows (signup → ask question → subscribe)
  
- [ ] **11.6**: Achieve >70% code coverage
- [ ] **11.7**: Set up CI/CD to run tests automatically

**Deliverable**: Comprehensive test suite

---

### **PHASE 12: Optional Enhancements** (As time permits)

#### Tasks:
- [ ] **12.1**: Add Celery for async tasks
  - Async PDF processing
  - Email notifications
  - Daily usage reset
  
- [ ] **12.2**: Add caching with Redis
  - Cache frequently asked questions
  - Cache manual metadata
  
- [ ] **12.3**: Add file upload endpoint
  - Allow users to upload PDFs (premium feature)
  
- [ ] **12.4**: Add conversation export
  - Export chat history as PDF/JSON
  
- [ ] **12.5**: Add analytics
  - Track popular manuals
  - Track common questions
  
- [ ] **12.6**: Add email notifications
  - Subscription confirmations
  - Usage limit warnings

**Deliverable**: Enhanced features beyond MVP

---

## 🎯 Why This Order Is Optimal

### 1. **Foundation First (Phases 1-2)**
- Can't build anything without data models
- Admin panel gives immediate visibility into data
- Establishes database structure everything relies on

### 2. **API Layer (Phases 3-4)**
- Serializers bridge models and HTTP
- Basic endpoints let you test data flow
- Can manually test with curl before building frontend

### 3. **Core Feature (Phases 5-7)**
- External services → Ingestion → RAG Query
- This is the unique value proposition
- Test the hardest part early (fail fast if it doesn't work)
- Build on working foundation

### 4. **Access Control (Phase 8)**
- Easier to test without auth initially
- Need working endpoints before securing them
- Auth touches many endpoints, so add it once features are stable

### 5. **Monetization (Phase 9)**
- Need users before you can charge them
- Payment is important but orthogonal to core functionality
- Can test full app without payment working

### 6. **Quality & Production (Phases 10-11)**
- Polish when features are complete
- Tests ensure nothing breaks during polish
- Production prep is last because requirements are clear

### Key Principles:
- **Build vertically**: Complete one feature end-to-end before moving to next
- **Fail fast**: Test risky/hard parts (RAG, AI) early
- **Iterate**: Each phase produces something testable
- **Dependencies matter**: Can't do Phase 7 without Phase 5
- **Value first**: Core feature (chat) before nice-to-haves (payments)

---

## 📊 Time Estimates

- **Phase 1**: 2-3 hours (Models)
- **Phase 2**: 1 hour (Admin)
- **Phase 3**: 2 hours (Serializers)
- **Phase 4**: 3-4 hours (API Endpoints)
- **Phase 5**: 3-4 hours (External Services)
- **Phase 6**: 4-5 hours (PDF Ingestion)
- **Phase 7**: 4-5 hours (RAG & Chat)
- **Phase 8**: 3 hours (Auth)
- **Phase 9**: 3-4 hours (Payments)
- **Phase 10**: 2-3 hours (Polish)
- **Phase 11**: 4-6 hours (Testing)

**Total Core Backend**: ~32-42 hours of focused work
**Per day (4 hours)**: ~8-10 days
**Per day (6-8 hours)**: ~4-7 days

---

## 🚀 Current Status & Next Steps

**You are here**: ✅ **Phases 1-4 Complete!**

**Completed:**
1. ✅ Phase 1: Data Models - All models created and migrated
2. ✅ Phase 2: Django Admin - Full admin interface working
3. ✅ Phase 3: API Serializers - All serializers implemented
4. ✅ Phase 4: API Endpoints - REST API fully functional

**Overall Progress: ~60% of backend complete**

**Next Phase**: **Phase 5 - External Service Integration**

Let's begin with:
1. Create Pinecone account and index
2. Get OpenAI API key
3. Create client wrappers for both services
4. Test connections

**Ready to start Phase 5?**