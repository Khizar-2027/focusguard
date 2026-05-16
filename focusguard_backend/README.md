# FocusGuard

A full-stack productivity tracker that helps students reduce phone addiction by tracking study time vs distraction time.

## Features
- Manual study/reels/break timer
- Chrome extension that auto-tracks Instagram Reels, YouTube Shorts
- Pomodoro timer with break reminders
- Streak system
- Squad-based accountability leaderboard
- Subject tracking with exam countdowns
- PWA support

## Tech Stack
- **Backend:** Django, Django REST Framework, MySQL, JWT Auth
- **Frontend:** React, Vite, Zustand
- **Extension:** Chrome Manifest V3

## Setup

### Backend
```bash
cd focusguard_backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Fill in your .env values
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd focusguard_frontend
npm install
npm run dev
```

### Chrome Extension
1. Open `chrome://extensions/`
2. Enable Developer Mode
3. Click Load Unpacked
4. Select the `focusguard-extension` folder