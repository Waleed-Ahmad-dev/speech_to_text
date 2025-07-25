'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Upload, Play, Trash2, Loader, StopCircle } from 'react-feather';

export default function AudioUploader() {
  // State management
  const [file, setFile] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('auto');
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        (mediaRecorderRef.current as MediaRecorder).stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Handle file selection
  interface HandleFileChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

  const handleFileChange = (e: HandleFileChangeEvent) => {
    const selectedFile: File | undefined = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAudioUrl(URL.createObjectURL(selectedFile));
      setTranscription(null);
      setError(null);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        setFile(new File([audioBlob], 'recording.webm', { type: 'audio/webm' }));
      };
      
      mediaRecorderRef.current.start();
      setRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      setError('Microphone access denied. Please allow access to record audio.');
      console.error('Recording error:', err);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
      if (timerRef.current) { clearInterval(timerRef.current); }
    }
  };

  // Submit audio for transcription
  const handleSubmit = async () => {
    if (!file) {
      setError('Please record or upload an audio file first');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setTranscription(null);
    
    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('language', language);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transcribe audio');
      }
      
      const result = await response.json();
      setTranscription(result.transcription);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'An error occurred during transcription');
      } else {
        setError('An error occurred during transcription');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset everything
  const resetAll = () => {
    setFile(null);
    setRecording(false);
    setAudioUrl(null);
    setTranscription(null);
    setError(null);
    setRecordingTime(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    audioChunksRef.current = [];
  };

  // Format recording time
  interface FormatTimeFn {
    (seconds: number): string;
  }

  const formatTime: FormatTimeFn = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-indigo-800 mb-4">Audio Transcription Service</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload or record audio to get instant transcriptions. Perfect for interviews, meetings, and voice notes.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Audio Input Section */}
            <div className="border-2 border-dashed border-indigo-200 rounded-xl p-6 flex flex-col items-center">
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={recording ? stopRecording : startRecording}
                  className={`flex items-center justify-center px-5 py-3 rounded-full font-medium transition-all ${
                    recording 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                  }`}
                  disabled={isLoading}
                >
                  {recording ? (
                    <>
                      <StopCircle size={18} className="mr-2" /> Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic size={18} className="mr-2" /> Record Audio
                    </>
                  )}
                </button>
                
                <div className="relative">
                  <input
                    type="file"
                    id="audio-upload"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={recording || isLoading}
                  />
                  <label
                    htmlFor="audio-upload"
                    className={`flex items-center justify-center px-5 py-3 rounded-full font-medium cursor-pointer transition-all ${
                      recording || isLoading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                    }`}
                  >
                    <Upload size={18} className="mr-2" /> Upload File
                  </label>
                </div>
              </div>
              
              {/* Recording Timer */}
              {recording && (
                <div className="text-red-500 font-bold text-xl mb-4">
                  {formatTime(recordingTime)}
                </div>
              )}
              
              {/* File Info */}
              {file && !recording && (
                <div className="w-full bg-indigo-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800 truncate">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {file.type} • {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button 
                      onClick={resetAll}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Audio Player */}
              {audioUrl && !recording && (
                <div className="w-full mt-4">
                  <audio 
                    src={audioUrl} 
                    controls 
                    className="w-full rounded-lg"
                  />
                </div>
              )}
              
              {/* Language Selection */}
              <div className="mt-6 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transcription Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isLoading}
                >
                  <option value="auto">Auto Detect</option>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
              
              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!file || isLoading || recording}
                className={`mt-6 w-full py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center ${
                  !file || isLoading || recording
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader size={20} className="animate-spin mr-2" /> Processing...
                  </>
                ) : (
                  'Transcribe Audio'
                )}
              </button>
            </div>
            
            {/* Results Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Transcription Results</h2>
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <Loader size={40} className="animate-spin text-indigo-600 mb-4" />
                  <p className="text-gray-600">Transcribing your audio...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                </div>
              ) : transcription ? (
                <div className="bg-white border border-gray-200 rounded-lg p-4 h-64 overflow-y-auto">
                  <p className="text-gray-700 whitespace-pre-line">{transcription}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-gray-400 mb-4">Your transcription will appear here</div>
                  <div className="flex space-x-2">
                    <div className="w-2 h-4 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-4 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-4 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                </div>
              )}
              
              {transcription && !isLoading && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => navigator.clipboard.writeText(transcription)}
                    className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg font-medium"
                  >
                    Copy to Clipboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100Sri">
            <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Mic size={24} className="text-indigo-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Record in Real-Time</h3>
            <p className="text-gray-600">Use your microphone to record audio directly in the browser.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Upload size={24} className="text-indigo-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Upload Files</h3>
            <p className="text-gray-600">Supports MP3, WAV, and other common audio formats.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Play size={24} className="text-indigo-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Playback & Review</h3>
            <p className="text-gray-600">Listen to your audio before transcribing for accuracy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}