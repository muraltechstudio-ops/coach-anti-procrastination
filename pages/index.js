import { useState, useEffect } from 'react';

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [response, setResponse] = useState("Salut Cyril ! Je suis prêt.");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // --- 1. FONCTION DE NETTOYAGE AUDIO ---
  const cleanTextForAudio = (text) => {
    // Enlève les émojis (pour ne pas qu'il dise "visage souriant")
    let clean = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
    // Enlève les astérisques et caractères spéciaux
    clean = clean.replace(/[*_#]/g, '');
    return clean;
  };

  // --- 2. GESTION DE LA VOIX ---
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const textToSay = cleanTextForAudio(text);
      const utterance = new SpeechSynthesisUtterance(textToSay);
      
      // Recherche de la meilleure voix française
      const voices = window.speechSynthesis.getVoices();
      // On cherche une voix Google (souvent meilleure) ou une voix native
      const frenchVoice = voices.find(v => v.name.includes("Google") && v.lang.includes("fr")) 
                       || voices.find(v => v.lang.includes("fr"));

      if (frenchVoice) {
        utterance.voice = frenchVoice;
      }

      utterance.lang = 'fr-FR';
      utterance.pitch = 1.0; // Normal
      utterance.rate = 1.0;  // Vitesse normale
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Charge les voix au démarrage (astuce pour Chrome)
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        setUserText(transcript);
        askAI(transcript);
      };
      recognition.start();
    } else {
      alert("Micro non supporté (Utilise Chrome)");
    }
  };

  const askAI = async (text) => {
    setResponse("...");
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setResponse(data.reply);
      speak(data.reply);
    } catch (error) {
      setResponse("Erreur de connexion.");
    }
  };

  return (
    <div className="container">
      <div className="background-gradient"></div>
      <main className="glass-card">
        <div className="header">
          <span className="status-dot"></span>
          <h2>Yuki Coach</h2>
        </div>

        <div className={`robot-container ${isSpeaking ? 'speaking' : 'idle'}`}>
          <img src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png" alt="Robot" className="robot-img"/>
          <div className="shadow"></div>
        </div>

        <div className="dialogue-box">
          <p>{response}</p>
        </div>

        {userText && <p style={{fontSize:'12px', color:'#666', marginBottom:'10px'}}>"{userText}"</p>}

        <button onClick={startListening} className={`mic-button ${isListening ? 'listening' : ''}`}>
          {isListening ? '👂 J\'écoute...' : '🎙️ Parler'}
        </button>
      </main>

      <style jsx>{`
        :global(body) { margin: 0; font-family: 'Quicksand', sans-serif; overflow: hidden; }
        .container { height: 100vh; display: flex; justify-content: center; align-items: center; }
        .background-gradient { position: absolute; top:0; left:0; right:0; bottom:0; background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); z-index: -1; }
        .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); padding: 30px; border-radius: 24px; width: 90%; max-width: 400px; text-align: center; display: flex; flex-direction: column; align-items: center; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; color: #555; }
        .status-dot { width: 10px; height: 10px; background: #4ade80; border-radius: 50%; box-shadow: 0 0 5px #4ade80; }
        .robot-container { width: 160px; height: 160px; margin-bottom: 20px; position: relative; }
        .robot-img { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 5px 5px rgba(0,0,0,0.1)); }
        .idle .robot-img { animation: float 3s ease-in-out infinite; }
        .speaking .robot-img { animation: bounce 0.5s infinite alternate; }
        .shadow { width: 80px; height: 10px; background: rgba(0,0,0,0.1); border-radius: 50%; margin: -5px auto 0; animation: shadow-scale 3s ease-in-out infinite; }
        .dialogue-box { background: white; padding: 15px; border-radius: 15px; width: 100%; min-height: 60px; margin-bottom: 10px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; font-weight: 500;}
        .mic-button { background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); border: none; padding: 15px 40px; color: white; border-radius: 50px; font-size: 18px; cursor: pointer; box-shadow: 0 4px 15px rgba(100,100,100,0.3); transition: transform 0.2s; font-family: 'Quicksand', sans-serif;}
        .mic-button:active { transform: scale(0.95); }
        .listening { background: #ff6b6b; animation: pulse 1.5s infinite; }
        
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes shadow-scale { 0%,100% { transform: scale(1); opacity:0.2; } 50% { transform: scale(0.8); opacity:0.1; } }
        @keyframes bounce { 0% { transform: scale(1); } 100% { transform: scale(1.05); } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255,107,107,0.7); } 70% { box-shadow: 0 0 0 15px rgba(255,107,107,0); } }
      `}</style>
    </div>
  );
}
