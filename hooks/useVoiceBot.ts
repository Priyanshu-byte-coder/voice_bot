import { useState, useEffect, useRef, useCallback } from 'react';
import { BotState } from '../types';
import { sighSound } from '../assets/sounds';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((this: SpeechRecognition, ev: any) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: any) => any) | null;
  new(): SpeechRecognition;
}

const getSpeechRecognition = (): SpeechRecognition | null => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return SpeechRecognition ? new SpeechRecognition() : null;
};

export const useVoiceBot = () => {
  const [botState, setBotState] = useState<BotState>(BotState.INITIALIZING);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const botStateRef = useRef<BotState>(botState);
  botStateRef.current = botState;

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissionGranted(true);
        // We don't need to keep the stream, just checking permission.
        stream.getTracks().forEach(track => track.stop());
        setBotState(BotState.IDLE);
      } catch (err) {
        console.error('Microphone permission denied.', err);
        setPermissionGranted(false);
        setBotState(BotState.NO_MIC_PERMISSION);
      }
    };
    checkPermission();
  }, []);

  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length > 0) {
        setVoices(allVoices);
      }
    };
    // Voices load asynchronously. onvoiceschanged is the correct event.
    if (window.speechSynthesis.getVoices().length) {
      loadVoices();
    } else {
       window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const startListening = useCallback(() => {
    if (!permissionGranted || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    
    setTranscript('');
    setInterimTranscript('');
    setRecognitionError(null);

    const recognition = getSpeechRecognition();
    if (recognition) {
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Listen in Indian English for better accent recognition

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setInterimTranscript(interim);
        if(finalTranscript){
            setTranscript(finalTranscript);
        }
      };

      recognition.onend = () => {
        if (botStateRef.current === BotState.LISTENING) {
          setBotState(BotState.IDLE);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setRecognitionError(event.error);
        if (event.error !== 'aborted' && botStateRef.current === BotState.LISTENING) {
          setBotState(BotState.IDLE);
        }
      };
      
      recognition.start();
      recognitionRef.current = recognition;
      setBotState(BotState.LISTENING);
    } else {
        console.error("Speech recognition not supported in this browser.");
        setBotState(BotState.ERROR);
    }
  }, [permissionGranted]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // prevent onend from firing on manual stop
      recognitionRef.current.stop();
      recognitionRef.current = null;
      if (botStateRef.current === BotState.LISTENING) {
        setBotState(BotState.IDLE);
      }
    }
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!('speechSynthesis' in window) || !text) {
        onEnd?.();
        return;
    }

    const actionQueue: { type: 'speak' | 'sound'; content: string }[] = [];
    // Split by (*sigh*) and filter out empty strings
    const parts = text.split(/(\*sigh\*)/g).filter(Boolean);

    for (const part of parts) {
      if (part === '*sigh*') {
        actionQueue.push({ type: 'sound', content: sighSound });
      } else {
        const cleanedText = part.replace(/\*/g, '').trim();
        if (cleanedText) {
          actionQueue.push({ type: 'speak', content: cleanedText });
        }
      }
    }
    
    if (actionQueue.length === 0) {
        onEnd?.();
        return;
    }

    let queueIndex = 0;
    const processQueue = () => {
        if (queueIndex >= actionQueue.length) {
            onEnd?.();
            return;
        }

        const currentAction = actionQueue[queueIndex];
        queueIndex++;

        if (currentAction.type === 'sound') {
            const audio = new Audio(currentAction.content);
            audio.onended = processQueue;
            audio.onerror = (e) => {
                if (e instanceof Event) {
                    const error = (e.target as HTMLAudioElement)?.error;
                    console.error("Audio playback error:", error || e);
                } else {
                    console.error("Audio playback error:", e);
                }
                processQueue(); // Continue queue even if sound fails
            };
            audio.play();
        } else { // type === 'speak'
            const utterance = new SpeechSynthesisUtterance(currentAction.content);
            
            const femaleHindiVoice = voices.find(v => v.lang === 'hi-IN' && v.name.toLowerCase().includes('female'));
            const femaleIndianEnglishVoice = voices.find(v => v.lang === 'en-IN' && v.name.toLowerCase().includes('female'));
            const bestVoice = femaleHindiVoice || femaleIndianEnglishVoice;

            if (bestVoice) {
                utterance.voice = bestVoice;
                utterance.lang = bestVoice.lang;
            } else {
                utterance.lang = 'hi-IN';
            }

            utterance.pitch = 1;
            utterance.rate = 1; // Increased speed
            utterance.volume = 1;
            utterance.onend = processQueue;
            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event.error);
                processQueue(); // Continue queue even if utterance fails
            };

            window.speechSynthesis.speak(utterance);
        }
    };
    
    setBotState(BotState.SPEAKING);
    window.speechSynthesis.cancel(); // Clear any previous utterances
    processQueue();

  }, [voices, setBotState]);

  return { botState, setBotState, startListening, stopListening, speak, transcript, interimTranscript, permissionGranted, recognitionError };
};