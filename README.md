# UI107006_A4
## UI107006 - Assessment 4 - Comprehensive Individual Project

# Quiz App
A quiz application built with Python (Flask) and HTML/CSS/JavaScript. Users can create, play and delete multiple choice quizzes. Quiz data is stored persistently in a JSON file.

- **app.py** - Flask application containing all API endpoints and page routes
- **static/index.html** - Homepage displaying available quizzes
- **static/play.html** - Quiz play page
- **static/create.html** - Quiz creation page
- **static/home.js** - Fetches and renders quiz list on homepage
- **static/play.js** - Manages full quiz play flow
- **static/create.js** - Handles dynamic quiz creation form and submission
- **static/style.css** - Shared stylesheet across all pages
- **data/quizzes.json** - Persistent quiz storage

## Requirements
- Python installed https://www.python.org/downloads/
- Flask installed (see below)

## Installing dependencies
```bash
pip install flask
```

## Running the application
Run from the root of the project:
```bash
python app.py
```
The application will be available at `http://127.0.0.1:5000`

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Serves the homepage |
| GET | `/play` | Serves the play page |
| GET | `/create` | Serves the create page |
| GET | `/api/quizzes` | Returns a summary list of all quizzes |
| GET | `/api/quiz/<quiz_id>` | Returns a quiz for playing, correct answers stripped |
| POST | `/api/quiz` | Saves a new quiz to quizzes.json |
| POST | `/api/check` | Checks a submitted answer server-side |
| DELETE | `/api/quiz/<quiz_id>` | Deletes a quiz by ID |