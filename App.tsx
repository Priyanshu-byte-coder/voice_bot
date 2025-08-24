import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from '@google/genai';
import { BotState } from './types';
import { getChatSession } from './services/geminiService';
import { useVoiceBot } from './hooks/useVoiceBot';
import MicrophoneButton from './components/MicrophoneButton';
import StatusDisplay from './components/StatusDisplay';

export default function App() {
  const [chat, setChat] = useState<Chat | null>(null);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isConversationActive, setIsConversationActive] = useState(false);
  const hasWelcomed = useRef(false);
  const wasListeningRef = useRef(false);
  const botStateRef = useRef<BotState>(BotState.INITIALIZING);
  const silenceCountRef = useRef(0);

  const {
    botState,
    setBotState,
    startListening,
    stopListening,
    speak,
    transcript,
    interimTranscript,
    permissionGranted,
    recognitionError,
  } = useVoiceBot();

  botStateRef.current = botState;

  useEffect(() => {
    if (!process.env.API_KEY) {
      setErrorMessage('Gemini API key is not set. Please configure it in your environment.');
      setBotState(BotState.ERROR);
    } else {
      setChat(getChatSession());
    }
  }, [setBotState]);

  // This effect handles re-activating the listener if the user doesn't speak.
  useEffect(() => {
    if (!isConversationActive) return;

    const justStoppedListening = botState === BotState.IDLE && wasListeningRef.current;

    if (justStoppedListening) {
      wasListeningRef.current = false; // Reset the flag

      const timer = setTimeout(() => {
        // Ensure we are still in the right state after the delay
        if (!isConversationActive || botStateRef.current !== BotState.IDLE) return;

        if (recognitionError === 'no-speech') {
          silenceCountRef.current++;
          
          if (silenceCountRef.current >= 3) {
            const message = "It seems you're quiet now. I'll wait. Tap the button when you're ready to talk again.";
            setCurrentMessage(message);
            speak(message, () => {
              setCurrentMessage('');
              setIsConversationActive(false); // End the conversation
              setBotState(BotState.IDLE);
            });
          } else if (silenceCountRef.current === 2) {
            const message = "Take your time. I'm here when you're ready.";
            setCurrentMessage(message);
            speak(message, () => {
              setCurrentMessage('');
              if (botStateRef.current !== BotState.IDLE) return;
              startListening();
            });
          } else {
            // First time 'no-speech', just listen again
            startListening();
          }
        } else {
          // Some other reason for stopping (e.g. end of speech), just restart listening
          startListening();
        }
      }, 250);

      return () => clearTimeout(timer);
    } else if (botState === BotState.LISTENING) {
      wasListeningRef.current = true; // Set the flag when listening starts
    }
  }, [botState, isConversationActive, startListening, recognitionError, speak, setBotState]);


  useEffect(() => {
    if (!transcript) return;
    
    silenceCountRef.current = 0; // Reset silence counter on successful speech

    const processTranscript = async () => {
      setBotState(BotState.THINKING);
      setCurrentMessage(`You said: "${transcript}"`);
      if (!chat) {
        setErrorMessage("Chat session not initialized.");
        setBotState(BotState.ERROR);
        return;
      }
      try {
        const response = await chat.sendMessage({ message: transcript });
        const text = response.text;
        setCurrentMessage(text);
        speak(text, () => {
          setCurrentMessage('');
          if (isConversationActive) {
            startListening();
          } else {
            setBotState(BotState.IDLE);
          }
        });
      } catch (error) {
        console.error("Error with Gemini API:", error);
        const friendlyError = "I'm having a little trouble connecting right now. Let's try again in a moment.";
        setErrorMessage(friendlyError);
        setCurrentMessage(friendlyError);
        speak(friendlyError, () => {
           setErrorMessage('');
           setCurrentMessage('');
           if (isConversationActive) {
              startListening();
           } else {
              setBotState(BotState.IDLE);
           }
        });
      }
    };
    processTranscript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, chat, speak, setBotState]);

  const handleMicClick = () => {
    if (isConversationActive) {
      // Stop the conversation
      setIsConversationActive(false);
      stopListening();
      window.speechSynthesis.cancel();
      setBotState(BotState.IDLE);
    } else {
      // Start the conversation
      silenceCountRef.current = 0;
      setIsConversationActive(true);
      if (permissionGranted && !hasWelcomed.current) {
        hasWelcomed.current = true;
        const welcomeMessage = "Hello, I'm Saathi. I'm here to listen whenever you're ready to talk.";
        setCurrentMessage(welcomeMessage);
        setBotState(BotState.SPEAKING); // Manually set state as speak() is async
        speak(welcomeMessage, () => {
          setCurrentMessage('');
          // Check if user hasn't cancelled during welcome message
          if (botStateRef.current !== BotState.IDLE) {
              startListening();
          }
        });
      } else {
        startListening();
      }
    }
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-between p-6 font-sans text-gray-800 overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-200/20 rounded-full blur-2xl"></div>
      </div>

      {/* Header */}
      <header className="text-center z-10 mt-8">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              {/* Heart with brain/mind symbol representing mental wellness */}
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              {/* Inner brain pattern */}
              <circle cx="12" cy="10" r="2.5" fill="rgba(255,255,255,0.3)"/>
              <path d="M10 9c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm3 2c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1z" fill="rgba(255,255,255,0.5)"/>
            </svg>
          </div>
        </div>
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
          Saathi
        </h1>
        <p className="text-xl text-gray-600 font-light">Your AI Companion for a peaceful mind</p>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-300 to-pink-300 mx-auto mt-4 rounded-full"></div>
      </header>
      
      {/* Main content area */}
      <div className="flex-grow flex items-center justify-center w-full max-w-4xl z-10">
        <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/40 w-full max-w-2xl">
          <StatusDisplay
            botState={botState}
            message={currentMessage}
            interimTranscript={interimTranscript}
            errorMessage={errorMessage}
            isConversationActive={isConversationActive}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full flex flex-col items-center justify-center gap-6 z-10 mb-8">
        <div className="relative">
          {/* Glow effect around button */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full blur-xl opacity-40 scale-110"></div>
          <MicrophoneButton
            botState={botState}
            isConversationActive={isConversationActive}
            onClick={handleMicClick}
            disabled={botState === BotState.THINKING || botState === BotState.INITIALIZING || botState === BotState.NO_MIC_PERMISSION || (isConversationActive && botState === BotState.SPEAKING)}
          />
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className={`w-2 h-2 rounded-full ${
            botState === BotState.LISTENING ? 'bg-green-500 animate-pulse' :
            botState === BotState.SPEAKING ? 'bg-blue-500 animate-pulse' :
            botState === BotState.THINKING ? 'bg-yellow-500 animate-pulse' :
            botState === BotState.ERROR ? 'bg-red-500' :
            'bg-gray-500'
          }`}></div>
          <span className="capitalize">
            {botState === BotState.IDLE && isConversationActive ? 'Ready' :
             botState === BotState.IDLE ? 'Waiting' :
             botState.toLowerCase()}
          </span>
        </div>
        
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 max-w-md">
          <p className="text-xs text-gray-600 text-center leading-relaxed">
            Saathi is an AI listener and not a medical professional. If you are in crisis, please seek professional help. Your conversations are processed by Google Gemini and are not stored by this application.
          </p>
        </div>
      </footer>
    </main>
  );
}