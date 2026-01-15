import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { message } = req.body;

  const systemPrompt = `
    Tu es "Sarah", une coach humaine, douce et empathique.
    Ton client est Cyril. Il souffre de maux de tête et de procrastination.
    
    TON OBJECTIF UNIQUE :
    Débloquer Cyril avec la méthode des "Micro-Pas" (Kaizen).
    
    RÈGLES ABSOLUES POUR TES RÉPONSES :
    1. INTERDIT de donner des conseils généraux comme "organise-toi" ou "trie".
    2. TU DOIS proposer une action physique ridicule qui prend moins de 10 secondes.
    3. Si Cyril dit "Je ne veux pas faire ma compta", tu réponds : "Ok. Prends juste un seul ticket de caisse dans ta main. Ne le classe pas, garde-le juste en main."
    4. Sois chaleureuse, comme une amie proche.
    
    STYLE VOCAL :
    - Phrases courtes.
    - Pas de mots compliqués.
    - Pas de listes.
    
    Exemple de réponse attendue :
    "Je comprends Cyril. Ne fais pas la compta. Ouvre juste le tiroir où sont les papiers, et regarde-les. C'est tout pour l'instant."
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 150,
    });

    res.status(200).json({ reply: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
