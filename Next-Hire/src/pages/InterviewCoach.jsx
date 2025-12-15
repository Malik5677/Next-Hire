import React, { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

// ============================================================================
// 🔮 ENERGY SPHERE — D2 SHOCKWAVE & PARTICLE HOLOGRAM (INLINE CANVAS)
// ============================================================================
function EnergySphere({ state }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);

    let shockwaveRadius = 0;
    let particles = [];

    const rand = (min, max) => Math.random() * (max - min) + min;

    function spawnParticles() {
      for (let i = 0; i < 5; i++) {
        particles.push({
          x: w / 2,
          y: h / 2,
          angle: rand(0, Math.PI * 2),
          speed: rand(0.5, 1.4),
          size: rand(1, 3),
          alpha: 1,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // Background Glow
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 1.2);
      g.addColorStop(0, "rgba(180, 0, 255, 0.25)");
      g.addColorStop(1, "rgba(60, 0, 120, 0.05)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // ENERGY CORE
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 30, 0, Math.PI * 2);
      ctx.fillStyle =
        state === "speaking"
          ? "rgba(220, 0, 255, 0.9)"
          : "rgba(200, 0, 255, 0.55)";
      ctx.shadowBlur = 35;
      ctx.shadowColor = "#ff00ff";
      ctx.fill();

      // SHOCKWAVE RINGS
      if (state === "speaking") {
        shockwaveRadius += 2.3;
        if (shockwaveRadius > 200) shockwaveRadius = 20;

        ctx.beginPath();
        ctx.arc(w / 2, h / 2, shockwaveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(200,0,255,${1 - shockwaveRadius / 200})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        spawnParticles();
      }

      // PARTICLES
      particles.forEach((p, i) => {
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        p.alpha -= 0.015;

        ctx.fillStyle = `rgba(255,0,255,${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.alpha <= 0) particles.splice(i, 1);
      });

      requestAnimationFrame(draw);
    }

    draw();
  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "20px",
      }}
    />
  );
}

// ============================================================================
// 🔥 MAIN INTERVIEW COACH COMPONENT
// ============================================================================
export default function InterviewCoach() {
  const ws = useRef(null);
  const webcamRef = useRef(null);
  const messagesEndRef = useRef(null);

  // AUDIO
  const audioCtx = useRef(null);
  const audioQueue = useRef([]);
  const audioPlaying = useRef(false);

  // SPEECH RECOGNITION
  const recognitionRef = useRef(null);
  const silenceTimer = useRef(null);

  // STATE
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState("connecting");
  const [interviewState, setInterviewState] = useState("idle");
  const [isListening, setIsListening] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [visualizer, setVisualizer] = useState("idle");
  const [posture, setPosture] = useState("Good");
  const [report, setReport] = useState(null);
  const [blurLevel, setBlurLevel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800);

  // Update visualizer
  useEffect(() => {
    if (aiSpeaking) setVisualizer("speaking");
    else if (isListening) setVisualizer("listening");
    else setVisualizer("idle");
  }, [aiSpeaking, isListening]);

  // WEBSOCKET CONNECT
  const connectWS = useCallback(() => {
    ws.current = new WebSocket("ws://localhost:8000/ws/interview");
    ws.current.binaryType = "arraybuffer";

    ws.current.onopen = () => setConnection("connected");

    ws.current.onclose = () => {
      setConnection("disconnected");
      setTimeout(connectWS, 1200);
    };

    ws.current.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        handleAudio(event.data);
        return;
      }

      try {
        const data = JSON.parse(event.data);

        if (data.type === "text_response") {
          setMessages((p) => [...p, { sender: "ai", text: data.content }]);
        }

        if (data.type === "report") {
          setReport(JSON.parse(data.content));
          setInterviewState("finished");
          stopMic();
        }
      } catch {}
    };
  }, []);

  useEffect(connectWS, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // AUDIO ENGINE
  const handleAudio = async (buf) => {
    if (!audioCtx.current)
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();

    const ctx = audioCtx.current;
    if (ctx.state === "suspended") await ctx.resume();

    try {
      const decoded = await ctx.decodeAudioData(buf.slice(0));
      audioQueue.current.push(decoded);
      playAudio();
    } catch {}
  };

  const playAudio = () => {
    if (audioPlaying.current || audioQueue.current.length === 0) return;

    const ctx = audioCtx.current;
    const next = audioQueue.current.shift();
    const src = ctx.createBufferSource();

    src.buffer = next;
    src.connect(ctx.destination);
    src.start();

    audioPlaying.current = true;
    setAiSpeaking(true);

    src.onended = () => {
      audioPlaying.current = false;

      if (audioQueue.current.length > 0) playAudio();
      else {
        setAiSpeaking(false);
        if (interviewState === "active") startMic();
      }
    };
  };

  // MIC ENGINE
  const stopMic = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  const startMic = () => {
    if (aiSpeaking) return;

    stopMic();

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Your browser does not support speech recognition.");

    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = true;

    let finalText = "";
    setIsListening(true);

    rec.onresult = (e) => {
      clearTimeout(silenceTimer.current);

      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript + " ";
      }

      silenceTimer.current = setTimeout(() => {
        if (finalText.trim()) {
          sendAns(finalText.trim());
          finalText = "";
        }
      }, 900);
    };

    rec.onend = () => {
      if (!aiSpeaking) rec.start();
    };

    try {
      rec.start();
    } catch {}
  };

  const sendAns = (text) => {
    stopMic();
    setMessages((p) => [...p, { sender: "user", text }]);

    ws.current.send(
      JSON.stringify({
        action: "answer",
        text,
        visual_context: { posture },
      })
    );
  };

  // INTERVIEW CONTROL
  const startInterview = () => {
    setInterviewState("active");
    setMessages([]);
    setReport(null);
    setTimeLeft(1800);

    if (!audioCtx.current)
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    audioCtx.current.resume();

    ws.current.send(JSON.stringify({ action: "start", role: "general" }));
  };

  const endInterview = () => {
    stopMic();
    ws.current.send(JSON.stringify({ action: "end" }));
    setInterviewState("finished");
  };

  // TIMER
  useEffect(() => {
    if (interviewState !== "active") return;
    if (timeLeft <= 0) return endInterview();

    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, interviewState]);

  // ========================================================================
  // INLINE CSS — Purple Neon Sci-Fi Theme
  // ========================================================================
  const css = `
    * {
      margin: 0; padding: 0; box-sizing: border-box;
      font-family: 'Inter', sans-serif;
    }
    body {
      background: #0a0014;
    }

    .root {
      width: 100%;
      height: 100vh;
      overflow: hidden;
      padding: 18px;
      background: radial-gradient(circle at 20% 20%, #300040, #090010);
      color: #fff;
      display: flex;
      flex-direction: column;
    }

    .layout {
      flex: 1;
      display: flex;
      gap: 20px;
    }

    .glass {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,0,255,0.25);
      backdrop-filter: blur(15px);
      border-radius: 18px;
      box-shadow: 0 0 25px rgba(255,0,255,0.15);
    }

    /* LEFT PANEL */
    .left {
      width: 35%;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .cam-box {
      height: 45vh;
      border-radius: 18px;
      overflow: hidden;
      position: relative;
      border: 1px solid rgba(255,0,255,0.35);
      box-shadow: 0 0 25px rgba(255,0,255,0.25);
    }

    .webcam {
      width: 100%; height: 100%; object-fit: cover;
    }

    .tag {
      position: absolute;
      bottom: 12px; left: 12px;
      padding: 6px 12px;
      background: rgba(255,0,255,0.4);
      border-radius: 8px;
      font-size: 12px;
      font-weight: bold;
    }

    .connection {
      position: absolute;
      top: 12px; right: 12px;
      padding: 6px 12px;
      background: rgba(255,255,255,0.15);
      border-radius: 10px;
      font-size: 12px;
    }

    /* TRANSCRIPT */
    .transcript {
      flex: 1;
      padding: 16px;
      display: flex;
      flex-direction: column;
    }

    .trans-head {
      font-size: 15px;
      margin-bottom: 10px;
      color: #ff99ff;
      font-weight: bold;
    }

    .trans-body {
      flex: 1;
      overflow-y: auto;
      padding-right: 6px;
    }

    .bubble {
      margin-bottom: 12px;
    }

    .sender {
      font-size: 11px;
      color: #ffb0ff;
      opacity: 0.8;
    }

    .txt {
      padding: 10px 15px;
      margin-top: 4px;
      background: rgba(255,0,255,0.15);
      border-radius: 12px;
    }

    .user .txt {
      background: rgba(0,200,255,0.15);
    }

    .pulse {
      animation: pulse 1.2s infinite;
    }
    @keyframes pulse {
      0% { opacity: .3; } 50% { opacity: 1; } 100% { opacity: .3; }
    }

    .timer {
      margin-top: 10px;
      font-size: 14px;
      color: #ff99ff;
      text-align: right;
    }

    /* RIGHT PANEL */
    .right {
      width: 65%;
      padding: 20px;
      display: flex;
      flex-direction: column;
    }

    .title {
      font-size: 26px;
      color: #ff66ff;
      text-shadow: 0 0 12px #ff00ff;
      font-weight: bold;
    }

    .status {
      margin-top: 5px;
      font-size: 12px;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      width: fit-content;
    }

    .sphere {
      height: 33vh;
      margin-top: 15px;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid rgba(255,0,255,0.3);
      box-shadow: 0 0 30px rgba(255,0,255,0.25);
    }

    /* BUTTONS */
    .controls {
      margin-top: auto;
      display: flex;
      gap: 12px;
      margin-bottom: 10px;
    }

    .btn {
      padding: 12px 22px;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      font-weight: bold;
      font-size: 14px;
      transition: 0.2s;
    }

    .start {
      background: #ff00ff;
      color: #000;
      box-shadow: 0 0 12px #ff00ff;
    }

    .mic {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,0,255,0.4);
      color: #fff;
    }

    .mic.on {
      background: rgba(0,200,255,0.25);
      box-shadow: 0 0 12px #00ccff;
    }

    .end {
      background: rgba(255,40,40,0.4);
      color: #fff;
      border: 1px solid rgba(255,0,70,0.6);
    }

    /* REPORT MODAL */
    .modal {
      position: fixed;
      inset: 0;
      backdrop-filter: blur(12px);
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .modal-card {
      width: 430px;
      padding: 22px;
      background: rgba(0,0,0,0.7);
      border-radius: 20px;
      border: 1px solid rgba(255,0,255,0.4);
      box-shadow: 0 0 35px #ff00ff;
    }

    .report-score {
      font-size: 40px;
      margin-bottom: 10px;
      color: #ff66ff;
      text-align: center;
      font-weight: bold;
    }
  `;

  // ========================================================================
  // JSX UI
  // ========================================================================
  return (
    <>
      <style>{css}</style>

      <div className="root">
        <div className="layout">

          {/* LEFT PANEL */}
          <div className="left">
            <div className="cam-box glass">
              <Webcam
                ref={webcamRef}
                className="webcam"
                style={{ filter: `blur(${blurLevel}px)` }}
              />
              <div className="tag">{posture}</div>
              <div className="connection">{connection}</div>
            </div>

            <div className="transcript glass">
              <div className="trans-head">Live Transcript</div>

              <div className="trans-body">
                {messages.slice(-6).map((m, i) => (
                  <div key={i} className={`bubble ${m.sender}`}>
                    <div className="sender">{m.sender.toUpperCase()}</div>
                    <div className="txt">{m.text}</div>
                  </div>
                ))}

                {isListening && (
                  <div className="bubble user">
                    <div className="sender">YOU</div>
                    <div className="txt pulse">…listening</div>
                  </div>
                )}

                <div ref={messagesEndRef}></div>
              </div>

              <div className="timer">
                {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
                {String(timeLeft % 60).padStart(2, "0")}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="right glass">
            <div>
              <div className="title">AI Voice Mode</div>
              <div className="status">
                {visualizer === "speaking"
                  ? "Speaking"
                  : visualizer === "listening"
                  ? "Listening"
                  : "Idle"}
              </div>
            </div>

            {/* ENERGY SPHERE */}
            <div className="sphere">
              <EnergySphere state={visualizer} />
            </div>

            {/* CONTROLS */}
            <div className="controls">
              {(interviewState === "idle" || interviewState === "finished") ? (
                <button className="btn start" onClick={startInterview}>
                  Start Interview
                </button>
              ) : (
                <>
                  <button
                    className={`btn mic ${isListening ? "on" : ""}`}
                    onClick={() => (isListening ? stopMic() : startMic())}
                    disabled={aiSpeaking}
                  >
                    {isListening ? "Stop Mic" : "Start Mic"}
                  </button>

                  <button className="btn end" onClick={endInterview}>
                    End
                  </button>
                </>
              )}
            </div>
          </div>

        </div>

        {/* REPORT MODAL */}
        {report && (
          <div className="modal">
            <div className="modal-card">
              <div className="report-score">{report.score}</div>
              <p style={{ marginBottom: "14px" }}>{report.feedback}</p>

              <button className="btn start" onClick={() => setReport(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
