import { useState } from 'react';

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [userText, setUserText] = useState(""); // Pour voir ce que tu dis
  const [response, setResponse] = useState("Konnichiwa Cyril ! ^_^ Prêt ?");
  const [debugError, setDebugError] = useState(""); // Pour voir l'erreur technique
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.pitch = 1.2;
      utterance.rate = 1.1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    setDebugError(""); // On efface les erreurs précédentes
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        setUserText(transcript); // On affiche ta phrase
        askAI(transcript);
      };
      recognition.onerror = (e) => {
        setIsListening(false);
        setDebugError("Erreur Micro: " + e.error);
      };
      recognition.start();
    } else {
      alert("Micro non supporté (Utilise Chrome)");
    }
  };

  const askAI = async (text) => {
    setResponse("Je réfléchis... (*_*)");
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      if (res.status !== 200) {
        // C'est ici qu'on va attraper l'erreur
        throw new Error(data.error || "Erreur inconnue du serveur");
      }

      setResponse(data.reply);
      speak(data.reply);
    } catch (error) {
      console.error(error);
      setResponse("Aïe, une erreur est survenue.");
      // On affiche l'erreur technique en rouge en bas
      setDebugError(error.message); 
    }
  };

  return (
    <div className="container">
      <div className="background-gradient"></div>
      <main className="glass-card">
        <div className="header">
          <span className="status-dot"></span>
          <h2>Yuki Coach (Mode Test)</h2>
        </div>

        <div className={`robot-container ${isSpeaking ? 'speaking' : 'idle'}`}>
          <img src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png" alt="Robot" className="robot-img"/>
        </div>

        {/* Zone de dialogue du Robot */}
        <div className="dialogue-box">
          <p>{response}</p>
        </div>

        {/* Zone de ce que TU as dit */}
        {userText && (
            <div style={{fontSize: '14px', color: '#555', marginBottom: '10px', fontStyle: 'italic'}}>
                Tu as dit : "{userText}"
            </div>
        )}

        {/* Zone d'affichage des ERREURS (En rouge) */}
        {debugError && (
            <div style={{backgroundColor: '#ffdddd', color: 'red', padding: '10px', borderRadius: '5px', fontSize: '12px', marginBottom: '10px'}}>
                ALERTE BUG : {debugError}
            </div>
        )}

        <button onClick={startListening} className={`mic-button ${isListening ? 'listening' : ''}`}>
          {isListening ? '👂 J\'écoute...' : '🎙️ Parler'}
        </button>
      </main>

      <style jsx>{`
        :global(body) { margin: 0; font-family: 'Quicksand', sans-serif; overflow: hidden; }
        .container { height: 100vh; display: flex; justify-content: center; align-items: center; }
        .background-gradient { position: absolute; top:0; left:0; right:0; bottom:0; background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); z-index: -1; }
        .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); padding: 30px; border-radius: 24px; width: 90%; max-width: 400px; text-align: center; display: flex; flex-direction: column; align-items: center; }
        .header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; color: #555; }
        .status-dot { width: 10px; height: 10px; background: #4ade80; border-radius: 50%; }
        .robot-container { width: 150px; height: 150px; margin-bottom: 20px; }
        .robot-img { width: 100%; height: 100%; object-fit: contain; }
        .dialogue-box { background: white; padding: 15px; border-radius: 15px; width: 100%; min-height: 50px; margin-bottom: 10px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.05); }
        .mic-button { background: #667eea; border: none; padding: 15px 40px; color: white; border-radius: 50px; cursor: pointer; font-size: 18px; margin-top: 10px; }
        .listening { background: #ff6b6b; }
      `}</style>
    </div>
  );
}
