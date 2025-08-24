import React from 'react';
import { BotState } from '../types';
import { MicrophoneIcon, LoadingSpinnerIcon, SoundWaveIcon, StopIcon } from './Icons';

interface MicrophoneButtonProps {
  botState: BotState;
  isConversationActive: boolean;
  onClick: () => void;
  disabled: boolean;
}

const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({ botState, isConversationActive, onClick, disabled }) => {
  const getButtonContent = () => {
    switch (botState) {
      case BotState.LISTENING:
        return <SoundWaveIcon className="w-8 h-8 text-white" />;
      case BotState.THINKING:
        return <LoadingSpinnerIcon className="w-8 h-8 text-white" />;
      case BotState.SPEAKING:
         return <SoundWaveIcon className="w-8 h-8 text-white" />;
      default:
        if (isConversationActive) {
          return <StopIcon className="w-7 h-7 text-white" />;
        }
        return <MicrophoneIcon className="w-8 h-8 text-white" />;
    }
  };

  const getAnimationClass = () => {
    switch (botState) {
      case BotState.LISTENING:
      case BotState.SPEAKING:
        return 'animate-pulse';
      default:
        return '';
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return 'bg-gray-300/70 cursor-not-allowed backdrop-blur-sm';
    if (isConversationActive && botState === BotState.IDLE) return 'bg-gradient-to-r from-red-300 to-pink-300 hover:from-red-400 hover:to-pink-400 shadow-lg shadow-red-300/30';
    return 'bg-gradient-to-r from-purple-300 to-indigo-300 hover:from-purple-400 hover:to-indigo-400 shadow-lg shadow-purple-300/30';
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 ease-out backdrop-blur-lg border border-white/20 focus:outline-none focus:ring-4 focus:ring-purple-400/50 transform hover:scale-105 active:scale-95
        ${getBackgroundColor()}
        ${getAnimationClass()}
      `}
      aria-label={isConversationActive ? "Stop conversation" : "Start conversation"}
    >
      {/* Inner glow effect */}
      <div className="absolute inset-1 rounded-full bg-white/10 opacity-50"></div>
      
      {/* Ripple effects for active states */}
      {(botState === BotState.LISTENING || botState === BotState.SPEAKING) && (
          <>
            <span className="absolute h-full w-full rounded-full bg-gradient-to-r from-purple-300 to-pink-300 animate-ping opacity-50"></span>
            <span className="absolute h-32 w-32 rounded-full bg-gradient-to-r from-purple-200 to-pink-200 animate-ping opacity-30 delay-75"></span>
            <span className="absolute h-36 w-36 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 animate-ping opacity-15 delay-150"></span>
          </>
        )
      }
      
      {/* Button content */}
      <div className="relative z-20 transform transition-transform duration-200">
        {getButtonContent()}
      </div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-60"></div>
    </button>
  );
};

export default MicrophoneButton;