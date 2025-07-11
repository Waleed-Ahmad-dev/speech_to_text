import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch'; // or native fetch in Node 18+
import FormData from 'form-data';
import prisma from '../prisma/client';
import { spawnSync } from 'child_process';

export interface UploadedAudioFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number;
}

export const handleAudioUpload = async (
    file: UploadedAudioFile,
    userId: number,
    language: string = 'auto'  // Default to auto-detection
) => {
    if (!file) throw new Error('No audio file uploaded');

    const originalPath = file.path;
    const outputDir = path.dirname(originalPath);
    const baseName = path.basename(originalPath, path.extname(originalPath));
    const convertedPath = path.join(outputDir, `${baseName}-converted.wav`);

    try {
        // Convert audio to 16kHz mono wav
        const ffmpeg = spawnSync(
            'ffmpeg',
            ['-y', '-i', originalPath, '-ac', '1', '-ar', '16000', '-sample_fmt', 's16', convertedPath],
            { stdio: 'inherit' }
        );
        if (ffmpeg.status !== 0) throw new Error('FFmpeg conversion failed');

        // Prepare form data
        const form = new FormData();
        form.append('file', fs.createReadStream(convertedPath));
        form.append('language', language);  // Pass user-selected language

        // Call FastAPI endpoint
        const response = await fetch('http://127.0.0.1:8000/transcribe', {
            method: 'POST',
            body: form,
            headers: form.getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Transcription API error: ${response.statusText}`);
        }

        const data = await response.json() as { 
            transcript: string; 
            language: string;
            requested_language: string;
        };

        // Cleanup files
        [originalPath, convertedPath].forEach(p => {
            if (fs.existsSync(p)) fs.unlinkSync(p);
        });

        // Persist transcription
        const saved = await prisma.transcription.create({
            data: {
                text: data.transcript,
                language: data.requested_language === 'auto' 
                    ? data.language 
                    : data.requested_language,
                user: {
                    connect: { id: userId.toString() }
                }
            },
        });

        return {
            message: 'Transcription successful',
            transcription: data.transcript,
            id: saved.id,
            detectedLanguage: data.language,
            requestedLanguage: data.requested_language
        };

    } catch (err: any) {
        [originalPath, convertedPath].forEach(p => {
            if (fs.existsSync(p)) fs.unlinkSync(p);
        });
        console.error('Transcription failed:', err.message);
        throw new Error(`Transcription failed: ${err.message}`);
    }
};
