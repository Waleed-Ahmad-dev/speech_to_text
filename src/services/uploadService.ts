import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import prisma from '../prisma/client';

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

export const handleAudioUpload = async (file: UploadedAudioFile, language: string = 'auto') => {
     if (!file) throw new Error('No audio file uploaded');

     const originalPath = file.path;
     const outputDir = path.dirname(originalPath);
     const baseName = path.basename(originalPath, path.extname(originalPath));
     const convertedPath = path.join(outputDir, `${baseName}-converted.wav`);
     const model = 'ggml-small'; // Using multilingual model

     try {
          // Step 1: Convert any audio file to 16kHz mono WAV
          const ffmpegCmd = `ffmpeg -y -i "${originalPath}" -ac 1 -ar 16000 -sample_fmt s16 "${convertedPath}"`;
          console.log(`Converting audio with FFmpeg: ${ffmpegCmd}`);
          execSync(ffmpegCmd, { stdio: 'inherit' });

          // Step 2: Transcribe using Whisper CLI with dynamic language
          const whisperCmd = `python -m whisper "${convertedPath}" --model ${model} --language ${language} --fp16 False --output_format txt --output_dir "${outputDir}"`;
          console.log(`Running Whisper: ${whisperCmd}`);
          execSync(whisperCmd, { encoding: 'utf-8' });

          // Step 3: Read output .txt
          const transcriptPath = path.join(outputDir, `${path.basename(convertedPath, '.wav')}.txt`);
          if (!fs.existsSync(transcriptPath)) {
               throw new Error(`Transcript not found at ${transcriptPath}`);
          }

          const transcript = fs.readFileSync(transcriptPath, 'utf-8').trim();

          // Step 4: Cleanup
          fs.unlinkSync(originalPath);      // original uploaded file
          fs.unlinkSync(convertedPath);     // converted .wav
          fs.unlinkSync(transcriptPath);    // whisper output

          // Step 5: Save transcript to DB with language
          const saved = await prisma.transcription.create({
               data: {
                    text: transcript,
                    language: language === 'ur' ? 'ur' : 'en-US',  // Save 'ur' for Urdu, 'en-US' for English
               },
          });

          return {
               message: 'Transcription successful',
               transcription: transcript,
               id: saved.id,
          };
     } catch (error: any) {
          // Clean up partials on failure
          if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
          if (fs.existsSync(convertedPath)) fs.unlinkSync(convertedPath);
          throw new Error(`Transcription failed: ${error.message}`);
     }
};
