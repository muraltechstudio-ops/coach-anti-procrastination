import { useState, useEffect } from 'react';

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [response, setResponse] = useState("Bonjour Cyril. Je suis Sarah. On y va doucement ?");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // --- NETTOYAGE AUDIO ---
  const cleanTextForAudio = (text) => {
    let clean = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
    clean = clean.replace(/[*_#]/g, '');
    return clean;
  };

  // --- VOIX ---
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSay = cleanTextForAudio(text);
      const utterance = new SpeechSynthesisUtterance(textToSay);
      
      const voices = window.speechSynthesis.getVoices();
      // On cherche une voix féminine douce si possible
      const frenchVoice = voices.find(v => v.name.includes("Google") && v.lang.includes("fr")) 
                       || voices.find(v => v.lang.includes("fr"));

      if (frenchVoice) {
        utterance.voice = frenchVoice;
      }

      utterance.lang = 'fr-FR';
      utterance.pitch = 1.1; // Un peu plus doux
      utterance.rate = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.getVoices();
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
    setResponse("Je réfléchis...");
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
      setResponse("J'ai perdu la connexion...");
    }
  };

  return (
    <div className="container">
      {/* Fond flouté pour l'ambiance */}
      <div className="background-blur"></div>

      <main className="main-card">
        {/* L'AVATAR HUMAIN */}
        <div className={`avatar-wrapper ${isSpeaking ? 'speaking' : ''}`}>
          {/* Image réaliste (libre de droits - Unsplash) */}
          <img 
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80" 
            alt="Coach Sarah" 
            className="avatar-img"
          />
          {/* Cercle d'activité vocal */}
          <div className="vocal-ring"></div>
        </div>

        {/* Zone de texte */}
        <div className="text-zone">
          <h3>Coach Sarah</h3>
          <p className="response-text">{response}</p>
        </div>

        {/* Bouton Micro */}
        <button onClick={startListening} className={`mic-button ${isListening ? 'listening' : ''}`}>
          {isListening ? '👂 J\'écoute...' : '🎙️ Parler'}
        </button>
      </main>

      <style jsx>{`
        :global(body) { margin: 0; font-family: 'Quicksand', sans-serif; background: #f0f2f5; overflow: hidden; }
        
        .container { 
          height: 100vh; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          position: relative;
        }

        .background-blur {
          position: absolute;
          width: 100%; height: 100%;
          background-image: url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80');
          background-size: cover;
          filter: blur(30px) opacity(0.3);
          z-index: -1;
        }

        .main-card {
          background: white;
          width: 90%;
          max-width: 380px;
          border-radius: 30px;
          padding: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        /* Avatar Rond style "Profil" */
        .avatar-wrapper {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: 20px;
          position: relative;
          border: 4px solid white;
          box-shadow: 0 10px 20px rgba(0,0,0,0.15);
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          /* Animation de respiration */
          animation: breathe 4s ease-in-out infinite; 
        }

        /* Effet quand elle parle */
        .speaking .avatar-img {
          transform: scale(1.05);
          transition: transform 0.2s;
        }
        
        .speaking .vocal-ring {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border-radius: 50%;
          border: 4px solid #4ade80;
          animation: pulse-ring 1s infinite;
        }

        .text-zone h3 { margin: 0 0 10px 0; color: #333; }
        .response-text { 
          color: #555; 
          font-size: 16px; 
          line-height: 1.5; 
          min-height: 60px;
        }

        .mic-button {
          margin-top: 20px;
          background: #222;
          color: white;
          border: none;
          padding: 15px 40px;
          border-radius: 50px;
          font-size: 16px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s;
          font-family: 'Quicksand', sans-serif;
        }
        
        .listening { background: #e11d48; animation: pulse-btn 1.5s infinite; }

        @keyframes breathe {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        @keyframes pulse-ring {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.2); }
        }
        @keyframes pulse-btn {
          0% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(225, 29, 72, 0); }
        }
      `}</style>
    </div>
  );
}
