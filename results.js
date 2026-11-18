exports.handler = async (event) => {
  try {
    const expected = process.env.ADMIN_PASSWORD;

    if (!expected || event.headers["x-admin-password"] !== expected) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Неверный пароль" })
      };
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error("Не найдены переменные Supabase");
    }

    const r = await fetch(
      `${url}/rest/v1/votes?select=category,nominee`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`
        }
      }
    );

    if (!r.ok) {
      throw new Error(`Supabase HTTP ${r.status}: ${await r.text()}`);
    }

    const votes = await r.json();
    const results = {};

    votes.forEach(v => {
      results[v.category] ??= {};
      results[v.category][v.nominee] =
        (results[v.category][v.nominee] || 0) + 1;
    });

    const formatted = {};

    Object.entries(results).forEach(([cat, items]) => {
      formatted[cat] = Object.entries(items)
        .map(([nominee, votes]) => ({ nominee, votes }))
        .sort((a, b) => b.votes - a.votes);
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ results: formatted })
    };

  } catch (e) {
    console.error("RESULTS ERROR:", e);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
