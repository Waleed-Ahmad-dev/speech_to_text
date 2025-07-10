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
    language: string = 'auto'
) => {
    if (!file) throw new Error('No audio file uploaded');

    const originalPath = file.path;
    const outputDir = path.dirname(originalPath);
    const baseName = path.basename(originalPath, path.extname(originalPath));
    const convertedPath = path.join(outputDir, `${baseName}-converted.wav`);

    try {
        // 1. Convert audio to 16kHz mono wav
        const ffmpeg = spawnSync(
            'ffmpeg',
            ['-y', '-i', originalPath, '-ac', '1', '-ar', '16000', '-sample_fmt', 's16', convertedPath],
            { stdio: 'inherit' }
        );
        if (ffmpeg.status !== 0) throw new Error('FFmpeg conversion failed');

        // 2. Prepare form data with converted audio file
        const form = new FormData();
        form.append('file', fs.createReadStream(convertedPath));
        form.append('language', language);

        // 3. Call FastAPI transcribe endpoint
        const response = await fetch('http://127.0.0.1:8000/transcribe', {
            method: 'POST',
            body: form,
            headers: form.getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Transcription API error: ${response.statusText}`);
        }

        const data = await response.json() as { transcript: string; language: string };

        // 4. Cleanup files
        [originalPath, convertedPath].forEach(p => {
            if (fs.existsSync(p)) fs.unlinkSync(p);
        });

        // 5. Persist transcription in DB
        const saved = await prisma.transcription.create({
            data: {
                text: data.transcript,
                language: data.language,
            },
        });

        return {
            message: 'Transcription successful',
            transcription: data.transcript,
            id: saved.id,
        };

    } catch (err: any) {
        [originalPath, convertedPath].forEach(p => {
            if (fs.existsSync(p)) fs.unlinkSync(p);
        });
        console.error('Transcription failed:', err.message);
        throw new Error(`Transcription failed: ${err.message}`);
    }
};
