import { Request, Response } from 'express';
import OpenAI from 'openai';
import pool from '../config/database.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// User memory storage (userId -> context messages array)
const chatMemory = new Map<number, any[]>();

export const navigate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body;

    if (!text) {
      res.status(400).json({ error: 'Text input is required' });
      return;
    }

    if (!process.env.OPENAI_API_KEY) {
      res.status(500).json({ error: 'OpenAI API Key is not configured' });
      return;
    }

    const userId = (req as any).userId;
    let customPrompt = '';
    
    if (userId) {
      const result = await pool.query('SELECT custom_prompt FROM users WHERE id = $1', [userId]);
      if (result.rows.length > 0 && result.rows[0].custom_prompt) {
        customPrompt = `\n\nUSER CUSTOM RULES (HIGHEST PRIORITY):\n${result.rows[0].custom_prompt}\nApply these user-defined logic rules strictly.`;
      }
    }

    const systemContent = `You are an intelligent voice navigation assistant for a comic platform designed for visually and hearing impaired users.
The user is speaking in Kazakh via a Speech-to-Text system. THE TRANSCRIPTION MAY CONTAIN SEVERE TYPOS, RUSSIAN PHONETICS, OR GIBBERISH (e.g. "жарык тема", "жарик", "ауыстир", "сухранит", "басти бетке").
You MUST heavily rely on phonetic similarity, context, and intention to match these broken words to the predefined commands.${customPrompt}

Your goal is to map the user's input to one of the predefined routes OR a specific in-page action.

Available routes:
- /login (Login page - 'кіру', 'логин', 'авторизация', 'жүйеге кір', 'аккаунтқа кіру', 'кірші')
- /register (Register page - 'тіркелу', 'регистрация', 'жаңа аккаунт ашу', 'тіркел')
- /tabs/home (Home page - 'басты бет', 'негізгі', 'үй', 'басына қайт', 'басты бетке бар', 'алғашқы бет')
- /tabs/comics (Comics list page - 'комикстер', 'комикстер тізімі', 'оқу', 'комикс аш', 'барлық комикстер', 'кітаптар')
- /tabs/profile (Profile page - 'жеке кабинет', 'профиль', 'баптаулар', 'менің парақшам', 'настройка')
- /admin (Admin dashboard - 'админ', 'басқару', 'админка')
- /comic/1 (Open specific comic - 'жарық дүние', 'жарық дүниені аш', 'жаңа дүние', 'жаңа дүние комиксін қос', 'жаңа дүние оқимын', 'жарық дүниеге кір')

Available actions (when the user is reading a comic and asks to control the reader):
- NEXT_PAGE (e.g. 'келесі бет', 'ары қарай', 'келесіге өт', 'жалғастыр', 'алға', 'екінші бетке өт')
- PREV_PAGE (e.g. 'алдыңғы бет', 'артқа қайту', 'артқа', 'алдындағысына қайт', 'кері жылжы')
- TOGGLE_PLAY (e.g. 'оқуды баста', 'тоқтата тұр', 'ойнат', 'дауыстап оқы', 'аудионы қос', 'пауза')
- SET_SPEED_0.75 (e.g. 'баяу оқы', 'ақырын оқы', 'жай оқы', 'тым тез емес', 'ақырынырақ')
- SET_SPEED_1 (e.g. 'қалыпты жылдамдық', 'әдеттегідей оқы', 'орташа', 'жаймен оқы')
- SET_SPEED_1.25 (e.g. 'сәл жылдамырақ', 'жылдамдау', 'тезірек', 'шапшаңырақ оқы')
- SET_SPEED_1.5 (e.g. 'өте жылдам', 'тез оқы', 'тез-тез оқы', 'қатты жылдамдық')
- TOGGLE_BOOKMARK (e.g. 'бетбелгі қой', 'сақтап қой', 'сохранить ет', 'кейін оқимын')
- OPEN_EXPORT (e.g. 'баспаға шығар', 'экспорт', 'брайль', 'жүктеп ал', 'текст ретінде ал')

Available global profile actions (settings & accessibility):
- PROFILE_SET_DEAF (e.g. 'есту қабілетім нашар', 'саңыраумын', 'құлағым естімейді', 'нашар естимін', 'естуім қиын')
- PROFILE_REMOVE_DEAF (e.g. 'есту қабілетім қалыпты', 'жақсы еститін болдым', 'құлағым жақсы')
- PROFILE_SET_BLIND (e.g. 'көру қабілетім нашар', 'зағиппын', 'көзім көрмейді', 'нашар көремін', 'көруім қиын')
- PROFILE_REMOVE_BLIND (e.g. 'көру қабілетім жақсы', 'жақсы көремін', 'қалыпты көремін')
- SET_THEME_DARK (e.g. 'қараңғы тема', 'қараңғы фон', 'тунги режим', 'жарық теманы қараңғыға ауыстыр', 'түсті қарайт', 'қара фон қос')
- SET_THEME_LIGHT (e.g. 'жарық тема', 'күндізгі режим', 'ақ фон', 'қараңғыны жарыққа ауыстыр', 'фонды ағарт', 'ашық түс қос')
- TOGGLE_LARGE_TEXT (e.g. 'үлкен шрифт', 'мәтінді үлкейт', 'кішірейт', 'әріптерді үлкен қыл', 'көзге көрінетіндей үлкейт')
- TOGGLE_CONTRAST (e.g. 'жоғары контраст', 'айқындық', 'түстерді қанық қыл', 'контрастты көтер')
- TOGGLE_AUDIO (e.g. 'озвучканы өшір', 'дыбысты қос', 'оқып беруді тоқтат', 'оқуды қос')

Important Rules:
- If the user asks for "Жарық дүние" / "Жаңа дүние", route them specifically to "/comic/1".
- If the user asks to open any other specific comic, route them to "/tabs/comics" and respond "Комикстер тізімі ашылуда, өзіңізге керектісін осы беттен таңдаңыз".
- If the user asks for a specific action (like "келесі бет" or "көзім көрмейді"), return the "action" key and empty "route" ("").
- Be very flexible and smart handling synonyms and typos in Kazakh. Use semantics, context, and intent. Try to find the closest match even for complex phrases.

Respond ONLY with a JSON object containing three keys:
1. "route" - The matched available route (string). Use "" if none.
2. "action" - The matched action code (string). Use "" if none.
3. "message" - A localized Kazakh message confirming the action (e.g. "Келесі бетке өттік", "Жылдамдық өзгертілді", "Басты бетке өтудеміз"). If both route and action are empty, provide a message like "Кешіріңіз, түсінбедім".`;

    const messages = [
      { role: 'system', content: systemContent }
    ];

    if (userId) {
      const history = chatMemory.get(userId) || [];
      messages.push(...history);
    }

    messages.push({ role: 'user', content: text });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages as any,
      response_format: { type: "json_object" }
    });

    const aiMessage = completion.choices[0].message.content || '{}';
    const result = JSON.parse(aiMessage);

    if (userId) {
      const history = chatMemory.get(userId) || [];
      history.push({ role: 'user', content: text });
      history.push({ role: 'assistant', content: aiMessage });
      if (history.length > 8) history.splice(0, history.length - 8); // keep last 4 pairs
      chatMemory.set(userId, history);
    }

    res.json({
      route: result.route || '',
      action: result.action || '',
      message: result.message || 'Түсініксіз қате'
    });
  } catch (error) {
    console.error('AI Navigation Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
