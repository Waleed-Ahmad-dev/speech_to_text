import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { handleAudioUpload } from '@/services/uploadService'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const config = {
     api: {
          bodyParser: false,
     },
}

export async function POST(request: NextRequest) {
     try {
          // Get user session using NextAuth
          const session = await getServerSession(authOptions)

          if (!session || !session.user || !session.user.id) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
          }

          const formData = await request.formData()
          const file = formData.get('audio') as File
          const language = formData.get('language') as string || 'auto'

          if (!file) {
               return NextResponse.json({ error: 'No audio file uploaded' }, { status: 400 })
          }

          const uploadDir = path.join(process.cwd(), 'uploads')
          if (!fs.existsSync(uploadDir)) {
               fs.mkdirSync(uploadDir, { recursive: true })
          }

          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
          const filename = `${uniqueSuffix}-${file.name}`
          const filePath = path.join(uploadDir, filename)

          const buffer = Buffer.from(await file.arrayBuffer())
          fs.writeFileSync(filePath, buffer)

          const result = await handleAudioUpload(
               filePath,
               file.name,
               session.user.id, // Pass authenticated user ID
               language
          )

          return NextResponse.json(result)
     } catch (error: any) {
          return NextResponse.json(
               { error: error.message || 'Internal server error' },
               { status: 500 }
          )
     }
}