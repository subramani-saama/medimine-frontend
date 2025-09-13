import React, { useState } from 'react';
import axios from 'axios';
import { config } from '../config';
import './UploadForm.css'

const UploadForm = ({ onNewUpload }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }

        setIsUploading(true);
        setError('');

        try {
            // 1. Get a pre-signed URL from our API
            const presignedUrlResponse = await axios.post(`${config.API_URL}/presigned-url`, {
    filename: file.name,
    contentType: file.type // <-- ADD THIS LINE
});

            const { uploadUrl, documentId } = presignedUrlResponse.data;

            // 2. Create a placeholder document to show in the UI immediately
            const newDoc = {
                documentId: documentId,
                'brainstomers-01': documentId, // To match your DynamoDB PK
                filename: file.name,
                status: 'Uploading...',
                createdAt: Math.floor(Date.now() / 1000)
            };
            onNewUpload(newDoc); // Pass it to the Dashboard

            // 3. Upload the file directly to S3 using the pre-signed URL
            await axios.put(uploadUrl, file, {
                headers: { 'Content-Type': file.type }
            });

            // The S3 trigger will now automatically start the backend process.
            // The WebSocket will handle updating the status from 'Uploading...' to 'Processing' and then 'Complete'.

        } catch (err) {
            console.error('Upload failed:', err);
            setError('File upload failed. Please try again.');
        } finally {
            setIsUploading(false);
            setFile(null);
            e.target.reset(); // Clear the file input
        }
    };

    return (
    <div className="upload-form-container">
        <h3>Upload a New Document</h3>
        <form onSubmit={handleSubmit}>
             <label className="file-input-wrapper">
                <span className="file-input-button">Choose File</span>
                <input type="file" onChange={handleFileChange} accept=".pdf,.docx" disabled={isUploading} style={{ display: 'none' }} />
            </label>
            {file && <span className="file-name">{file.name}</span>}
            <button type="submit" className="upload-button" disabled={isUploading || !file}>
                {isUploading ? 'Uploading...' : 'Upload & Analyze'}
            </button>
        </form>
        {error && <p className="error-message">{error}</p>}
    </div>
);
};

export default UploadForm;