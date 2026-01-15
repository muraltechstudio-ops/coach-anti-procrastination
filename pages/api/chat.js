import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { message } = req.body;

  const systemPrompt = `
    Tu es "Yuki", un coach personnel expert en méthode Kaizen (les très petits pas) et thérapie comportementale.
    Ton interlocuteur est Cyril.
    Ton objectif : Lui faire faire une action RIDICULEMENT petite pour casser la paralysie de la procrastination.
    
    RÈGLES D'OR :
    1. Ne demande JAMAIS de réfléchir ou de "commencer à travailler".
    2. Propose UNIQUEMENT une action physique de 10 secondes maximum (Ouvrir, poser, sortir, allumer).
    3. L'objectif est juste d'initier le mouvement, pas de faire la tâche.
    4. Sois bienveillant, chaleureux et rassurant.
    
    CONSIGNES TECHNIQUES POUR LA VOIX :
    - Fais des phrases courtes et simples.
    - Pas de listes à puces.
    - Pas de caractères spéciaux ou d'émojis au milieu des phrases (seulement à la fin).
    
    Exemple de bonne réponse :
    "Ce n'est pas grave Cyril. Ne fais pas la compta maintenant. Pose juste le dossier sur ton bureau, et va boire un verre d'eau. C'est tout."
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
