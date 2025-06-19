# 🤖 Mon Assistant IA (Angular + Node.js + GPT4All)

Une application web moderne intégrant une interface de **chat intelligent** entre un utilisateur et une IA locale ou en ligne (GPT4All, OpenAI...). Le frontend est développé avec **Angular**, le backend en **Node.js**, et les échanges sont persistés dans une base de données **MySQL**.

---

## 🧠 Fonctionnalités

- ✅ Interface utilisateur stylée avec **Angular Material**
- 💬 Chat avec l’IA en langage naturel
- 📜 Historique des conversations
- 💾 Stockage des messages (prompts + réponses) en base MySQL
- 🔌 Backend extensible avec support GPT4All ou OpenAI API
- ⏳ Affichage d’un **chargeur** pendant que l’IA génère une réponse

---

## 🛠️ Prérequis

- Node.js `v18+`
- Angular CLI `v17+`
- MySQL 8.x
- (Optionnel) Binaire GPT4All pour IA locale

---

## 📁 Structure du projet
mon-assistant-ia/
├── backend/ → Node.js + Express + GPT4All/OpenAI
│ ├── server.js
│ ├── routes/
│ ├── services/
│ └── db.js
├── frontend/ → Angular + Angular Material
│ ├── src/
│ ├── app/
│ └── ...
└── README.md


---

## 🚀 Démarrage rapide

### 1. Lancer le backend

```bash
cd backend
npm install
node server.js
2. Lancer le frontend Angular

cd frontend
npm install
ng serve

Application accessible sur http://localhost:4200

🔧 Configuration .env (Backend)

PORT=3000
OPENAI_API_KEY=sk-xxx (si utilisation de OpenAI)
GPT4ALL_BIN=./gpt4all  # chemin vers le binaire local GPT4All
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=ton_mot_de_passe
DB_NAME=assistantdb

🤔 À venir

    ✅ Gestion utilisateurs + authentification

    🔒 Accès restreint aux logs

    📈 Analyse des conversations (statistiques)

    💡 Suggestions intelligentes dans le code

    📂 Export des conversations

📜 Licence

MIT © [Othniel GNIMASSOU]
