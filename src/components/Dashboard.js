import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { config } from '../config';
import UploadForm from './UploadForm';
import ResultsTable from './ResultsTable';
import DetailsModal from './DetailsModal';
import './Dashboard.css'; // We'll create this CSS file

const Dashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const socket = useRef(null);

    // ... (fetchDocuments and useEffect hooks remain the same as before) ...
    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${config.API_URL}/results`);
            setDocuments(response.data.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1));
        } catch (error) {
            console.error("Error fetching documents:", error);
            alert("Could not fetch documents. Please check the API URL in config.js.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();

        socket.current = new WebSocket(config.WEBSOCKET_URL);
        socket.current.onopen = () => console.log("WebSocket Connected");
        socket.current.onclose = () => console.log("WebSocket Disconnected");

        socket.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'update') {
                setDocuments(prevDocs =>
                    prevDocs.map(doc =>
                        doc.documentId === message.document.documentId ? message.document : doc
                    )
                );
            }
        };

        return () => socket.current.close();
    }, []);


    const handleNewUpload = (newDoc) => {
        setDocuments(prevDocs => [newDoc, ...prevDocs]);
        
        const registerPayload = JSON.stringify({
            action: 'register',
            documentId: newDoc.documentId,
        });

        const trySend = () => {
            if (socket.current.readyState === WebSocket.OPEN) {
                socket.current.send(registerPayload);
            } else {
                setTimeout(trySend, 1000); // Retry if not yet open
            }
        };
        trySend();
    };

    // --- NEW FILTERING LOGIC ---
    const processingDocuments = documents.filter(doc => 
        doc.status === 'Uploading...' || doc.status === 'Processing'
    );

    const historicalDocuments = documents.filter(doc => 
        doc.status === 'Complete' || doc.status === 'Failed'
    );
    // -------------------------

    return (
        <div className="dashboard-container">
            <UploadForm onNewUpload={handleNewUpload} />
            
            {processingDocuments.length > 0 && (
                <div className="processing-section">
                    <h3>Currently Processing</h3>
                    <ResultsTable
                        documents={processingDocuments}
                        onViewDetails={() => {}}
                        isLoading={false}
                    />
                </div>
            )}

            <div className="history-section">
                <h2>Analysis History</h2>
                <ResultsTable
                    documents={historicalDocuments}
                    onViewDetails={setSelectedDoc}
                    isLoading={isLoading}
                />
            </div>

            {selectedDoc && (
                <DetailsModal
                    document={selectedDoc}
                    onClose={() => setSelectedDoc(null)}
                />
            )}
        </div>
    );
};

export default Dashboard;