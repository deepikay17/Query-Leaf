# 🍃 QueryLeaf

Chat with your notes. Upload a PDF, ask questions, and get answers
grounded in your own material, plus built-in study tools.

## Features
- Upload PDFs (notes, textbooks) and ask questions about them
- Answers generated with Google Gemini using retrieval-augmented generation (RAG)
- Study Tools section for revision

## Tech Stack
- **Frontend:** React (Vite)
- **Backend:** FastAPI (Python)
- **Vector store:** ChromaDB
- **AI:** Google Gemini (google-genai SDK)

## Project Structure
queryleaf/
├── backend/
│   ├── main.py            # FastAPI app and API routes
│   ├── rag.py             # embeddings, retrieval, Gemini answers
│   ├── pdf_processor.py   # PDF text extraction and chunking
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx        # main UI
    │   └── main.jsx
    └── package.json

## How It Works
1. The PDF is uploaded and its text is split into chunks.
2. Each chunk is converted to an embedding and stored in ChromaDB.
3. For a question, the most relevant chunks are retrieved.
4. Gemini answers using only those chunks as context.

## Setup

### 1. Backend
bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

Create a `backend/.env` file:

GEMINI_API_KEY=your_key_here

Run the server:
bash
uvicorn main:app --reload

### 2. Frontend
bash
cd frontend
npm install
npm run dev
