'use client';

// import { useState } from 'react';
// import axios from 'axios';

const UploadForm = () => {
   

    return (
        <input
            type="file"
            multiple
            onChange={event => {
                if (event.target.files) {
                    const files = Array.from(event.target.files);
                    uploadFiles(files, 'user-id'); // Replace 'user-id' with the actual user ID
                }
            }}
        />
    );
};

export default UploadForm;


async function uploadFiles(files: File[], userId: string) {
    const uploadPromises = files.map(async (file) => {
        // Generate a unique filename to avoid conflicts and special character issues
        const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        // Step 1: Get presigned POST URL for each file
        const presignedPostResponse = await fetch('/api/presigned-post-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: uniqueFilename, contentType: file.type }),
        });
        const { url, fields } = await presignedPostResponse.json();

        // Step 2: Upload the file to S3
        const formData = new FormData();
        Object.keys(fields).forEach(key => formData.append(key, fields[key]));
        formData.append('file', file);

        const uploadResponse = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!uploadResponse.ok) {
            throw new Error(`File upload failed for ${file.name}`);
        }
        const objectKey = fields.key; // This should be the key of your uploaded object
        const fileUrl = `https://hamydev.s3.ap-south-1.amazonaws.com/${encodeURIComponent(objectKey)}`;

        return {
            originalName: file.name,
            url: fileUrl
        };
    });

    // Wait for all files to be uploaded
    const fileInfos = await Promise.all(uploadPromises);

    // Step 3: Save metadata to the database
    const metadataResponse = await fetch('/api/S3upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId,
            photos: fileInfos.map(info => ({
                originalName: info.originalName,
                url: info.url,
                isPrivate: false, // Or set this based on your needs
            })),
        }),
    });

    const result = await metadataResponse.json();

    if (metadataResponse.ok) {
        console.log('Photos metadata saved:', result);
    } else {
        throw new Error('Failed to save photos metadata');
    }
}