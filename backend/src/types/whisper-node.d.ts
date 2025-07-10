declare module 'whisper-node' {
     export class Whisper {
          constructor(options: {
               model: string;
               audio: string;
               language: string;
               threads?: number;
          });
          transcribe(): Promise<string>;
     }
}