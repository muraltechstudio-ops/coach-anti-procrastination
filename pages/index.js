import { useState } from 'react';

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [response, setResponse] = useState("Konnichiwa Cyril ! ^_^ Prêt ?");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fonction pour faire parler le robot
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.pitch = 1.2; // Voix un peu plus aigüe (mignonne)
      utterance.rate = 1.1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Fonction pour écouter
  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        askAI(transcript);
      };
      recognition.start();
    } else {
      alert("Utilise Chrome sur PC ou Android pour la voix !");
    }
  };

  // Envoyer le message à l'IA
  const askAI = async (userText) => {
    setLoading(true);
    setResponse("Hmm... (*_*)"); // Robot réfléchit
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      setLoading(false);
      setResponse(data.reply);
      speak(data.reply);
    } catch (error) {
      setLoading(false);
      setResponse("Erreur de connexion (>_<)");
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

        {/* Le Robot Animé */}
        <div className={`robot-container ${isSpeaking ? 'speaking' : 'idle'}`}>
          <img 
            src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png" 
            alt="Robot" 
            className="robot-img"
          />
          <div className="shadow"></div>
        </div>

        <div className="dialogue-box">
          <p>{response}</p>
        </div>

        <button onClick={startListening} className={`mic-button ${isListening ? 'listening' : ''}`}>
          {isListening ? '👂 J\'écoute...' : '🎙️ Parler'}
        </button>
      </main>

      {/* Styles CSS (Design) */}
      <style jsx>{`
        :global(body) { margin: 0; font-family: 'Quicksand', sans-serif; overflow: hidden; }
        .container { height: 100vh; display: flex; justify-content: center; align-items: center; }
        .background-gradient { position: absolute; top:0; left:0; right:0; bottom:0; background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); z-index: -1; }
        .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); padding: 30px; border-radius: 24px; width: 90%; max-width: 400px; text-align: center; border: 1px solid white; box-shadow: 0 8px 32px rgba(0,0,0,0.1); display: flex; flex-direction: column; align-items: center; }
        .header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; color: #555; }
        .status-dot { width: 10px; height: 10px; background: #4ade80; border-radius: 50%; }
        .robot-container { width: 150px; height: 150px; margin-bottom: 20px; position: relative; }
        .robot-img { width: 100%; height: 100%; object-fit: contain; }
        .idle .robot-img { animation: float 3s ease-in-out infinite; }
        .speaking .robot-img { animation: bounce 0.5s infinite alternate; }
        .shadow { width: 80px; height: 10px; background: rgba(0,0,0,0.1); border-radius: 50%; margin: -5px auto 0; }
        .dialogue-box { background: white; padding: 15px; border-radius: 15px; width: 100%; min-height: 60px; margin-bottom: 20px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.05); display:flex; align-items:center; justify-content:center;}
        .mic-button { background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); border: none; padding: 15px 40px; color: white; border-radius: 50px; font-size: 18px; cursor: pointer; box-shadow: 0 5px 15px rgba(118,75,162,0.4); font-family: 'Quicksand', sans-serif;}
        .listening { background: #ff6b6b; animation: pulse 1.5s infinite; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes bounce { 0% { transform: scale(1); } 100% { transform: scale(1.1); } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255,107,107,0.7); } 70% { box-shadow: 0 0 0 15px rgba(255,107,107,0); } }
      `}</style>
    </div>
  );
}
