// In ResultsTable.js
import React from 'react';
import './ResultsTable.css'; // Import the new CSS

const ResultsTable = ({ documents, onViewDetails, isLoading }) => {
    if (isLoading) return <p>Loading history...</p>;
    if (!documents.length) return <p>No documents found.</p>;

    return (
        <div className="results-grid">
            {documents.map((doc) => (
                <div key={doc.documentId} className="document-card">
                    <div>
                        <p className="filename">{doc.filename}</p>
                        <span className={`status status-${doc.status?.toLowerCase().replace(/\s/g, '-')}`}>
                            {doc.status}
                        </span>
                    </div>
                    <div className="card-actions">
                         <button
                            onClick={() => onViewDetails(doc)}
                            disabled={doc.status !== 'Complete'}
                        >
                            View Details
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ResultsTable;