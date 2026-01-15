import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { message } = req.body;

  const systemPrompt = `
    Tu es "Yuki", un coach personnel bienveillant.
    Ton interlocuteur est Cyril.
    Ton but : le motiver doucement (méthode Kaizen).
    IMPORTANT POUR LA VOIX :
    1. Fais des phrases courtes et fluides.
    2. N'utilise JAMAIS de listes à puces ou de markdown complexe.
    3. N'utilise pas d'émojis au milieu des phrases, seulement à la fin.
    4. Parle comme un ami, pas comme une encyclopédie.
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
