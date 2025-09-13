import React, { useState } from 'react';
import axios from 'axios';
import { config } from '../config';


const QnaSection = ({ documentId }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAskQuestion = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;
        setIsLoading(true);
        setAnswer('Thinking...');
        try {
            const response = await axios.post(`${config.API_URL}/results/${documentId}/query`, { question });
            setAnswer(response.data.answer);
        } catch (error) {
            setAnswer("Sorry, an error occurred while processing your question.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Auto-resize the textarea
    const handleTextareaChange = (e) => {
        setQuestion(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    return (
        <div className="qna-section">
            <h4>Ask a Question</h4>
            <form onSubmit={handleAskQuestion}>
                <div className="input-area">
                    <textarea
                        value={question}
                        onChange={handleTextareaChange}
                        placeholder="Ask anything about this document..."
                        disabled={isLoading}
                        rows="1"
                        aria-label="Ask a question about the document"
                    />
                    <button type="submit" className="send-button" disabled={isLoading || !question.trim()} aria-label="Send question">
                        <svg fill="currentColor" viewBox="0 0 16 16" height="1em" width="1em">
                            <path d="M15.854.146a.5.5 0 01.11.54l-5.819 14.547a.75.75 0 01-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 01.124-1.33L15.314.037a.5.5 0 01.54.11zM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07z"/>
                        </svg>
                    </button>
                </div>
            </form>
            
            {answer && (
                <div className="answer-container">
                    <div className="ai-avatar">AI</div>
                    <div className="answer-bubble">
                        <p>{answer}</p>
                    </div>
                </div>
            )}
        </div>
    );
};


const DetailsModal = ({ document, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>{document.filename}</h2>
                <div className="modal-section">
                    <h3>Summary</h3>
                    <p>{document.summary}</p>
                </div>
                <div className="modal-section">
                    <h3>Extracted Entities</h3>
                    <table className="entities-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Text</th>
                                <th>Context</th>
                            </tr>
                        </thead>
                        <tbody>
                            {document.entities.map((entity, index) => (
                                <tr key={index}>
                                    <td>{entity.category}</td>
                                    <td>{entity.text}</td>
                                    <td className="context-cell">{entity.context}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="modal-section">
                    <QnaSection documentId={document.documentId} />
                </div>
            </div>
        </div>
    );
};

export default DetailsModal;