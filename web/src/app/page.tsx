// pages/index.tsx
"use client";

import { useState } from 'react';
import axios from 'axios';

export default function Home() {
    const [urlInput, setUrlInput] = useState('');
    const [shortenedUrl, setShortenedUrl] = useState('');
    const [error, setError] = useState('');

    const handleShortenUrl = async () => {
        try {
            const response = await axios.post('http://localhost:3000/shorten', {
                url: urlInput,
            });

            // Directly use the response data
            setShortenedUrl(response.data); // Set shortenedUrl to the direct response
            setError('');
        } catch (err) {
            setError('Failed to shorten the URL.');
            setShortenedUrl('');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(shortenedUrl);
        alert('Shortened URL copied!');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <h1 className="text-2xl font-bold mb-4">URL Shortener</h1>
            <div className="flex items-center mb-4">
                <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Enter the URL to shorten"
                    className="p-2 border border-gray-300 rounded mr-2"
                />
                <button
                    onClick={handleShortenUrl}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Shorten
                </button>
            </div>
            {shortenedUrl && (
                <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-100">
                    <strong>Shortened URL:</strong> {shortenedUrl}
                    <button
                        onClick={handleCopy}
                        className="ml-2 bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                    >
                        Copy
                    </button>
                </div>
            )}
            {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
    );
}
