# Mind - Subway Outlets Map

Interactive web application for visualizing and querying Subway outlets in Kuala Lumpur.

## Features

- 🗺️ Interactive map showing all Subway outlets in KL
- 🎯 5KM radius catchment visualization
- 💬 AI-powered chatbot for outlet queries
- 📱 Responsive design with mobile support
- 🔍 Real-time catchment overlap detection

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: FastAPI
- **Database**: Supabase (PostgreSQL)
- **AI**: HuggingFace
- **Map**: Leaflet
- **Styling**: TailwindCSS + DaisyUI

## Prerequisites

- Node.js (v18+)
- Python (3.11+)
- Git

## Local Development Setup

1. Clone the repository:
```bash
git https://github.com/Averei/mind-subway.git
cd mind
```

2. Set up backend:
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

3. Set up frontend:
```bash
cd frontend
npm install
```

4. Configure environment variables:
- Copy `.env.example` to `.env.local`
- Fill in your Supabase and HuggingFace credentials

5. Start development servers:
```bash
# Backend
cd backend
uvicorn api.main:app --reload

# Frontend (new terminal)
cd frontend
npm run dev
```

## Deployment

### Backend (Render)
1. Connect your GitHub repository
2. Create a new Web Service
3. Configure environment variables
4. Deploy

### Frontend (Render)
1. Create a new Static Site
2. Configure build settings:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

### Environment Variables
Required environment variables for production:
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `HUGGINGFACE_API_KEY`
- `VITE_API_URL`

## Project Structure

```
mind/
├── backend/
│   ├── api/
│   │   ├── routes/
│   │   ├── services/
│   │   └── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── types/
│   └── package.json
└── README.md
```

## API Documentation

### Endpoints
- `GET /api/outlets`: Get all outlets
- `POST /api/chat/query`: Query the chatbot

## License
MIT
