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

export const handleAudioUpload = (file: UploadedAudioFile) => {
     if (!file) {
          throw new Error('No audio file uploaded');
     }

     const { filename, path: filePath } = file;

     // Optional logging (can be removed in production)
     console.log('Audio file received:', filename);
     console.log('Stored at:', filePath);

     return {
          message: 'Audio uploaded successfully',
          filename,
          path: filePath,
     };
};
