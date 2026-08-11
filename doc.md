# ComixAccess — Docker Dev Ортасы

## Жылдам бастау

```bash
# 1. Репозиторийді клондау / көшіру
# 2. Docker Desktop іске қосу
# 3. Барлығын іске қосу:
docker-compose --profile dev up -d --build
```

Іске қосылғаннан кейін:
- 🌐 **Frontend**: http://localhost:8100
- 🔌 **Backend API**: http://localhost:3333
- 🐘 **PostgreSQL**: localhost:5433

---

## Seed пайдаланушылар

| Логин    | Пароль  | Рөл   |
|----------|---------|-------|
| `torgyn` | `12345` | admin |
| `user1`  | `12345` | user  |

---

## Сервистерді рестарт

```bash
# ── Web (Frontend) ────────────
docker restart comix_web

# ── API (Backend) ─────────────
docker restart comix_api

# ── PostgreSQL ────────────────
docker restart comix_postgres

# ── Барлығын бірден ───────────
docker-compose --profile dev restart
```

---

## Қайта құру (rebuild)

```bash
# Web-ді қайта құру
docker-compose --profile dev up -d --build web

# API-ді қайта құру
docker-compose --profile dev up -d --build api

# Кешсіз толық қайта құру (мәселе болса)
docker-compose --profile dev build --no-cache api
docker-compose --profile dev up -d api
```

---

## Тоқтату

```bash
# Барлығын тоқтату
docker-compose --profile dev down

# Барлығын тоқтату + DB деректерін жою
docker-compose --profile dev down -v
```

---

## Логтар

```bash
# Web логтары (live)
docker logs comix_web -f --tail 50

# API логтары (live)
docker logs comix_api -f --tail 50

# PostgreSQL логтары
docker logs comix_postgres -f --tail 50

# Барлық сервис логтары
docker-compose --profile dev logs -f
```

---

## Статус тексеру

```bash
# Контейнерлер тізімі
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# API health check
curl http://localhost:3333/api/health
```

---

## Дерекқор (PostgreSQL)

```bash
# psql арқылы қосылу
docker exec -it comix_postgres psql -U comix_user -d comix_db

# Пайдаланушылар тізімін көру
docker exec -it comix_postgres psql -U comix_user -d comix_db -c "SELECT id, username, name, role FROM users;"

# DB-ді толық қайта жасау (деректер жойылады!)
docker-compose --profile dev down -v
docker-compose --profile dev up -d --build
```

---

## Порттар кестесі

| Сервис     | Контейнер        | Порт   | Ішкі порт |
|------------|------------------|--------|-----------|
| Frontend   | `comix_web`      | `8100` | `8100`    |
| Backend    | `comix_api`      | `3333` | `3333`    |
| PostgreSQL | `comix_postgres` | `5433` | `5432`    |

> ⚠️ Стандартты порттар (3000, 5432, 80) қолданылмайды — басқа жобалармен қақтығыспау үшін.

---

## ⚠️ Жылдамдық пен Конфигурациялар

### 1. `bcryptjs` парольдер үшін қолданылады
Біз таза JavaScript-те жазылған `bcryptjs` қолданамыз. Native C++ компиляциясы (`python`, `make`, `g++`) қажет емес, сондықтан API build уақыты **5 секундтан аз** уақытты алады!

---

### 2. npm peer dependency конфликті

**Мәселе**: Frontend `npm install` кезінде `@vue/eslint-config-typescript` пен `eslint` арасында peer dependency қақтығысы:
```
ERESOLVE could not resolve dependency
```

**Шешім**: `--legacy-peer-deps` флагымен орнату:
```bash
npm install --legacy-peer-deps
```

> Docker web контейнерінде бұл `Dockerfile.dev`-те орнатылған.

---

### 3. tsconfig.json — `@vue/tsconfig` табылмайды

**Мәселе**: `tsconfig.json` ішіндегі `"extends": "@vue/tsconfig/tsconfig.dom.json"` пакеті орнатылмаған:
```
Cannot find base config file "@vue/tsconfig/tsconfig.dom.json"
```

**Шешім**: `extends` қолданбай, барлық опцияларды тікелей `tsconfig.json`-ға жазу. Қазір дұрыстап жазылған.

---

### 4. TypeScript — `.vue` файлдар табылмайды

**Мәселе**: TypeScript `.vue` файлдарды модуль ретінде танымайды:
```
Cannot find module '../views/LoginPage.vue'
```

**Шешім**: `src/vite-env.d.ts` файлына Vue модуль декларациясын қосу:
```typescript
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
```

---

### 5. NVM — `npm` PATH-те табылмайды

**Мәселе**: NVM (Node Version Manager) орнатылғанда, жаңа терминалда `npm` табылмауы мүмкін:
```
npm : термин 'npm' не распознан
```

**Шешім**: NVM symlink-ті PATH-ке қолмен қосу:
```powershell
$env:Path = "C:\nvm4w\nodejs;$env:Path"
npm install
```

Немесе NVM-ді қайта конфигурациялау:
```powershell
nvm use 20.19.4
```

> ⚡ Docker қолданғанда бұл мәселе жоқ — контейнерде Node.js орнатылған.

---

### 6. Docker Compose `version` ескірген

**Мәселе**: `docker-compose.yml` ішіндегі `version: '3.8'` ескертуі:
```
the attribute "version" is obsolete, it will be ignored
```

**Шешім**: Бұл тек ескерту, қате емес. Елемеу немесе `version` жолын жою.

---

### 7. Vite Docker ішінде — `--host 0.0.0.0` қажет

**Мәселе**: Vite dev server Docker ішінде `localhost`-қа байланады, сырттан қолжетімсіз.

**Шешім**: `Dockerfile.dev`-те `--host 0.0.0.0` қосылған:
```dockerfile
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "8100"]
```

---

### 8. PostgreSQL healthcheck

**Мәселе**: API контейнері PostgreSQL іске қосылмай тұрып коннект жасауға тырысады.

**Шешім**: `docker-compose.yml`-де healthcheck + `depends_on: condition: service_healthy` арқылы дұрыс тәртіп қамтамасыз етілген.

---

## Файл құрылымы

```
comix_project/
├── docker-compose.yml          # Барлық сервистерді іске қосу
├── Dockerfile.dev              # Frontend dev контейнер
├── .dockerignore               # Docker контекстін сүзу
├── .env                        # VITE_API_URL=http://localhost:3333/api
├── doc.md                      # ← Осы файл
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   ├── img/   (1-16.png)       # Комикс суреттері
│   └── sounds/ (2-14.mp3)      # Комикс озвучкасы
├── src/
│   ├── App.vue                 # Тема ауыстыру логикасы
│   ├── main.ts
│   ├── vite-env.d.ts           # Vue модуль декларациясы
│   ├── router/index.ts         # Tabs routing
│   ├── theme/variables.css     # Ionic тема
│   └── views/
│       ├── TabsLayout.vue      # Tab навигация
│       ├── HomePage.vue        # Басты бет
│       ├── ComicsListPage.vue  # Комикстер тізімі
│       ├── ComicReaderPage.vue # Комикс оқу (auto-play)
│       ├── LoginPage.vue       # Кіру (username/email)
│       ├── RegisterPage.vue    # Тіркелу
│       └── ProfilePage.vue     # Профиль + тема switch
└── backend/
    ├── Dockerfile.dev          # Backend dev контейнер
    ├── Dockerfile              # Backend prod контейнер
    ├── .dockerignore           # node_modules сүзу ❗
    ├── .env                    # DB, JWT, CORS
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts            # Express entry + dotenv
        ├── config/
        │   ├── database.ts     # PostgreSQL pool
        │   └── init.sql        # Schema + seed users
        ├── routes/
        │   ├── auth.routes.ts
        │   └── comic.routes.ts
        ├── controllers/
        │   ├── auth.controller.ts
        │   └── comic.controller.ts
        └── middleware/
            └── auth.middleware.ts
```

---

## 🎙️ Дауыстық навигатор командалары (AI Voice Commands)

Жүйеге енгізілген OpenAI негізіндегі дауыстық көмекші мынадай командаларды (қазақша синонимдерімен қоса) түсініп, орындай алады:

### 1. Беттер арасында ауысу (Routing)
- **Комиксті тікелей ашу:** "Жарық дүниені аш", "Жаңа дүние комиксін оқимын", "Жаңа дүниеге кір"
- **Басты бетке өту:** "Басты бетке бар", "Негізгі бет", "Үйге қайт", "Басына қайт"
- **Комикстер тізіміне өту:** "Комикстерді аш", "Комикстер тізімі", "Оқуды баста" (Сонымен қатар нақты бір комиксті сұраса: "Нарутоны аш" да осы бетке апарады).
- **Профильге өту:** "Профильді аш", "Жеке кабинетке кір", "Баптаулар", "Менің парақшам", "Настройка"
- **Логин / Тіркелу:** "Кіру", "Авторизация", "Тіркелу", "Жаңа аккаунт ашу"
- **Админ панелі:** "Админ", "Басқару панелі", "Админка"

### 2. Комикс оқу барысындағы командалар (Reader actions)
Бұл пәрмендер тек комикс ішіне кіргенде дұрыс жұмыс істейді:
- **Беттер ауыстыру:** "Келесі бет", "Ары қарай", "Келесіге өт", "Жалғастыр", "Алдыңғы бет", "Артқа қайт", "Алдындағысына қайт"
- **Оқуды басқару (Авто-ойнату):** "Оқуды баста", "Ойнат", "Тоқтата тұр", "Дауыстап оқы", "Аудионы қос", "Пауза"
- **Оқу жылдамдығы:** "Баяу оқы", "Ақырын", "Қалыпты жылдамдық", "Орташа", "Сәл жылдамырақ", "Тез оқы", "Өте жылдам оқы"
- **Бетбелгі / Экспорт:** "Бетбелгі қой", "Сақтап қой", "Сохранить ет", "Баспаға шығар", "Экспорт", "Брайль", "Жүктеп ал"

### 3. Профиль және Қолжетімділік (Accessibility)
Бұл командаларды кез келген бетте айтып, визуалды баптауларды өзгертуге болады. Қандай формада айтсаңыз да AI түсінуге тырысады (мысалы: "Жарық теманы қараңғыға ауыстыршы"):
- **Мүмкіндік мәртебесі:** 
  - Естуі нашар режимін қосу: "Есту қабілетім нашар", "Саңыраумын", "Құлағым естімейді", "Нашар естимін"
  - Көруі нашар режимін қосу: "Көру қабілетім нашар", "Зағиппын", "Көзім көрмейді", "Нашар көремін"
  - Алып тастау: "Екеуі де жақсы", "Жақсы көремін", "Құлағым жақсы еститін болды"
- **Тақырып (Theme):** "Қараңғы тема қос", "Түсті қарайт", "Жарық тема", "Фонды ағарт", "Қараңғыны жарыққа ауыстыр"
- **Мәтін:** "Үлкен шрифт", "Мәтінді үлкейт", "Кішірейт", "Көзге көрінетіндей үлкейт"
- **Контраст:** "Жоғары контраст", "Айқындық", "Түстерді қанық қыл"
- **Дыбыс:** "Озвучканы өшір", "Оқып беруді тоқтат", "Дыбысты қос"
