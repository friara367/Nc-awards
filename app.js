
const SUPABASE_URL = "https://rglhfgwllqhopfwtqeow.supabase.co";
const SUPABASE_KEY = "ВСТАВЬ_СЮДА_СВОЙ_SB_PUBLISHABLE_КЛЮЧ";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const authEl = document.getElementById("auth");
const votingEl = document.getElementById("voting");
const authStatus = document.getElementById("authStatus");
const statusEl = document.getElementById("status");

document.getElementById("loginBtn").onclick = async () => {
  const email = document.getElementById("email").value.trim();

  if (!email) {
    authStatus.textContent = "Введи электронную почту.";
    return;
  }

  authStatus.textContent = "Отправляем ссылку...";

  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin
    }
  });

  authStatus.textContent = error
    ? "Ошибка: " + error.message
    : "Письмо отправлено! Проверь почту.";
};

document.getElementById("logoutBtn").onclick = async () => {
  await supabaseClient.auth.signOut();
  location.reload();
};

async function showVoting(user) {
  authEl.hidden = true;
  votingEl.hidden = false;
  document.getElementById("userEmail").textContent =
    "Ты вошёл как: " + user.email;

  const root = document.getElementById("categories");
  root.innerHTML = "";

  const { data: votes } = await supabaseClient
    .from("votes")
    .select("category")
    .eq("voter_id", user.id);

  const votedCategories = new Set(
    (votes || []).map(v => v.category)
  );

  const response = await fetch("categories.json");
  const categories = await response.json();

  categories.forEach(cat => {
    const card = document.createElement("section");
    card.className = "card";

    const heading = document.createElement("h2");
    heading.textContent = cat.symbol + " " + cat.name;
    card.appendChild(heading);

    cat.nominees.forEach(nominee => {
      const button = document.createElement("button");
      button.className = "crystal";
      button.textContent = "◆ " + nominee;
      button.disabled = votedCategories.has(cat.name);

      button.onclick = async () => {
        button.disabled = true;
        statusEl.textContent = "Отправляем голос...";

        try {
          const { data: { session } } =
            await supabaseClient.auth.getSession();

          const result = await fetch(
            "/.netlify/functions/vote",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + session.access_token
              },
              body: JSON.stringify({
                category: cat.name,
                nominee
              })
            }
          );

          const data = await result.json();

          if (!result.ok) {
            throw new Error(data.error || "Ошибка голосования");
          }

          [...card.querySelectorAll("button")].forEach(b => {
            b.disabled = true;
          });

          statusEl.textContent =
            "Голос принят: " + cat.name + " — " + nominee;
        } catch (error) {
          button.disabled = false;
          statusEl.textContent = error.message;
        }
      };

      card.appendChild(button);
    });

    root.appendChild(card);
  });
}

async function checkUser() {
  const { data: { session } } =
    await supabaseClient.auth.getSession();

  if (session) {
    await showVoting(session.user);
  }
}

supabaseClient.auth.onAuthStateChange(async (event, session) => {
  if (event === "SIGNED_IN" && session) {
    await showVoting(session.user);
  }
});

checkUser();
