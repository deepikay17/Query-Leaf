import os
import shutil
import tempfile

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from pdf_processor import (
    extract_text_from_pdf,
    create_chunks
)

from rag import (
    add_documents,
    generate_answer,
    clear_documents
)


app = FastAPI(
    title="StudyRAG API",
    description="AI-powered personalized study assistant",
    version="1.0"
)

# --------------------------------------------------
# Enable CORS Middleware
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://query-leaf-vert.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allows POST, GET, OPTIONS, etc.
    allow_headers=["*"],  # Allows all headers (Content-Type, etc.)
)

# --------------------------------------------------
# Home
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "StudyRAG API is running!"
    }


# --------------------------------------------------
# Upload PDF
# --------------------------------------------------

@app.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...)
):

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    temporary_file = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".pdf"
    )

    try:
        contents = await file.read()

        temporary_file.write(contents)
        temporary_file.close()

        # Extract text
        pages = extract_text_from_pdf(
            temporary_file.name
        )

        if not pages:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from this PDF."
            )

        # Create chunks
        chunks = create_chunks(pages)

        # Remove old PDFs so answers only come from this one
        clear_documents()

        # Store in ChromaDB
        number_of_chunks = add_documents(
            chunks,
            file.filename
        )

        return {
            "message": "PDF uploaded successfully!",
            "filename": file.filename,
            "pages": len(pages),
            "chunks": number_of_chunks
        }

    finally:
        if os.path.exists(
            temporary_file.name
        ):
            os.remove(
                temporary_file.name
            )


# --------------------------------------------------
# Ask question
# --------------------------------------------------

class QuestionRequest(BaseModel):
    question: str


@app.post("/ask")
def ask_question(
    request: QuestionRequest
):

    if not request.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    try:
        result = generate_answer(
            request.question
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"AI service error: {e}"
        )

    return result