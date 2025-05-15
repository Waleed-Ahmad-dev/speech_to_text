import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
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

/** very small map → extend if you need more languages */
const LANG_NAME_TO_CODE: Record<string, string> = {
     Hindi: 'hi',
     Urdu: 'ur',
     English: 'en',
     Spanish: 'es',
     French: 'fr',
     Chinese: 'zh'
};
const toLangCode = (name: string): string =>
     LANG_NAME_TO_CODE[name] || name.slice(0, 2).toLowerCase();

export const handleAudioUpload = async (
     file: UploadedAudioFile,
     language: string = 'auto'
) => {
     if (!file) throw new Error('No audio file uploaded');
     const originalPath = file.path;
     const outputDir = path.dirname(originalPath);
     const baseName = path.basename(originalPath, path.extname(originalPath));
     const convertedPath = path.join(outputDir, `${baseName}-converted.wav`);
     const model = 'small';
     const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
     try {
          /* ---------- 1.  FFmpeg → 16 kHz mono WAV ---------- */
          const ffmpeg = spawnSync(
               'ffmpeg',
               ['-y', '-i', originalPath, '-ac', '1', '-ar', '16000', '-sample_fmt', 's16', convertedPath],
               { stdio: 'inherit' }
          );
          if (ffmpeg.status !== 0) throw new Error('FFmpeg conversion failed');
          /* ---------- 2.  First Whisper run only to detect language ---------- */
          const detect = spawnSync(
               pythonCmd,
               [
                    '-m',
                    'whisper',
                    convertedPath,
                    '--model',
                    model,
                    '--fp16',
                    'False',
                    '--output_format',
                    'txt',            // we don’t need JSON here
                    '--output_dir',
                    outputDir
               ],
               { encoding: 'utf-8' } // capture stdout/stderr
          );
          if (detect.status !== 0) {
               console.error(detect.stderr || 'No stderr from Whisper');
               throw new Error('Whisper language-detection run failed');
          }
          /* Parse the “Detected language: …” line */
          const stdout = detect.stdout?.toString() || '';
          const match = stdout.match(/Detected language:\s*([A-Za-z]+)/i);
          if (!match) throw new Error('Could not read detected language from Whisper output');
          let detectedLang = toLangCode(match[1]);
          console.log(`Whisper says: ${match[1]} → code = ${detectedLang}`);
          /* Manual overrides */
          if (language !== 'auto') {
               detectedLang = language;            // caller forced a language
          } else if (detectedLang === 'hi') {    // auto-mode & Hindi mis-detection
               console.log('Override: Hindi → Urdu');
               detectedLang = 'ur';
          }
          /* ---------- 3.  Second Whisper run with correct language ---------- */
          const final = spawnSync(
               pythonCmd,
               [
                    '-m',
                    'whisper',
                    convertedPath,
                    '--model',
                    model,
                    '--language',
                    detectedLang,
                    '--fp16',
                    'False',
                    '--output_format',
                    'txt',           // we only need the transcript file
                    '--output_dir',
                    outputDir
               ],
               { stdio: 'inherit' }
          );
          if (final.status !== 0) throw new Error('Whisper transcription run failed');
          /* ---------- 4.  Read transcript ---------- */
          const transcriptPath = path.join(outputDir, `${baseName}-converted.txt`);
          if (!fs.existsSync(transcriptPath)) {
               console.error('Files in outputDir:', fs.readdirSync(outputDir));
               throw new Error(`Transcript not found: ${transcriptPath}`);
          }
          const transcript = fs.readFileSync(transcriptPath, 'utf-8').trim();
          /* ---------- 5.  Clean-up ---------- */
          [originalPath, convertedPath, transcriptPath].forEach(p => {
               if (fs.existsSync(p)) fs.unlinkSync(p);
          });
          /* ---------- 6.  Persist ---------- */
          const saved = await prisma.transcription.create({
               data: { text: transcript, language: detectedLang }
          });
          return { message: 'Transcription successful', transcription: transcript, id: saved.id };
     } catch (err: any) {
          /* best-effort clean-up */
          [originalPath, convertedPath].forEach(p => {
               if (fs.existsSync(p)) fs.unlinkSync(p);
          });
          console.error('Transcription pipeline failed:', err.message);
          throw new Error(`Transcription failed: ${err.message}`);
     }
};
