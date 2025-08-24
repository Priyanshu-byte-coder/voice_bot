import React from 'react';

// Add wave animation styles
const waveKeyframes = `
  @keyframes wave {
    0%, 100% { transform: scaleY(0.5); }
    50% { transform: scaleY(1.2); }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = waveKeyframes;
  document.head.appendChild(style);
}

const ListeningAnimation: React.FC = () => {
  return (
    <div className="flex items-end justify-center space-x-1">
      <div className="w-1 bg-gradient-to-t from-purple-300 to-pink-300 rounded-full animate-[wave_1s_ease-in-out_infinite] [animation-delay:0s]" style={{height: '20px'}}></div>
      <div className="w-1 bg-gradient-to-t from-purple-300 to-pink-300 rounded-full animate-[wave_1s_ease-in-out_infinite] [animation-delay:0.1s]" style={{height: '30px'}}></div>
      <div className="w-1 bg-gradient-to-t from-purple-300 to-pink-300 rounded-full animate-[wave_1s_ease-in-out_infinite] [animation-delay:0.2s]" style={{height: '25px'}}></div>
      <div className="w-1 bg-gradient-to-t from-purple-300 to-pink-300 rounded-full animate-[wave_1s_ease-in-out_infinite] [animation-delay:0.3s]" style={{height: '35px'}}></div>
      <div className="w-1 bg-gradient-to-t from-purple-300 to-pink-300 rounded-full animate-[wave_1s_ease-in-out_infinite] [animation-delay:0.4s]" style={{height: '20px'}}></div>
      <div className="w-1 bg-gradient-to-t from-purple-300 to-pink-300 rounded-full animate-[wave_1s_ease-in-out_infinite] [animation-delay:0.5s]" style={{height: '28px'}}></div>
      <div className="w-1 bg-gradient-to-t from-purple-300 to-pink-300 rounded-full animate-[wave_1s_ease-in-out_infinite] [animation-delay:0.6s]" style={{height: '22px'}}></div>
    </div>
  );
};

export default ListeningAnimation;
