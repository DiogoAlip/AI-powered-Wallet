import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  IconPaperclip,
  IconMicrophone,
  IconArrowNarrowUp,
} from "@tabler/icons-react";
import { useFinancesStore } from "../../../store/finances.store.ts";

export function ChatInput({ newChat, chatId }: { newChat?: boolean; chatId?: string }) {
  const { chatHistory, sendMessage, isGenerating } = useFinancesStore();
  const [inputText, setInputText] = useState("");
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Speech Recognition and Web Audio API State
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [volumeLevel, setVolumeLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<any>(null);
  const streamRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const isSpeechSupported = !!SpeechRecognition;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isGenerating]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const textToSend = inputText;
    setInputText("");
    if (newChat) {
      const newChatId = `chat-${Date.now()}`;
      sendMessage(textToSend, newChatId);
      navigate(`/dashboard/chat/${newChatId}`);
    } else {
      sendMessage(textToSend, chatId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const stopAllRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
      recognitionRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {
        console.error("Error closing audio context:", e);
      }
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: any) => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
    setInterimTranscript("");
    setVolumeLevel(0);
  };

  const startRecording = async () => {
    if (!isSpeechSupported) {
      alert(
        "El dictado por voz no es soportado por este navegador. Por favor, usa Google Chrome, Microsoft Edge o Apple Safari."
      );
      return;
    }

    // Set flag to show widget first, so it doesn't wait for permission prompts
    setIsRecording(true);

    try {
      // Intentar capturar audio para el visualizador de volumen de forma opcional y no bloqueante
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 32;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkVolume = () => {
          if (!audioContextRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          const normalized = Math.min(1, average / 128);
          setVolumeLevel(normalized);
          animationFrameRef.current = requestAnimationFrame(checkVolume);
        };
        checkVolume();
      } catch (audioErr: any) {
        console.warn("Fallo al iniciar el visualizador de audio en tiempo real:", audioErr);
        // Si falla por falta de hardware (NotFoundError), mostramos una alerta amigable
        if (audioErr.name === "NotFoundError" || audioErr.name === "DevicesNotFoundError") {
          alert("No se detectó ningún micrófono conectado o disponible en tu sistema.");
          stopAllRecording();
          return;
        }
      }

      const rec = new SpeechRecognition();
      rec.lang = "es-ES";
      rec.continuous = true;
      rec.interimResults = true;

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onresult = (event: any) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (final) {
          setInputText((prev) => (prev ? prev.trim() + " " + final.trim() : final.trim()));
          setInterimTranscript("");
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          alert("Permiso de micrófono denegado. Habilita el acceso en tu navegador.");
        } else if (event.error === "audio-capture" || event.error === "no-speech") {
          // El silencio o la desconexión del audio no deben romper la experiencia con diálogos intrusivos
        } else {
          alert(`Error de dictado por voz: ${event.error}`);
        }
        stopAllRecording();
      };

      rec.onend = () => {
        stopAllRecording();
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error("Failed to start voice capture:", err);
      alert("No se pudo iniciar el dictado por voz. Verifica la conexión de tu micrófono.");
      stopAllRecording();
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopAllRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: any) => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return (
    <>
      <section
        className={` ${newChat ? "flex justify-center w-full" : "border-t border-gray-200/50 w-full bg-white px-5 py-4 shrink-0"}`}
      >
        <div
          className={`flex items-end gap-3 w-full max-w-4xl mx-auto ${newChat ? "rounded-full bg-grayteal-100 px-6 py-5" : ""}`}
        >
          <button className="p-3 text-gray-500 hover:text-[#006a61] bg-[#eff4ff] hover:bg-teal-50 rounded-full transition-all shrink-0 flex items-center justify-center h-12 w-12 border border-gray-200">
            <IconPaperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 bg-white border border-gray-200 rounded-2xl flex items-end min-h-12 shadow-sm focus-within:border-[#006a61] focus-within:ring-1 focus-within:ring-[#006a61] transition-all">
            <textarea
              id="chat-input-textarea"
              className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-4 font-sans text-sm text-[#0b1c30] max-h-32 overflow-y-auto no-scrollbar outline-none"
              placeholder={isRecording ? "Escuchando... habla ahora" : "Mensaje a FinancIA!..."}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ minHeight: "48px" }}
            />
            <button
              type="button"
              onClick={handleMicClick}
              className={`p-3 transition-colors mb-0.5 rounded-full ${isRecording
                ? "text-red-600 bg-red-50 hover:bg-red-100 animate-pulse border border-red-200"
                : "text-gray-400 hover:text-teal-600"
                }`}
            >
              <IconMicrophone className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={isGenerating || !inputText.trim()}
            className="bg-[#006a61] text-white hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-[#006a61] p-3 rounded-full transition-all shrink-0 flex items-center justify-center h-12 w-12 shadow-md"
          >
            <IconArrowNarrowUp className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Floating Microphone Activity & Live Transcription Widget */}
      {isRecording && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-md z-[9999] animate-fade-in">
          <div className="bg-white/95 border border-gray-200/50 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full mx-4 relative overflow-hidden text-center animate-fade-in-up">
            {/* Pulsing ring visualizer */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Outer pulsing ring 2 */}
              <div
                className="absolute inset-0 rounded-full bg-teal-500/10 transition-transform duration-75 ease-out"
                style={{
                  transform: `scale(${1.2 + volumeLevel * 0.7})`,
                  opacity: 0.5 + volumeLevel * 0.5,
                }}
              />
              {/* Outer pulsing ring 1 */}
              <div
                className="absolute inset-2 rounded-full bg-teal-500/20 transition-transform duration-75 ease-out"
                style={{
                  transform: `scale(${1.1 + volumeLevel * 0.4})`,
                  opacity: 0.7 + volumeLevel * 0.3,
                }}
              />
              {/* Inner Circle with Microphone */}
              <div
                className="w-16 h-16 rounded-full bg-[#006a61] flex items-center justify-center text-white relative z-10 transition-transform duration-75 ease-out shadow-lg"
                style={{ transform: `scale(${1 + volumeLevel * 0.15})` }}
              >
                <IconMicrophone className="w-7 h-7 text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-sans font-bold text-lg text-[#0b1c30]">Escuchando...</h3>
              <p className="font-sans text-xs text-gray-500">Dicta tu mensaje o consulta financiera</p>
            </div>

            {/* Live Transcript Display Box */}
            <div className="w-full min-h-[96px] bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-center justify-center max-h-36 overflow-y-auto no-scrollbar">
              <p className="font-sans text-sm italic text-slate-700 leading-relaxed break-words">
                {interimTranscript ? `"${interimTranscript}"` : '"Comienza a hablar..."'}
              </p>
            </div>

            <button
              onClick={stopAllRecording}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-sans text-xs font-bold rounded-full transition-all shadow-md cursor-pointer hover:scale-[1.02]"
            >
              Listo / Detener
            </button>
          </div>
        </div>
      )}
    </>
  );
}
