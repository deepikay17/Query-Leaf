# QueryLeaf 🍃✨

**AI Study Mentor** — Upload your notes, ask questions, and get instant AI-powered answers grounded in your own study material.

QueryLeaf lets you upload a PDF (notes, textbook, slides) and then chat with it — ask questions, generate summaries, quizzes, and flashcards, all powered by Retrieval-Augmented Generation (RAG) so answers stay grounded in your actual material with cited sources.

🔗 **Live Demo (Frontend):** [query-leaf-vert.vercel.app](https://query-leaf-vert.vercel.app)
🔗 **Backend API:** [query-leaf.onrender.com](https://query-leaf.onrender.com) ([API docs](https://query-leaf.onrender.com/docs))

---

## Features

- 📄 **PDF Upload** — Upload your notes or textbook (max 20MB)
- 💬 **Ask StudyRAG** — Ask anything about your uploaded material, with cited sources (file + page)
- 📝 **Summary Generator** — Instant, organized revision notes
- ❓ **Quiz Generator** — Auto-generated multiple-choice questions with explanations
- 🃏 **Flashcards** — Key concepts turned into Q&A flashcards for quick recall

---

## Tech Stack

**Frontend**
- React 19 + Vite
- Deployed on [Vercel](https://vercel.com)

**Backend**
- FastAPI (Python)
- [google-genai](https://pypi.org/project/google-genai/) SDK — Gemini for embeddings and generation
- ChromaDB — vector storage for PDF chunks
- Deployed on [Render](https://render.com)

**RAG Pipeline**
- PDFs are parsed and chunked
- Chunks embedded using `gemini-embedding-001`
- Relevant chunks retrieved via ChromaDB on each query
- Answers generated using `gemini-3.6-flash` (with `gemini-3.5-flash-lite` as fallback)

---

## Project Structure

```
Query-Leaf/
├── frontend/          # React + Vite app
│   └── src/
│       └── App.jsx
└── backend/           # FastAPI app
    ├── main.py        # API routes (upload, ask)
    └── rag.py         # RAG pipeline (embeddings, retrieval, generation)
```

---

## Getting Started Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Create a `.env` file in `backend/` with:

```
GEMINI_API_KEY=your_key_here
```

Backend runs at `http://127.0.0.1:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file in `frontend/` with:

```
VITE_API_URL=http://127.0.0.1:8000
```

Frontend runs at `http://localhost:5173`

---

## Deployment

- **Backend** is deployed on Render as a Python web service (`uvicorn main:app --host 0.0.0.0 --port $PORT`)
- **Frontend** is deployed on Vercel, with `VITE_API_URL` set to the Render backend URL
- CORS is configured on the backend to allow requests from the deployed Vercel origin

---

## Roadmap

- [ ] Persistent storage for uploaded PDFs and vector data
- [ ] Multi-document support
- [ ] User accounts and saved study sessions

---

Built with ❤️ using FastAPI, React, ChromaDB, and Gemini.
