import React, { useEffect, useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import '../components/InterviewCoach.css';
import ParticleSphere from '../components/ParticleSphere';

// --- ENHANCED INTERVIEW COACH COMPONENT ---

const InterviewCoach = () => {
  const webcamRef = useRef(null);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  // Audio Refs
  const audioContextRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);

  // SpeechSynthesis Fallback / Dual Voice Setup
  const synthRef = useRef(window.speechSynthesis || null);
  const [availableVoices, setAvailableVoices] = useState([]);

  // Speech recognition
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);

  // State
  const [interviewState, setInterviewState] = useState('idle');
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [postureStatus, setPostureStatus] = useState('Good');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [reportData, setReportData] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [visualizerState, setVisualizerState] = useState('idle');

  // New User Controls
  const [dualVoiceMode, setDualVoiceMode] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [enableTTSfallback, setEnableTTSfallback] = useState(true);
  const [videoBlurLevel, setVideoBlurLevel] = useState(0); // 0 to 10

  // --- Utility Hooks for Voices ---
  useEffect(() => {
    if (!synthRef.current) return;
    const updateVoices = () => {
      const voices = synthRef.current.getVoices().filter(v => v.lang.startsWith('en'));
      setAvailableVoices(voices);
    };

    if (synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = updateVoices;
    }
    updateVoices();

    return () => {
      if (synthRef.current) synthRef.current.onvoiceschanged = null;
    };
  }, []);

  const getVoicePair = useCallback(() => {
    if (!dualVoiceMode || availableVoices.length < 2) return [null, null];
    const maleVoice = availableVoices.find(v => v.name.match(/Google.*male|Microsoft.*male|male/i)) || availableVoices.find(v => v.name.match(/male/i));
    const femaleVoice = availableVoices.find(v => v.name.match(/Google.*female|Microsoft.*female|female/i)) || availableVoices.find(v => v.name.match(/female/i));
    const voice1 = maleVoice || availableVoices[0];
    const voice2 = femaleVoice || availableVoices.find(v => v.name !== voice1?.name) || availableVoices[1];
    return [voice1, voice2];
  }, [dualVoiceMode, availableVoices]);


  // --- Visualizer sync ---
  useEffect(() => {
    if (aiSpeaking) setVisualizerState('speaking');
    else if (isListening) setVisualizerState('listening');
    else setVisualizerState('idle');
  }, [aiSpeaking, isListening]);

  // --- Audio playback (arraybuffer) ---
  const handleAudioChunk = async (arrayBuffer) => {
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') await ctx.resume();
    try {
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
      audioQueueRef.current.push(audioBuffer);
      playNextChunk();
    } catch (e) {
      console.error('Audio decode failed, will fallback to TTS if available', e);
    }
  };

  const playNextChunk = () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;
    isPlayingRef.current = true;
    const ctx = audioContextRef.current;
    const audioBuffer = audioQueueRef.current.shift();
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start(0);
    setAiSpeaking(true);

    source.onended = () => {
      isPlayingRef.current = false;
      if (audioQueueRef.current.length > 0) playNextChunk();
      else {
        setAiSpeaking(false);
        // CRITICAL FIX STEP 3: Start listening immediately after AI audio finishes
        if (interviewState === 'active') startListening(); 
      }
    };
  };

  // --- TTS using SpeechSynthesis (fallback) ---
  const speakText = (text) => {
    if (!synthRef.current || !enableTTSfallback) return;

    const rate = Math.min(2, Math.max(0.6, speechRate));
    synthRef.current.cancel();
    setAiSpeaking(true);

    const onSpeechEnd = () => {
      // Check if both single/dual utterances have finished before setting AI to false
      if (synthRef.current.speaking === false) {
        setAiSpeaking(false);
        // CRITICAL FIX STEP 4: Start listening immediately after AI TTS finishes
        if (interviewState === 'active') startListening(); 
      }
    };
    
    // 1. Dual Voice Mode
    if (dualVoiceMode) {
      const [voice1, voice2] = getVoicePair();

      if (voice1 && voice2) {
        const utter1 = new SpeechSynthesisUtterance(text);
        utter1.rate = rate;
        utter1.voice = voice1;
        utter1.onend = onSpeechEnd;

        const utter2 = new SpeechSynthesisUtterance(text);
        utter2.rate = rate + 0.05; 
        utter2.pitch = 1.05; 
        utter2.voice = voice2;
        utter2.onend = onSpeechEnd;

        synthRef.current.speak(utter1);
        synthRef.current.speak(utter2);

      } else {
        console.warn('Not enough voices for dual-voice mode, falling back to single voice.');
        setDualVoiceMode(false); 
        speakText(text); 
      }

    } else {
      // 2. Single Voice Mode
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = rate;
      utter.onend = onSpeechEnd;
      synthRef.current.speak(utter);
    }
  };


  // --- WebSocket management ---
  const connectWebSocket = useCallback(() => {
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) return;
    ws.current = new WebSocket('ws://localhost:8000/ws/interview');
    ws.current.binaryType = 'arraybuffer';

    ws.current.onopen = () => {
      console.log('WS Connected');
      setConnectionStatus('connected');
    };
    ws.current.onclose = () => {
      console.log('WS Closed — retry in 1s');
      setConnectionStatus('disconnected');
      setTimeout(connectWebSocket, 1000);
    };
    ws.current.onerror = (err) => {
      console.warn('WS error', err);
      ws.current.close();
    };

    ws.current.onmessage = async (event) => {
      // arraybuffer audio from server
      if (event.data instanceof ArrayBuffer) {
        handleAudioChunk(event.data);
        return;
      }

      try {
        const data = JSON.parse(event.data);
        if (data.type === 'text_response') {
          setMessages((p) => [...p, { sender: 'ai', text: data.content }]);

          // Prefer server audio; otherwise use SpeechSynthesis fallback
          if (!audioQueueRef.current.length) {
            if (enableTTSfallback && synthRef.current) {
              speakText(data.content);
            } else {
              // Fallback if no audio/TTS: just show speaking state for a moment
              setAiSpeaking(true);
              setTimeout(() => {
                setAiSpeaking(false);
                // CRITICAL FIX STEP 5: Start listening if nothing else is playing
                if (interviewState === 'active') startListening(); 
              }, Math.min(5000, data.content.length * 80));
            }
          }
        } else if (data.type === 'report') {
          // Add 'Interview ended' message to the transcript before showing report
          setMessages((p) => [...p, { sender: 'system', text: 'Interview ended.' }]);
          
          setTimeout(() => {
            try { setReportData(JSON.parse(data.content)); } catch { setReportData(data.content); }
            setInterviewState('finished');
            
            // CRITICAL FIX STEP 6: Stop listening immediately when report is received
            if (recognitionRef.current) { recognitionRef.current.stop(); setIsListening(false); } 

          }, 1000);
        }
      } catch (e) {
        console.error('WS parse error', e);
      }
    };
  }, [enableTTSfallback, dualVoiceMode, speechRate, getVoicePair, interviewState]); // Added interviewState dependency

  useEffect(() => {
    connectWebSocket();
    return () => {
      ws.current?.close();
      if (recognitionRef.current) recognitionRef.current.stop(); // Clean up mic on unmount
    };
  }, [connectWebSocket]);

  // --- Timer & Mediapipe & Posture (unchanged) ---

  useEffect(() => {
    let timer = null;
    if (interviewState === 'active' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => (prev <= 1 ? (endInterview(), 0) : prev - 1)), 1000);
    }
    return () => clearInterval(timer);
  }, [interviewState, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    const loadScript = (src) => new Promise((res) => {
      if (document.querySelector(`script[src="${src}"]`)) return res();
      const s = document.createElement('script'); s.src = src; s.crossOrigin = 'anonymous'; s.onload = res; document.body.appendChild(s);
    });

    const load = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        setIsModelLoaded(true);
      } catch (e) { console.warn(e); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!isModelLoaded || !window.Pose || !window.Camera) return;
    const pose = new window.Pose({ locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}` });
    pose.setOptions({ modelComplexity: 1, smoothLandmarks: true });
    pose.onResults((res) => {
      if (!res.poseLandmarks) return;
      const noseY = res.poseLandmarks[0].y;
      const shoulderY = (res.poseLandmarks[11].y + res.poseLandmarks[12].y) / 2;
      const isSlouch = Math.abs(noseY - shoulderY) < 0.15;
      setPostureStatus(isSlouch ? 'Bad (Slouching)' : 'Good');
    });

    let camera = null;
    const startCam = () => {
      if (webcamRef.current?.video) {
        camera = new window.Camera(webcamRef.current.video, {
          onFrame: async () => { if (webcamRef.current?.video) await pose.send({ image: webcamRef.current.video }); },
          width: 640, height: 480
        });
        camera.start();
      } else setTimeout(startCam, 400);
    };
    startCam();
    return () => { try { pose.close(); camera?.stop(); } catch {} };
  }, [isModelLoaded]);

  // --- Speech Recognition (robust) ---
  const startListening = () => {
    // If AI is currently speaking, don't start listening yet.
    if (aiSpeaking) return;

    // CRITICAL FIX STEP 7: Ensure mic is stopped before restarting it
    if (recognitionRef.current) {
      try { 
        recognitionRef.current.onend = null; 
        recognitionRef.current.stop(); 
      } catch {};
      recognitionRef.current = null;
    }

    // Stop any TTS audio
    if (synthRef.current) synthRef.current.cancel();

    // Reset audio queue
    if (audioContextRef.current) {
      try { audioContextRef.current.suspend(); } catch {}
      audioQueueRef.current = [];
      isPlayingRef.current = false;
      setAiSpeaking(false);
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Speech recognition not supported in this browser. Use Chrome.'); return; }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1; // Optimization
    recognitionRef.current = recognition;
    setIsListening(true);

    let finalTranscript = '';
    recognition.onresult = (ev) => {
      clearTimeout(silenceTimerRef.current);
      let interim = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        if (ev.results[i].isFinal) finalTranscript += ev.results[i][0].transcript + ' ';
        else interim += ev.results[i][0].transcript;
      }
      
      // CRITICAL FIX STEP 8: Show interim text if possible (optional, but good UX)
      // Note: We only update the state when final text is ready, but this timeout handles sending the final text.

      // auto-send after silence
      silenceTimerRef.current = setTimeout(() => {
        if (finalTranscript.trim()) { 
          // Stop recognition and send the message
          recognitionRef.current.stop(); 
          sendUserMessage(finalTranscript.trim()); 
          finalTranscript = ''; 
        } else {
          // If silence and no final text, restart listening to catch the next sound
          if (interviewState === 'active' && !aiSpeaking) {
            recognitionRef.current.start();
          } else setIsListening(false);
        }
      }, 1800); // 1.8 seconds of silence

    };

    recognition.onend = () => {
      // Only restart if the interview is active and AI is not about to speak
      if (interviewState === 'active' && !aiSpeaking) {
        // Only restart if silence timer hasn't already sent a message/restarted
        if (!silenceTimerRef.current) { 
           try { recognition.start(); } catch {}; 
        }
      } else {
        setIsListening(false);
      }
    };
    
    recognition.onerror = (err) => {
      console.warn('Recognition error', err);
      if (err.error === 'not-allowed') { 
        setIsListening(false); 
        alert('Microphone permission denied. Please allow microphone access and try again.'); 
      }
      // If error is 'no-speech' or 'audio-capture', try restarting
      if (interviewState === 'active' && !aiSpeaking && (err.error === 'no-speech' || err.error === 'audio-capture')) {
        try { recognition.start(); } catch {};
      }
    };

    try { recognition.start(); } catch (e) { console.warn("Recognition start failed:", e); }
  };

  const sendUserMessage = (text) => {
    // Note: recognition is stopped in recognition.onresult/onend handler
    setIsListening(false); 
    setMessages((p) => [...p, { sender: 'user', text }]);

    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action: 'answer', text, visual_context: { posture: postureStatus } }));
    } else {
      connectWebSocket();
    }
  };

  // --- Actions ---
  const startInterview = () => {
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
    
    // CRITICAL FIX STEP 1: Set state first, then trigger WS message
    setInterviewState('active'); 
    setMessages([]); 
    setReportData(null); 
    setTimeLeft(30 * 60);
    
    // CRITICAL FIX STEP 2: The backend handles the initial AI speech (which triggers startListening on completion)
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action: 'start' }));
    } else {
      connectWebSocket();
    }
    
    // Do NOT call startListening() here. It will start too early and conflict with AI's initial speech.
  };

  const endInterview = () => {
    // Stop all media/audio immediately
    if (audioContextRef.current) {
      try { audioContextRef.current.suspend(); } catch {}
      audioQueueRef.current = []; isPlayingRef.current = false; setAiSpeaking(false);
    }
    if (recognitionRef.current) { recognitionRef.current.stop(); setIsListening(false); }

    // Send end signal to backend (which generates report and sends final message)
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action: 'end' }));
    } else {
       // If WS is closed, just force finish state and a local message
       setMessages((p) => [...p, { sender: 'system', text: 'Interview ended due to disconnection.' }]);
       setInterviewState('finished');
    }
  };

  // keyboard shortcuts: press 'L' to toggle listening
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === 'l' && interviewState === 'active' && !aiSpeaking) {
        if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }
        else startListening();
      }
      if (e.key === 'Escape') { if (interviewState === 'active') endInterview(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isListening, interviewState, aiSpeaking]);

  // scroll transcript to bottom
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // --- Render (Unchanged) ---
  return (
    <div className="coach-root">

      {/* Animated background layer */}
      <div className="bg-animated">
        <div className="bg-gradient" />
        <canvas id="bg-noise" className="bg-noise" />
      </div>

      <div className="coach-container">
        <aside className="left-panel glass">
          <div className="cam-wrapper">
            <Webcam
              ref={webcamRef}
              audio={false}
              className="webcam-el"
              style={{ filter: `blur(${videoBlurLevel}px)` }} // Apply Blur Filter
            />
            <div className={`posture ${postureStatus.includes('Bad') ? 'bad' : 'good'}`}>{postureStatus}</div>
            <div className="connection-pill">{connectionStatus}</div>
          </div>

          <div className="transcript glass small">
            <div className="transcript-header">Live Transcript</div>
            <div className="transcript-body">
              {messages.slice(-6).map((m, i) => (
                <div key={i} className={`msg ${m.sender}`}>
                  <div className="msg-sender">{m.sender === 'user' ? 'YOU' : m.sender === 'ai' ? 'AI' : 'SYSTEM'}</div>
                  <div className="msg-text">{m.text}</div>
                </div>
              ))}
              {interviewState === 'active' && isListening && (
                <div className="msg listening-indicator">
                  <div className="msg-sender">YOU</div>
                  <div className="msg-text text-pulse">...listening</div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="transcript-controls">
              <div className="timer">{formatTime(timeLeft)}</div>
              <div className="quick-tips">Pro Tip: Press <strong>L</strong> to toggle mic</div>
            </div>
          </div>
        </aside>

        <main className="right-panel glass">
          <header className="voice-header">
            <div>
              <h3>AI Voice Mode</h3>
              <div className="status">{visualizerState === 'speaking' ? 'Speaking' : visualizerState === 'listening' ? 'Listening' : 'Idle'}</div>
            </div>

            <div className="voice-settings">
              <label className="setting-row">
                <input type="checkbox" checked={dualVoiceMode} onChange={(e) => setDualVoiceMode(e.target.checked)} />
                <span>Dual Voice Mode</span>
              </label>
              <label className="setting-row">
                <input type="checkbox" checked={enableTTSfallback} onChange={(e) => setEnableTTSfallback(e.target.checked)} />
                <span>Enable TTS fallback</span>
              </label>
            </div>
          </header>
          
          <div className="settings-container glass-settings">
            <label className="setting-row">
                <span>Speech Rate ({speechRate.toFixed(1)}x)</span>
                <input type="range" min="0.6" max="1.6" step="0.1" value={speechRate} onChange={(e) => setSpeechRate(Number(e.target.value))} />
            </label>
            <label className="setting-row">
                <span>Video Blur Level ({videoBlurLevel}px)</span>
                <input type="range" min="0" max="10" step="1" value={videoBlurLevel} onChange={(e) => setVideoBlurLevel(Number(e.target.value))} />
            </label>
          </div>

          <div className="visualizer-area">
            <ParticleSphere state={visualizerState} />
          </div>

          <footer className="controls-bar">
            {interviewState === 'idle' || interviewState === 'finished' ? (
              <button className="btn primary" onClick={startInterview}>Start Interview</button>
            ) : (
              <>
                <button className={`btn mic ${isListening ? 'on' : ''}`} onClick={() => (isListening ? recognitionRef.current?.stop() : startListening())} disabled={aiSpeaking}>
                  {isListening ? 'Stop Mic' : 'Start Mic'}
                </button>
                <button className="btn danger" onClick={endInterview}>End Interview</button>
              </>
            )}

            <div className="micro-hints">
              <div>Voice Mode: {dualVoiceMode ? 'Dual (M/F)' : 'Single'}</div>
              <div>AI Speaking: {aiSpeaking ? 'Yes' : 'No'}</div>
            </div>
          </footer>

        </main>
      </div>

      {/* REPORT modal */}
      {reportData && (
        <div className="report-modal">
          <div className="report-card">
            <h2>Interview Report</h2>
            <div className="report-grid">
              <div className="score">{reportData.score}</div>
              <div className="confidence">{reportData.confidence_level}</div>
            </div>
            <div className="feedback">{reportData.feedback}</div>
            {reportData.improvements && reportData.improvements.length > 0 && (
                <div className="improvements-list">
                    <h4>Actionable Tips:</h4>
                    <ul>
                        {reportData.improvements.map((tip, index) => <li key={index}>{tip}</li>)}
                    </ul>
                </div>
            )}
            <button className="btn primary" onClick={() => setReportData(null)}>Close Report</button>
          </div>
        </div>
      )}

      {/* ENHANCED INLINE STYLES FOR THEME AND GLASS EFFECT (Unchanged) */}
      <style>{`
        /* Enhanced Base Styles */
        :root {
          --color-bg-dark: #0a0a0c;
          --color-glass-bg: rgba(18, 18, 22, 0.75);
          --color-border: rgba(255, 255, 255, 0.08);
          --color-primary: #1dd1a1;
          --color-primary-dark: #0f8f6f;
        }

        .coach-root { 
          position: relative; 
          min-height: 100vh; 
          overflow: hidden; 
          font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; 
          background-color: var(--color-bg-dark); /* Ensure a dark base */
          color: #e9eefc;
        }
        
        /* Animated Background */
        .bg-animated { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
        .bg-gradient { 
            position: absolute; 
            inset: -50px; /* Expand for movement */
            background: linear-gradient(135deg, #0f0a20, #041a12); 
            animation: gradient-shift 40s ease-in-out infinite alternate;
            background-size: 400% 400%;
            filter: blur(50px) saturate(120%); 
            opacity: 0.8;
        }
        @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .bg-noise { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.06; }
        
        /* Layout */
        .coach-container { position: relative; z-index: 5; display:flex; gap:20px; padding:24px; height:100vh; box-sizing:border-box; }
        .glass { 
            background: var(--color-glass-bg); 
            backdrop-filter: blur(16px) saturate(130%); 
            border-radius:20px; 
            border: 1px solid var(--color-border); 
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
        }
        .left-panel { width: 40%; display:flex; flex-direction:column; gap:16px; }
        .right-panel { flex:1; display:flex; flex-direction:column; padding:24px; }

        /* Webcam & Posture */
        .cam-wrapper { position:relative; height: 55vh; overflow:hidden; border-radius:18px; }
        .webcam-el { width:100%; height:100%; object-fit:cover; transition: filter 0.3s ease; } /* Transition for blur */
        .posture { position:absolute; top:18px; left:18px; padding:6px 14px; border-radius:999px; font-weight:700; font-size:13px; z-index:10; }
        .posture.good { background:var(--color-primary); color:#041a12; }
        .posture.bad { background:#ff6b6b; color:#330a0a; }
        .connection-pill { position:absolute; top:18px; right:18px; font-size:13px; padding:6px 14px; border-radius:999px; color:#ddd; background:rgba(0,0,0,0.5); z-index:10; }

        /* Transcript */
        .transcript.small { padding:18px; display:flex; flex-direction:column; height:30vh; }
        .transcript-header { color:#9aa; font-size:12px; text-transform:uppercase; margin-bottom:12px; font-weight:600; }
        .transcript-body { flex:1; overflow-y:auto; overflow-x:hidden; display:flex; flex-direction:column; gap:10px; }
        .msg { display:flex; gap:14px; align-items:flex-start; }
        .msg .msg-sender { min-width:56px; font-weight:700; color:#9aa; font-size:12px; text-transform:uppercase; }
        .msg.user .msg-sender { color:var(--color-primary); }
        .msg.ai .msg-sender { color:#82aaff; }
        .msg.system .msg-sender { color:#ff6b6b; } /* Color for system messages like 'ended' */
        .msg .msg-text { color:#e6e6e6; line-height:1.6; }
        .listening-indicator { opacity: 0.6; }
        .text-pulse { animation: pulse 1.5s infinite alternate; }
        @keyframes pulse { 0% { opacity: 0.5; } 100% { opacity: 1; } }

        .transcript-controls { display:flex; justify-content:space-between; align-items:center; margin-top:12px; padding-top:12px; border-top:1px solid var(--color-border); }
        .timer { font-size:14px; font-weight:600; color:#fff; }
        .quick-tips { font-size:12px; color:#9aa; }

        /* Right Panel */
        .voice-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
        .voice-header h3 { margin:0; font-weight:700; color:#e9eefc; font-size:20px; }
        .voice-header .status { font-size:14px; color:var(--color-primary); font-weight:600; }
        
        .voice-settings { display:flex; gap:20px; align-items:center; }
        .setting-row { display:flex; align-items:center; gap:8px; font-size:14px; cursor:pointer; }
        .setting-row input[type="checkbox"] { transform: scale(1.1); cursor:pointer; }
        
        .settings-container {
            padding: 16px;
            margin-bottom: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .settings-container .setting-row {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }
        .settings-container .setting-row span {
            margin-bottom: 4px;
            font-size: 14px;
            color: #ccc;
        }
        .settings-container .setting-row input[type="range"] {
            width: 100%;
            -webkit-appearance: none;
            height: 4px;
            background: rgba(255,255,255,0.2);
            border-radius: 2px;
            outline: none;
            transition: opacity .15s ease-in-out;
        }
        .settings-container .setting-row input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: var(--color-primary);
            cursor: pointer;
        }

        .visualizer-area { flex:1; display:flex; align-items:center; justify-content:center; }
        
        /* Controls Bar */
        .controls-bar { display:flex; gap:16px; align-items:center; justify-content:space-between; padding-top:20px; border-top:1px solid var(--color-border); }
        .btn { 
            padding:12px 24px; 
            border-radius:14px; 
            border:none; 
            cursor:pointer; 
            font-weight:700; 
            font-size:15px;
            transition: all 0.2s ease;
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 15px rgba(0,0,0,0.2); }
        .btn.primary { background:var(--color-primary); color:#041a12; box-shadow:0 10px 30px rgba(29,209,161,0.18); }
        .btn.danger { background:#ff4757; color:white; }
        .btn.mic { background:#444; color:#fff; }
        .btn.mic.on { box-shadow:0 0 0 4px rgba(255,255,255,0.1), 0 0 15px rgba(255,255,255,0.2); background:#fff; color:#000; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

        .micro-hints { display:flex; gap:15px; font-size:12px; color:#aaa; }

        /* Report Modal */
        .report-modal { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; z-index:1000; background:rgba(3,3,6,0.7); backdrop-filter: blur(5px); }
        .report-card { 
            width:880px; max-width:95%; padding:32px; 
            border-radius:20px; 
            background:linear-gradient(180deg,#0e0e11,#111116); 
            border: 1px solid var(--color-border);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        }
        .report-card h4 { margin-top: 20px; margin-bottom: 10px; color: #fff; }
        .report-card ul { padding-left: 20px; margin: 0; }
        .report-grid { display:flex; gap:20px; margin:20px 0; }
        .report-grid > div { padding:15px; border-radius:10px; background:rgba(255,255,255,0.05); flex:1; text-align:center; }
      `}</style>

    </div>
  );
};

export default InterviewCoach;