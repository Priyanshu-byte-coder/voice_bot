import React from 'react';
import { BotState } from '../types';
import ListeningAnimation from './ListeningAnimation';
import SpeakingAnimation from './SpeakingAnimation';

interface StatusDisplayProps {
  botState: BotState;
  message: string;
  interimTranscript: string;
  errorMessage: string;
  isConversationActive: boolean;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ botState, message, interimTranscript, errorMessage, isConversationActive }) => {
  const getStatusText = () => {
    if (errorMessage) return errorMessage;
    switch (botState) {
      case BotState.INITIALIZING:
        return "Initializing Saathi...";
      case BotState.NO_MIC_PERMISSION:
        return "Microphone access is needed to talk. Please enable it in your browser settings.";
      case BotState.IDLE:
        return isConversationActive ? "I'm ready when you are." : "Tap the microphone to start sharing.";
      case BotState.LISTENING:
        return "I'm listening...";
      case BotState.THINKING:
        return "Let me think about that...";
      case BotState.SPEAKING:
        return ""; // The animation is shown instead
      case BotState.ERROR:
        return "Something went wrong. Please try again.";
      default:
        return "";
    }
  };

  const isErrorState = botState === BotState.ERROR || botState === BotState.NO_MIC_PERMISSION || !!errorMessage;

  const renderContent = () => {
    if (botState === BotState.SPEAKING) {
      return (
        <div className="text-center">
          <div className="mb-6">
            <SpeakingAnimation />
          </div>
          <p className="text-xl text-gray-700 font-medium">Saathi is speaking...</p>
        </div>
      );
    }

    if (botState === BotState.LISTENING) {
      return (
        <div className="text-center">
          <p className="text-2xl font-medium text-gray-700 mb-6 animate-fade-in">I'm listening...</p>
          <ListeningAnimation />
          {interimTranscript && (
            <div className="mt-6 bg-white/50 backdrop-blur-sm rounded-xl p-4 max-w-md mx-auto">
              <p className="text-sm text-gray-600 italic">
                "{interimTranscript}"
              </p>
            </div>
          )}
        </div>
      );
    }
    
    // Default case for IDLE, THINKING, ERROR, etc.
    return (
      <div className="text-center">
        <div className={`transition-all duration-500 ${botState === BotState.THINKING ? 'animate-pulse' : ''}`}>
          <p className={`text-2xl font-medium transition-all duration-300 ${
            isErrorState ? 'text-red-600' : 
            botState === BotState.THINKING ? 'text-yellow-600' :
            'text-gray-700'
          }`}>
            {message || getStatusText()}
          </p>
          
          {botState === BotState.THINKING && (
            <div className="mt-4 flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="text-center p-6 min-h-[200px] flex flex-col justify-center items-center">
      {renderContent()}
    </div>
  );
};

export default StatusDisplay;