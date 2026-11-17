NC AWARDS — инструкция по запуску

1) Supabase
- В SQL Editor вставь весь файл supabase_schema.sql и нажми Run.
- Project URL и service_role key найди в Project Settings -> API (или API Keys).
- ВАЖНО: service_role key нельзя вставлять в HTML, Discord или отправлять кому-либо.

2) GitHub + Netlify
- Загрузи все файлы и папку netlify в новый GitHub-репозиторий.
- В Netlify выбери Add new site -> Import an existing project и подключи репозиторий.
- Build command оставь пустым; Publish directory: .
- В Site configuration -> Environment variables добавь:
  SUPABASE_URL = URL проекта Supabase
  SUPABASE_SERVICE_ROLE_KEY = service_role key Supabase
  ADMIN_PASSWORD = придуманный тобой пароль администратора
- После добавления переменных запусти повторный deploy.

3) Ссылки
- Участникам: https://ИМЯ-САЙТА.netlify.app/
- Администратору: https://ИМЯ-САЙТА.netlify.app/admin.html

Особенности и ограничения
- Это базовая версия: один голос на номинацию с одного браузера/устройства через локальный идентификатор.
- Это не полноценная проверка Discord-аккаунта: участник может обойти ограничение, очистив данные браузера или используя другое устройство.
- Для строгой защиты от повторного голосования нужна авторизация участников, например через Discord OAuth.
- Пароль администратора проверяется серверной функцией и не хранится в клиентском HTML.
