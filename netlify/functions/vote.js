
const categories = require("../../categories.json");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error("Не настроены переменные Supabase");
    }

    // Проверяем токен авторизации
    const authHeader =
      event.headers.authorization ||
      event.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Сначала войди через почту" })
      };
    }

    const token = authHeader.slice(7);

    const userResponse = await fetch(`${url}/auth/v1/user`, {
      headers: {
        apikey: process.env.SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${token}`
      }
    });

    if (!userResponse.ok) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Сессия недействительна. Войди снова." })
      };
    }

    const user = await userResponse.json();

    if (!user.id || !user.email_confirmed_at) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Подтверди свою почту" })
      };
    }

    // Получаем номинацию и участника
    const { category, nominee } = JSON.parse(event.body || "{}");

    const cat = categories.find(c => c.name === category);

    if (!cat || !cat.nominees.includes(nominee)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Неизвестная номинация или участник" })
      };
    }

    // Записываем голос по настоящему ID аккаунта
    const response = await fetch(`${url}/rest/v1/votes`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        voter_id: user.id,
        category,
        nominee
      })
    });

    if (response.status === 409) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          error: "Ты уже голосовал в этой номинации!"
        })
      };
    }

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
