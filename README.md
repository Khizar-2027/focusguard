# 🛡️ FocusGuard

> Block distractions. Stay in the zone. Get things done.

FocusGuard is a full-stack productivity tool that helps you block distracting websites so you can actually focus. It comes with a **browser extension**, a **React dashboard**, and a **Python backend** — all working together.

---

## ✨ Features

- 🚫 Block distracting websites with one click
- 🌐 Browser extension for real-time blocking
- 📊 Dashboard to manage your blocklist
- ⚙️ Python backend API to store and sync your settings
- 💡 Simple, clean UI — no bloat

---

## 🗂️ Project Structure

```
focusguard/
├── focusguard-extension/   # Chrome/browser extension (JavaScript)
├── focusguard_frontend/    # React dashboard (JavaScript)
└── focusguard_backend/     # REST API (Python)
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Extension | JavaScript, Chrome APIs |
| Frontend | React, JavaScript, CSS |
| Backend | Python |

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/Khizar-2027/focusguard.git
cd focusguard
```

### 2. Run the backend
```bash
cd focusguard_backend
pip install -r requirements.txt
python manage.py runserver
```

### 3. Run the frontend
```bash
cd focusguard_frontend
npm install
npm start
```

### 4. Load the extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer Mode**
3. Click **Load unpacked** and select the `focusguard-extension/` folder

---

## 📸 Screenshots

> *(Add screenshots here)*

---

## 🤝 Contributing

Pull requests are welcome! Feel free to open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT © [Khizar Karge](https://github.com/Khizar-2027)
