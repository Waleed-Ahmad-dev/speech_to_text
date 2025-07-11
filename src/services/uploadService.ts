import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import FormData from 'form-data'
import prisma from '@/lib/prisma'
import { spawnSync } from 'child_process'

export const handleAudioUpload = async (
     filePath: string,
     originalName: string,
     userId: string,
     language: string = 'auto'
) => {
     const outputDir = path.dirname(filePath)
     const baseName = path.basename(filePath, path.extname(filePath))
     const convertedPath = path.join(outputDir, `${baseName}-converted.wav`)

     try {
          const ffmpeg = spawnSync(
               'ffmpeg',
               ['-y', '-i', filePath, '-ac', '1', '-ar', '16000', '-sample_fmt', 's16', convertedPath],
               { stdio: 'inherit' }
          )

          if (ffmpeg.status !== 0) throw new Error('FFmpeg conversion failed')

          const form = new FormData()
          form.append('file', fs.createReadStream(convertedPath))
          form.append('language', language)

          const response = await fetch('http://127.0.0.1:8000/transcribe', {
               method: 'POST',
               body: form,
               headers: form.getHeaders(),
          })

          if (!response.ok) {
               throw new Error(`Transcription API error: ${response.statusText}`)
          }

          const data = await response.json() as { 
               transcript: string; 
               language: string;
               requested_language: string;
          }

          fs.unlinkSync(filePath)
          fs.unlinkSync(convertedPath)

          const saved = await prisma.transcription.create({
               data: {
                    text: data.transcript,
                    language: data.requested_language === 'auto' 
                         ? data.language 
                         : data.requested_language,
                    userId,
               },
          })

          return {
               message: 'Transcription successful',
               transcription: data.transcript,
               id: saved.id,
               detectedLanguage: data.language,
               requestedLanguage: data.requested_language
          }
     } catch (err: any) {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
          if (fs.existsSync(convertedPath)) fs.unlinkSync(convertedPath)
          console.error('Transcription failed:', err.message)
          throw new Error(`Transcription failed: ${err.message}`)
     }
}