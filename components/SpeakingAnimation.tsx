import React from 'react';

// Add wave animation styles for speaking
const speakingWaveKeyframes = `
  @keyframes wave {
    0%, 100% { transform: scale(0.8); opacity: 0.6; }
    50% { transform: scale(1.2); opacity: 1; }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const existingStyle = document.querySelector('style[data-speaking-animation]');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.setAttribute('data-speaking-animation', 'true');
    style.textContent = speakingWaveKeyframes;
    document.head.appendChild(style);
  }
}

const SpeakingAnimation: React.FC = () => {
  return (
    <div className="relative flex justify-center items-center w-40 h-40" aria-label="Saathi is speaking">
      {/* Central core */}
      <div className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-purple-300 to-pink-300 animate-pulse z-10"></div>
      
      {/* Ripple waves */}
      <div className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-purple-300/60 to-pink-300/60 animate-[ripple_2s_ease-out_infinite]"></div>
      <div className="absolute w-28 h-28 rounded-full bg-gradient-to-r from-purple-300/40 to-pink-300/40 animate-[ripple_2s_ease-out_0.5s_infinite]"></div>
      <div className="absolute w-36 h-36 rounded-full bg-gradient-to-r from-purple-300/20 to-pink-300/20 animate-[ripple_2s_ease-out_1s_infinite]"></div>
      
      {/* Sound wave bars around the circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute flex items-center justify-center w-full h-full">
          {/* Top */}
          <div className="absolute top-2 w-1 h-4 bg-gradient-to-t from-purple-300 to-pink-300 rounded-full animate-[wave_0.8s_ease-in-out_infinite] [animation-delay:0s]"></div>
          {/* Top Right */}
          <div className="absolute top-4 right-4 w-1 h-3 bg-gradient-to-t from-purple-300 to-pink-300 rounded-full animate-[wave_0.8s_ease-in-out_infinite] [animation-delay:0.1s] transform rotate-45"></div>
          {/* Right */}
          <div className="absolute right-2 w-4 h-1 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full animate-[wave_0.8s_ease-in-out_infinite] [animation-delay:0.2s]"></div>
          {/* Bottom Right */}
          <div className="absolute bottom-4 right-4 w-1 h-3 bg-gradient-to-t from-purple-300 to-pink-300 rounded-full animate-[wave_0.8s_ease-in-out_infinite] [animation-delay:0.3s] transform -rotate-45"></div>
          {/* Bottom */}
          <div className="absolute bottom-2 w-1 h-4 bg-gradient-to-t from-purple-300 to-pink-300 rounded-full animate-[wave_0.8s_ease-in-out_infinite] [animation-delay:0.4s]"></div>
          {/* Bottom Left */}
          <div className="absolute bottom-4 left-4 w-1 h-3 bg-gradient-to-t from-purple-300 to-pink-300 rounded-full animate-[wave_0.8s_ease-in-out_infinite] [animation-delay:0.5s] transform rotate-45"></div>
          {/* Left */}
          <div className="absolute left-2 w-4 h-1 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full animate-[wave_0.8s_ease-in-out_infinite] [animation-delay:0.6s]"></div>
          {/* Top Left */}
          <div className="absolute top-4 left-4 w-1 h-3 bg-gradient-to-t from-purple-300 to-pink-300 rounded-full animate-[wave_0.8s_ease-in-out_infinite] [animation-delay:0.7s] transform -rotate-45"></div>
        </div>
      </div>
    </div>
  );
};

export default SpeakingAnimation;