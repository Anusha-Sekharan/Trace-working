# TRACE - AI-Driven Team Formation !

## Project Structure !
- `client/`: React + Vite frontend
- `server/`: FastAPI backend

## How to Run ?

You will need two separate terminal windows.

### 1. Start the Frontend (Client)
```bash
cd client
npm install
npm run dev
```
The application will run at [http://localhost:5173](http://localhost:5173).

### 2. Start the Backend (Server)
```bash
cd server
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```
The API will run at [http://localhost:8000](http://localhost:8000).
ok.
