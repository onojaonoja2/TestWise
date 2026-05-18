# TestWise Demo Script
## AI Engineer Interview - 10-15 Minute Walkthrough

---

## SLIDE 1: Title (30 seconds)

**"Hello, I'm Samuel Onoja. Today I'll walk you through TestWise - an AI-powered examination platform I built and shipped."**

**Key Points:**
- Problem: Teachers spend hours creating exam questions
- Solution: AI-assisted exam creation from documents
- Demo covers: Document chat, question generation, live streaming

---

## SLIDE 2: The Problem (1 minute)

**"Before TestWise, creating exams was manual and time-consuming."**

| Before | After |
|--------|-------|
| Read document manually | Upload → AI extracts |
| Create questions one-by-one | AI generates 5-50 questions |
| Hours of work | Minutes |
| Inconsistent quality | Consistent AI-powered |

**"I wanted to create something that lets teachers just upload a document and get quiz questions."**

---

## SLIDE 3: Architecture Overview (2 minutes)

*(Show architecture-diagram.svg)*

**"Here's how the system is built. Three main layers:"**

1. **Client Layer** - React/Next.js with streaming chat UI
2. **Server Layer** - API routes + BullMQ worker
3. **Data Layer** - PostgreSQL + S3 + Redis

**Key components:**
- **S3**: Stores uploaded files (`uploads/{userId}/{uuid}-{filename}`)
- **Redis + BullMQ**: Async job processing for document extraction
- **PostgreSQL**: Stores extracted text, conversations, questions

**"This separation allows the app to handle large documents without blocking the user."**

---

## SLIDE 4: Document Processing Pipeline (2 minutes)

*(Show pipeline-diagram.svg)*

**"When a document is uploaded, here's what happens:"**

1. **Upload** → File goes to S3, Document record created (status: PROCESSING)
2. **Queue** → BullMQ job added to Redis
3. **Worker** → Background process downloads from S3, extracts text using PDF.js/Mammoth
4. **Store** → Full text saved to database (status: READY)
5. **Query** → Users can chat with document or generate questions

**"Total time: ~2-5 seconds. Compare this to the old chunking approach which took 5+ minutes."**

---

## SLIDE 5: The Critical Decision - LLM-Native vs RAG (2 minutes)

*(Show decision-diagram.svg)*

**"I made a key architectural decision early on - and it was wrong at first."**

### First Attempt: RAG with Chunking
- Split document into 10,000 chunks
- Generate embeddings for each chunk
- Store in pgvector
- Use vector search to find relevant chunks
- Send to LLM

**"This failed because:"**
- Embedding generation: 38+ batches × 100 chunks
- Database timeouts (Prisma transaction expired after 5 seconds)
- Users waited 5+ minutes with no feedback
- Complex infrastructure for the use case

### Pivot: LLM-Native Approach
- Store full document text in database
- Send entire document to LLM on query
- Streaming response for better UX

**"Modern LLMs handle long contexts well. Token budgets beat the complexity of chunking for chat use cases."**

---

## SLIDE 6: Live Demo - Document Chat (2 minutes)

*(Show the actual UI)*

**"Let me show you the chat feature. I uploaded a PDF earlier."**

**Steps to demonstrate:**
1. Open a document in chat view
2. Ask: "What is the main topic of this document?"
3. Show streaming response appearing token-by-token
4. Ask follow-up: "Can you summarize it in 3 sentences?"

**"Notice the streaming - you see the response appear in real-time. This reduces perceived wait time."**

**Key implementation details:**
- Uses Server-Sent Events (SSE)
- Tokens stream as generated
- Full conversation saved to database for context

---

## SLIDE 7: Live Demo - Question Generation (2 minutes)

*(Show the generation feature)*

**"Now let me show question generation from the same document."**

**Steps to demonstrate:**
1. Navigate to document detail page
2. Click "Generate Questions"
3. Configure: Multiple Choice, 5 questions, Medium difficulty
4. Show LLM generating questions based on document content
5. Review generated questions
6. Approve/Reject individual questions
7. Apply to test

**"This is where the AI really shines - the questions are based strictly on the document content."**

---

## SLIDE 8: Tech Stack & Tradeoffs (2 minutes)

*(Show decision-diagram.svg - right side)*

**"Here's what I chose and why:"**

| Choice | Alternative | Tradeoff |
|--------|-------------|----------|
| LLM-Native | RAG + Chunking | Speed over precision |
| Streaming SSE | Polling | Better UX vs complexity |
| AWS S3 | PostgreSQL BYTEA | Scalability vs simplicity |
| BullMQ + Redis | Sync Processing | Reliability vs added infra |

**"Each decision was driven by specific requirements. For chat, speed matters more than pixel-perfect retrieval."**

---

## SLIDE 9: What I'd Change (1 minute)

**"If I were rebuilding this today, here's what I'd add:"**

1. **Semantic Chunking** - Sentence-based instead of fixed-size
2. **Caching Layer** - Cache LLM responses for repeated queries
3. **Hybrid Search** - Combine semantic + keyword search for precision
4. **Multi-doc Queries** - "Compare this document with that one"

**"The core insight remains: simple solutions often beat complex ones."**

---

## SLIDE 10: Key Numbers (30 seconds)

**"Here's the performance improvement:"**

| Metric | Old Approach | New Approach |
|--------|--------------|---------------|
| Document Processing | 5+ minutes | 2-5 seconds |
| Chunks Generated | 10,000 | 0 |
| Embedding Batches | 38+ | 0 |
| DB Transaction Timeouts | Multiple | None |

**"This is the result of choosing simplicity over complexity."**

---

## CLOSING (30 seconds)

**"TestWise demonstrates:"**
- ✅ Shipped working AI product
- ✅ Real infrastructure decisions
- ✅ Lessons learned from failures
- ✅ Modern streaming UX

**"The code is in production, handling real users. I'm happy to discuss any aspect in detail."**

---

## HANDLING QUESTIONS

**Q: Why not use a vector database like Pinecone?**
A: "For chat with single documents, the overhead wasn't worth it. The LLM handles context well. If we needed cross-document search or million+ documents, I'd reconsider."

**Q: How do you handle large documents?**
A: "Truncate to ~100k characters and warn the user. For most educational documents, this is sufficient."

**Q: What's your token cost strategy?**
A: "OpenRouter provides unified access. Each query sends the full document (~4k-50k tokens) plus conversation history. For exam creation, this is acceptable cost."

---

## Files to Reference

- `docs/images/architecture-diagram.svg` - System architecture
- `docs/images/pipeline-diagram.svg` - Document flow
- `docs/images/decision-diagram.svg` - Tradeoffs and learnings
- `app/api/documents/[id]/chat/stream/route.ts` - Streaming implementation
- `lib/rag/generator.ts` - Question generation
- `workers/document-worker.ts` - Background processing