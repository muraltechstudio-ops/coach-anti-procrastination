import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // La clé sera lue ici
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { message } = req.body;

  // C'est ici qu'on règle la personnalité du coach
  const systemPrompt = `
    Tu es "Yuki", un petit robot coach de vie d'inspiration japonaise.
    Ton utilisateur est Cyril. Il veut vaincre la procrastination.
    Tu es calme, kawaii (mignon), bienveillant et tu utilises la méthode Kaizen (petits pas).
    Tu ne juges jamais. Tu proposes des micro-tâches.
    Tes réponses sont courtes (max 2 phrases) pour ne pas fatiguer Cyril qui a des maux de tête.
    Utilise parfois des émojis japonais comme (kaomoji) ^_^ ou (>_<).
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Modèle rapide et pas cher
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 150,
    });

    res.status(200).json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Mon cerveau est fatigué..." });
  }
}
