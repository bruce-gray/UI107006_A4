from flask import Flask, jsonify
import json
import os

app = Flask(__name__)

# Serve the homepage from the static folder
@app.route('/')
def home():
    return app.send_static_file('index.html')

# Serve the play page from the static folder
@app.route('/play')
def play():
    return app.send_static_file('play.html')

# Path to the quiz data file relative to this file's location
DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'quizzes.json')

# Load all quizzes from the JSON data file and return an empty list if the file doesn't exist
def load_quizzes():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, 'r') as f:
        return json.load(f)
    
# Return a summary list of all quizzes in data file (id, title, description, question count)
@app.route('/api/quizzes')
def get_quizzes():
    quizzes = load_quizzes()
    summary = [
        {
            'id': quiz['id'],
            'title': quiz['title'],
            'description': quiz.get('description', ''),
            'question_count': len(quiz['questions'])
        }
        for quiz in quizzes
    ]
    return jsonify(summary)

# returns a quiz for playing
@app.route('/api/quiz/<quiz_id>')
def get_quiz(quiz_id):
    quizzes = load_quizzes()
    # loops through every quiz, filters to quiz where the id matches then stops
    quiz = next((q for q in quizzes if q['id'] == quiz_id), None)

    if not quiz:
        # return 404 if no quiz matches the id
        return jsonify({'error': 'Quiz not found.'}), 404
    
    # correct_index is stripped from every question before sending it to the frontend to prevent exposure of answers
    safe_questions = [
        {
            'id': question['id'],
            'text': question['text'],
            'options': question['options']
        }
        for question in quiz['questions']
    ]

    return jsonify({
        'id': quiz['id'],
        'title': quiz['title'],
        'questions': safe_questions
    })


if __name__ == '__main__':
    app.run(debug=True)