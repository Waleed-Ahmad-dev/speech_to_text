'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Upload, Play, Trash2, Loader, StopCircle, Copy, Check } from 'react-feather';

// Comprehensive language list with ISO 639-1 codes
const LANGUAGES = [
  { code: 'auto', name: 'Auto Detect' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'it', name: 'Italian' },
  { code: 'ko', name: 'Korean' },
  { code: 'nl', name: 'Dutch' },
  { code: 'tr', name: 'Turkish' },
  { code: 'sv', name: 'Swedish' },
  { code: 'pl', name: 'Polish' },
  { code: 'th', name: 'Thai' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'id', name: 'Indonesian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'da', name: 'Danish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'el', name: 'Greek' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'cs', name: 'Czech' },
  { code: 'ro', name: 'Romanian' },
  { code: 'he', name: 'Hebrew' },
  { code: 'sk', name: 'Slovak' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'ca', name: 'Catalan' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'hr', name: 'Croatian' },
  { code: 'fa', name: 'Persian' },
  { code: 'sr', name: 'Serbian' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'ms', name: 'Malay' },
  { code: 'bn', name: 'Bengali' },
  { code: 'et', name: 'Estonian' },
  { code: 'lv', name: 'Latvian' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'ur', name: 'Urdu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'si', name: 'Sinhala' },
  { code: 'sw', name: 'Swahili' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'sq', name: 'Albanian' },
  { code: 'hy', name: 'Armenian' },
  { code: 'az', name: 'Azerbaijani' },
  { code: 'eu', name: 'Basque' },
  { code: 'be', name: 'Belarusian' },
  { code: 'bs', name: 'Bosnian' },
  { code: 'gl', name: 'Galician' },
  { code: 'ka', name: 'Georgian' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'ha', name: 'Hausa' },
  { code: 'is', name: 'Icelandic' },
  { code: 'ga', name: 'Irish' },
  { code: 'jv', name: 'Javanese' },
  { code: 'kn', name: 'Kannada' },
  { code: 'kk', name: 'Kazakh' },
  { code: 'km', name: 'Khmer' },
  { code: 'ku', name: 'Kurdish' },
  { code: 'ky', name: 'Kyrgyz' },
  { code: 'lo', name: 'Lao' },
  { code: 'la', name: 'Latin' },
  { code: 'lb', name: 'Luxembourgish' },
  { code: 'mk', name: 'Macedonian' },
  { code: 'mg', name: 'Malagasy' },
  { code: 'mt', name: 'Maltese' },
  { code: 'mi', name: 'Maori' },
  { code: 'mr', name: 'Marathi' },
  { code: 'mn', name: 'Mongolian' },
  { code: 'ne', name: 'Nepali' },
  { code: 'ps', name: 'Pashto' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'qu', name: 'Quechua' },
  { code: 'gd', name: 'Scots Gaelic' },
  { code: 'sn', name: 'Shona' },
  { code: 'sd', name: 'Sindhi' },
  { code: 'so', name: 'Somali' },
  { code: 'su', name: 'Sundanese' },
  { code: 'tg', name: 'Tajik' },
  { code: 'tt', name: 'Tatar' },
  { code: 'tk', name: 'Turkmen' },
  { code: 'uz', name: 'Uzbek' },
  { code: 'cy', name: 'Welsh' },
  { code: 'xh', name: 'Xhosa' },
  { code: 'yi', name: 'Yiddish' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'zu', name: 'Zulu' },
];

export default function AudioUploader() {
  // State management
  const [file, setFile] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('auto');
  const [recordingTime, setRecordingTime] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Close dropdown when clicking outside and focus search when opened
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      setSearchTerm('');
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 10);
    }
  }, [isDropdownOpen]);

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

  // Copy to clipboard
  const copyToClipboard = () => {
    if (transcription) {
      navigator.clipboard.writeText(transcription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Filter languages based on search term
  const filteredLanguages = LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 py-12 px-4 sm:px-6">
      {/* Floating particles background */}
      <div className="fixed inset-0 overflow-hidden z-0">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-indigo-500/10"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 20 + 5}px`,
              height: `${Math.random() * 20 + 5}px`,
              animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Asymmetrical header */}
        <div className="relative mb-16">
          <div className="absolute -top-8 -left-8 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-16 right-0 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl"></div>
          
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400 mb-4 tracking-tighter">
            <span className="inline-block transform -rotate-3 origin-left">Audio</span>
            <span className="inline-block transform rotate-2 origin-right ml-2">Transcriber</span>
          </h1>
          <p className="text-indigo-200/80 max-w-2xl text-lg">
            Transform audio to text with AI precision. Perfect for meetings, interviews, and voice notes.
          </p>
        </div>
        
        {/* Main glass panel */}
        <div className="bg-gray-800/30 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-2xl shadow-indigo-900/20 overflow-hidden">
          {/* Diagonal separator */}
          <div className="relative">
            <div className="absolute top-0 left-1/3 w-2 h-full bg-gradient-to-b from-transparent via-indigo-500/30 to-transparent"></div>
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-0">
              
              {/* Input Section - with tilted effect */}
              <div className="p-8 lg:border-r border-gray-700/50 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <button
                      onClick={recording ? stopRecording : startRecording}
                      className={`flex-1 flex items-center justify-center px-5 py-4 rounded-xl font-medium transition-all transform hover:scale-[1.02] ${
                        recording 
                          ? 'animate-pulse bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/20' 
                          : 'bg-gray-700/50 hover:bg-gray-700/70 text-gray-200 border border-gray-600/50'
                      }`}
                      disabled={isLoading}
                    >
                      {recording ? (
                        <>
                          <StopCircle size={20} className="mr-3" /> Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic size={20} className="mr-3" /> Record Audio
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
                        className={`flex-1 flex items-center justify-center px-5 py-4 rounded-xl font-medium cursor-pointer transition-all transform hover:scale-[1.02] ${
                          recording || isLoading
                            ? 'bg-gray-700/20 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-700/50 hover:bg-gray-700/70 text-gray-200 border border-gray-600/50'
                        }`}
                      >
                        <Upload size={20} className="mr-3" /> Upload File
                      </label>
                    </div>
                  </div>
                  
                  {/* Recording Timer */}
                  {recording && (
                    <div className="flex justify-center mb-6">
                      <div className="bg-red-500/10 border border-red-500/30 px-6 py-3 rounded-full">
                        <div className="text-red-400 font-mono font-bold text-xl tracking-wider">
                          {formatTime(recordingTime)}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* File Info */}
                  {file && !recording && (
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 mb-6 transition-all hover:border-indigo-500/50">
                      <div className="flex justify-between items-center">
                        <div className="truncate mr-4">
                          <p className="font-medium text-gray-200 truncate">{file.name}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {file.type} • {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <button 
                          onClick={resetAll}
                          className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Audio Player */}
                  {audioUrl && !recording && (
                    <div className="mb-6">
                      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
                        <audio 
                          src={audioUrl} 
                          controls 
                          className="w-full rounded-lg [&::-webkit-media-controls-panel]:bg-gray-700/50 [&::-webkit-media-controls-panel]:backdrop-blur-lg"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Language Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-400 mb-3">
                      Transcription Language
                    </label>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex justify-between items-center px-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-200 hover:border-indigo-500/50 transition-colors"
                      >
                        <span>
                          {LANGUAGES.find(lang => lang.code === language)?.name || 'Select Language'}
                        </span>
                        <svg 
                          className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {isDropdownOpen && (
                        <div className="absolute z-20 mt-2 w-full bg-gray-800 border border-gray-700/50 rounded-xl shadow-lg shadow-black/30 backdrop-blur-xl">
                          {/* Search input */}
                          <div className="sticky top-0 p-2 bg-gray-800 border-b border-gray-700/50">
                            <input
                              type="text"
                              ref={searchInputRef}
                              placeholder="Search languages..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full px-3 py-2 bg-gray-700/50 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-gray-600/50"
                            />
                          </div>
                          
                          {/* Language list with scroll */}
                          <div className="max-h-64 overflow-y-auto">
                            {filteredLanguages.length === 0 ? (
                              <div className="py-3 px-4 text-gray-400 text-center">
                                No languages found
                              </div>
                            ) : (
                              filteredLanguages.map(lang => (
                                <button
                                  key={lang.code}
                                  onClick={() => {
                                    setLanguage(lang.code);
                                    setIsDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-3 hover:bg-indigo-500/10 transition-colors ${
                                    language === lang.code 
                                      ? 'text-indigo-400 font-medium' 
                                      : 'text-gray-300'
                                  }`}
                                >
                                  {lang.name}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={!file || isLoading || recording}
                    className={`w-full py-4 px-6 rounded-xl font-bold transition-all transform hover:scale-[1.02] flex items-center justify-center ${
                      !file || isLoading || recording
                        ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader size={20} className="animate-spin mr-3" /> Processing...
                      </>
                    ) : (
                      <>
                        <Play size={18} className="mr-3" /> Transcribe Audio
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Results Section - with layered glass effect */}
              <div className="p-8 bg-gray-800/20 backdrop-blur-xl">
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                      Transcription
                    </h2>
                    {transcription && !isLoading && (
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-200 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check size={16} className="mr-2 text-green-400" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={16} className="mr-2" /> Copy
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl mb-6 animate-fadeIn">
                        <p className="text-red-400">{error}</p>
                      </div>
                    )}
                    
                    {isLoading ? (
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="relative mb-6">
                          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader size={24} className="animate-pulse text-indigo-500" />
                          </div>
                        </div>
                        <p className="text-gray-400 text-center max-w-xs">
                          Transcribing your audio. This may take a moment...
                        </p>
                      </div>
                    ) : transcription ? (
                      <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-xl p-5 h-full overflow-y-auto">
                        <p className="text-gray-200 whitespace-pre-line leading-relaxed">
                          {transcription}
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-700/50 rounded-xl p-8 bg-gradient-to-br from-gray-800/20 to-gray-900/20">
                        <div className="text-gray-500 mb-4 text-center">
                          Your transcription will appear here
                        </div>
                        <div className="flex space-x-2">
                          <div className="w-2 h-4 bg-indigo-400 rounded-full animate-wave" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-4 bg-indigo-400 rounded-full animate-wave" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-4 bg-indigo-400 rounded-full animate-wave" style={{ animationDelay: '0.3s' }}></div>
                          <div className="w-2 h-4 bg-indigo-400 rounded-full animate-wave" style={{ animationDelay: '0.4s' }}></div>
                          <div className="w-2 h-4 bg-indigo-400 rounded-full animate-wave" style={{ animationDelay: '0.5s' }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Grid - Asymmetrical layout */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-gray-800/30 to-indigo-900/20 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 transform transition-all hover:-translate-y-1">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30">
                <Mic size={24} className="text-indigo-400" />
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-200">Real-Time Recording</h3>
            <p className="text-gray-400">Capture audio directly in your browser with microphone access</p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800/30 to-purple-900/20 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 transform transition-all hover:-translate-y-1 md:mt-6">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/30">
                <Upload size={24} className="text-purple-400" />
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-200">Multi-Format Support</h3>
            <p className="text-gray-400">Upload MP3, WAV, FLAC, and other common audio formats</p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800/30 to-indigo-900/20 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 transform transition-all hover:-translate-y-1">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30">
                <Play size={24} className="text-indigo-400" />
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-200">Instant Playback</h3>
            <p className="text-gray-400">Review your audio before processing for perfect accuracy</p>
          </div>
        </div>
      </div>

      {/* Global Animations */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0) rotate(0deg); }
          50% { transform: translateY(-20px) translateX(10px) rotate(5deg); }
          100% { transform: translateY(0) translateX(0) rotate(0deg); }
        }
        
        @keyframes wave {
          0% { height: 4px; }
          50% { height: 20px; }
          100% { height: 4px; }
        }
        
        .animate-wave {
          animation: wave 1.2s infinite ease-in-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}