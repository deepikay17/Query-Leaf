import os
import time
import chromadb

from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai import errors

load_dotenv()

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
FALLBACK_MODEL = os.getenv("GEMINI_FALLBACK_MODEL", "gemini-3.5-flash-lite")

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

chroma_client = chromadb.PersistentClient(
    path="../data/chroma"
)

collection = chroma_client.get_or_create_collection(
    name="study_documents"
)


# -----------------------------
# Generate document embeddings
# -----------------------------
def generate_document_embeddings(texts):

    response = client.models.embed_content(
        model="gemini-embedding-001",
        contents=texts,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_DOCUMENT",
            output_dimensionality=768
        )
    )

    return [
        embedding.values
        for embedding in response.embeddings
    ]


# -----------------------------
# Generate query embedding
# -----------------------------
def generate_query_embedding(query):

    response = client.models.embed_content(
        model="gemini-embedding-001",
        contents=query,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_QUERY",
            output_dimensionality=768
        )
    )

    return response.embeddings[0].values


# -----------------------------
# Remove all previously stored PDFs
# -----------------------------
def clear_documents():
    global collection

    chroma_client.delete_collection(name="study_documents")

    collection = chroma_client.get_or_create_collection(
        name="study_documents"
    )


# -----------------------------
# Add PDF chunks to ChromaDB
# -----------------------------
def add_documents(chunks, filename):

    texts = [
        chunk["text"]
        for chunk in chunks
    ]

    embeddings = generate_document_embeddings(texts)

    ids = []
    metadatas = []

    for index, chunk in enumerate(chunks):

        ids.append(
            f"{filename}_{index}"
        )

        metadatas.append({
            "source": filename,
            "page": chunk["page"]
        })

    collection.upsert(
        ids=ids,
        documents=texts,
        embeddings=embeddings,
        metadatas=metadatas
    )

    return len(texts)


# -----------------------------
# Retrieve relevant chunks
# -----------------------------
def retrieve_documents(query, number_of_results=5):

    query_embedding = generate_query_embedding(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=number_of_results,
        include=[
            "documents",
            "metadatas",
            "distances"
        ]
    )

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    retrieved = []

    for document, metadata, distance in zip(
        documents,
        metadatas,
        distances
    ):

        retrieved.append({
            "text": document,
            "source": metadata["source"],
            "page": metadata["page"],
            "distance": distance
        })

    return retrieved


# -----------------------------
# Call Gemini with retry
# (retries on temporary errors such as 503 "high demand")
# -----------------------------
def call_gemini(prompt, retries=3):

    # Try the main model first, then fall back to a second model
    # if the main one stays overloaded.
    models_to_try = [GEMINI_MODEL, FALLBACK_MODEL]
    last_error = None

    for model_name in models_to_try:

        for attempt in range(retries):

            try:
                return client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )

            except errors.APIError as e:

                last_error = e
                temporary_error = e.code in (429, 500, 503, 504)

                if not temporary_error:
                    raise  # real error (bad key, wrong model, etc.)

                if attempt < retries - 1:
                    time.sleep(2 ** attempt)  # waits 1s, 2s

        # this model kept failing -> move on to the next model

    raise last_error


# -----------------------------
# Generate AI answer
# -----------------------------
def generate_answer(question):

    retrieved_documents = retrieve_documents(question)

    if not retrieved_documents:

        return {
            "answer": "I could not find relevant information in the uploaded documents.",
            "sources": []
        }

    context_parts = []

    for index, document in enumerate(
        retrieved_documents,
        start=1
    ):

        context_parts.append(
            f"""
SOURCE {index}
File: {document['source']}
Page: {document['page']}

{document['text']}
"""
        )

    context = "\n".join(context_parts)

    prompt = f"""
You are StudyRAG, an AI study assistant.

Answer the student's question using ONLY the information
provided in the context below.

If the answer cannot be found in the context,
clearly say that the information is not available
in the uploaded documents.

Explain the answer in simple language suitable
for a student.

Do not invent facts.

Question:
{question}

Context:
{context}
"""

    response = call_gemini(prompt)

    sources = []

    for document in retrieved_documents:

        sources.append({
            "file": document["source"],
            "page": document["page"]
        })

    return {
        "answer": response.text,
        "sources": sources
    }