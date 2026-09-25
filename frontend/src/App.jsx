import { useState } from "react";
import "./index.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // -----------------------------------------
  // Select PDF
  // -----------------------------------------

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please select a PDF file.");
      return;
    }

    setSelectedFile(file);
    setError("");
    setMessage("");
  };

  // -----------------------------------------
  // Change / reset PDF
  // -----------------------------------------

  const changeFile = () => {
    setSelectedFile(null);
    setUploadedFile(null);
    setMessage("");
    setError("");
  };

  // -----------------------------------------
  // Upload PDF
  // -----------------------------------------

 const uploadPDF = async () => {
  if (!selectedFile) {
    setError("Please select a PDF first.");
    return;
  }

  setUploading(true);
  setError("");
  setMessage("");

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch(
     `${API_URL}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Upload failed");
    }

    setUploadedFile(data.filename);
    setMessage(
      `PDF uploaded successfully! ${data.pages} pages and ${data.chunks} chunks created.`
    );

  } catch (error) {
    console.error("Upload error:", error);
    setError(error.message);
  } finally {
    setUploading(false);
  }
};

  // -----------------------------------------
  // Ask AI
  // -----------------------------------------

  const askAI = async (customQuestion = null) => {
    const finalQuestion = customQuestion || question;

    if (!finalQuestion.trim()) {
      setError("Please enter a question.");
      return;
    }

    setLoading(true);
    setError("");
    setAnswer("");
    setSources([]);

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: finalQuestion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong.");
      }

      setAnswer(data.answer || "");
      setSources(data.sources || []);
    } catch (error) {
      setError(
        error.message ||
          "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // Study actions
  // -----------------------------------------

  const generateSummary = () => {
    askAI(
      "Give me a clear and easy-to-understand summary of the important topics in the uploaded study material. Organize the answer using headings and bullet points."
    );
  };

  const generateQuiz = () => {
    askAI(
      "Create 5 multiple-choice questions from the uploaded study material. Give 4 options for each question and clearly provide the correct answer with a short explanation."
    );
  };

  const generateFlashcards = () => {
    askAI(
      "Create 8 useful study flashcards from the uploaded study material. Format each flashcard as Question and Answer. Focus on important concepts and definitions."
    );
  };

  return (
    <div className="app">

      {/* =====================================
          NAVBAR
      ====================================== */}

      <nav className="navbar">

        <div className="brand">
          <div className="brand-icon">
            ✦
          </div>

          <div>
            <h2>Query<span>Leaf</span></h2>
            <p>AI Study Mentor</p>
          </div>
        </div>

        <div className="nav-badge">
          <span className="status-dot"></span>
          Gemini AI
        </div>

      </nav>


      {/* =====================================
          HERO
      ====================================== */}

      <section className="hero">

  <div className="hero-content">

    <div className="hero-badge">
      ✨ AI-Powered Learning
    </div>

    <h1>
      Learn Smarter.
      <br />
      <span>Understand Better.</span>
    </h1>

    <p>
      Upload your study material and let AI help you
      understand concepts, answer questions, create
      quizzes and prepare for exams.
    </p>

    <div className="hero-pipeline">
      <strong>Upload</strong>
      <span>→</span>
      <strong>Embed</strong>
      <span>→</span>
      <strong>Retrieve</strong>
      <span>→</span>
      <strong>Answer</strong>
    </div>

  </div>

</section>


      {/* =====================================
          MAIN CONTENT
      ====================================== */}

      <main className="main-container">

        {/* LEFT SIDE */}

        <div className="left-column">

          {/* PDF UPLOAD CARD */}

          <div className="card upload-card">

            <div className="card-heading">

              <div className="heading-icon blue">
                📄
              </div>

              <div>
                <h3>Study Material</h3>
                <p>Upload your PDF notes or textbook</p>
              </div>

            </div>


            <label className="upload-box">

              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
              />

              <div className="upload-icon">
                ↑
              </div>

              <h4>
                {selectedFile
                  ? selectedFile.name
                  : "Drop your PDF here"}
              </h4>

              <p>
                or click to browse from your computer
              </p>

              <span className="file-type">
                PDF • MAX 20MB
              </span>

            </label>


            <button
              className="primary-button"
              onClick={uploadPDF}
              disabled={uploading || !selectedFile}
            >

              {uploading ? (
                <>
                  <span className="spinner"></span>
                  Processing PDF...
                </>
              ) : (
                <>
                  Upload & Analyze
                  <span>→</span>
                </>
              )}

            </button>


            {uploadedFile && (
              <div className="upload-success">

                <div className="success-icon">
                  ✓
                </div>

                <div className="upload-success-text">
                  <strong>
                    {uploadedFile.filename}
                  </strong>

                  <p>
                    {uploadedFile.pages} pages •{" "}
                    {uploadedFile.chunks} chunks
                  </p>
                </div>

                <button
                  className="change-file-btn"
                  onClick={changeFile}
                  type="button"
                >
                  ✕ Change
                </button>

              </div>
            )}

          </div>


          {/* STUDY TOOLS */}

          <div className="card">

            <div className="card-heading">

              <div className="heading-icon pink">
                ⚡
              </div>

              <div>
                <h3>Study Tools</h3>
                <p>Turn your material into useful resources</p>
              </div>

            </div>


            <div className="tools-grid">

              <button
                className="tool-card"
                onClick={generateSummary}
              >

                <div className="tool-icon summary-icon">
                  📝
                </div>

                <div>
                  <strong>Summary</strong>
                  <span>Quick revision notes</span>
                </div>

              </button>


              <button
                className="tool-card"
                onClick={generateQuiz}
              >

                <div className="tool-icon quiz-icon">
                  ❓
                </div>

                <div>
                  <strong>Quiz</strong>
                  <span>Test your knowledge</span>
                </div>

              </button>


              <button
                className="tool-card"
                onClick={generateFlashcards}
              >

                <div className="tool-icon flashcard-icon">
                  🃏
                </div>

                <div>
                  <strong>Flashcards</strong>
                  <span>Remember key concepts</span>
                </div>

              </button>

            </div>

          </div>

        </div>


        {/* RIGHT SIDE */}

        <div className="right-column">

          <div className="card chat-card">

            <div className="chat-header">

              <div className="ai-avatar">
                ✦
              </div>

              <div>
                <h3>Ask StudyRAG</h3>
                <p>
                  Ask anything from your uploaded material
                </p>
              </div>

              <div className="online-status">
                <span></span>
                Online
              </div>

            </div>


            {/* SCROLLABLE BODY: question, messages, answer, empty state */}

            <div className="chat-body">

              {/* QUESTION INPUT */}

              <div className="question-area">

                <textarea
                  value={question}
                  onChange={(e) =>
                    setQuestion(e.target.value)
                  }
                  placeholder="Ask something about your study material..."
                  rows="4"
                />

                <button
                  className="ask-button"
                  onClick={() => askAI()}
                  disabled={loading}
                >

                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Thinking...
                    </>
                  ) : (
                    <>
                      Ask AI
                      <span>✦</span>
                    </>
                  )}

                </button>

              </div>


              {/* ERROR */}

              {error && (
                <div className="error-message">
                  <span>!</span>
                  {error}
                </div>
              )}


              {/* SUCCESS MESSAGE */}

              {message && !error && (
                <div className="message">
                  <span>✓</span>
                  {message}
                </div>
              )}


              {/* ANSWER */}

              {answer && (
                <div className="answer-section">

                  <div className="answer-title">
                    <div className="mini-ai">
                      ✦
                    </div>

                    <div>
                      <strong>AI Answer</strong>
                      <span>Generated from your study material</span>
                    </div>
                  </div>


                  <div className="answer-content">
                    {answer}
                  </div>


                  {/* SOURCES */}

                  {sources.length > 0 && (

                    <div className="sources">

                      <h4>
                        📌 Sources
                      </h4>

                      <div className="source-list">

                        {sources.map(
                          (source, index) => (

                            <div
                              className="source-item"
                              key={index}
                            >

                              <span className="source-number">
                                {index + 1}
                              </span>

                              <div>
                                <strong>
                                  {source.file}
                                </strong>

                                <p>
                                  Page {source.page}
                                </p>
                              </div>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )}

                </div>
              )}


              {/* EMPTY STATE */}

              {!answer && !loading && (

                <div className="empty-state">

                  <div className="empty-icon">
                    💬
                  </div>

                  <h4>
                    Your AI study assistant is ready
                  </h4>

                  <p>
                    Upload a PDF and ask a question to
                    start learning.
                  </p>

                </div>

              )}

            </div>

          </div>

        </div>

      </main>


      {/* =====================================
          FOOTER
      ====================================== */}

      <footer>

        <p>
          Study<span>RAG</span> • Powered by RAG + ChromaDB + Gemini
        </p>

        <div>
          <span>Embeddings</span>
          <span>Vector Search</span>
          <span>AI</span>
        </div>

      </footer>

    </div>
  );
}

export default App;