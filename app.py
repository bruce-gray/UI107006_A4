from flask import Flask, jsonify, request
import json
import os
import uuid

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

# answer checking
@app.route('/api/check', methods=['POST'])
def check_answer():
    # reads the POST request, if nothing was sent return 400 (bad request)
    data = request.get_json()
    if not data:
        return jsonify({'error:' 'No data received.'}), 400
    
    # pulls fields from POST request and if any missing, return 400
    quiz_id = data.get('quiz_id')
    question_id = data.get('question_id')
    selected_index = data.get('selected_index')

    if quiz_id is None or question_id is None or selected_index is None:
        return jsonify({'error': 'Missing required fields.'}), 400
    
    # find the quiz by quiz_id, return 404 if not exists
    quizzes = load_quizzes()
    quiz = next((q for q in quizzes if q['id'] == quiz_id), None)
    if not quiz:
        return jsonify({'error': 'Quiz not found.'}), 404
    
    # find the specific question from the quiz, if not exists then return 404
    question = next((q for q in quiz['questions'] if q['id'] == question_id), None)
    if not question:
        return jsonify({'error': 'Question not found.'}), 404
    
    # this is input validation checking that sent index is actually an int and if it's within the expected range (0-3). if either are not true, return 400
    if not isinstance(selected_index, int) or not (0 <= selected_index < len(question['options'])):
        return jsonify({'error': 'Invalid answer selection.'}), 400
    
    # the actual answer check that runs if the POST request is valid
    # compares submitted index against correct_index from quizzes.JSON
    correct = selected_index == question['correct_index']
    result = {'correct': correct}

    # correct is always returned, but if correct is false then the actual correct answer is sent too
    if not correct:
        result['correct_answer'] = question['options'][question['correct_index']]

    return jsonify(result)

# serves the quiz creation page from the static folder
@app.route('/create')
def create():
    return app.send_static_file('create.html')

# route for saving quizzes to quizzes.json
@app.route('/api/quiz', methods=['POST'])
def save_quiz():
    data = request.get_json()

    # error handling for bad request
    if not data:
        return jsonify({'error': 'No data received.'}), 400
    
    # store the receieved POST body
    title = data.get('title')
    description = data.get('description')
    questions = data.get('questions')

    # input validation, all fields must be entered
    if not title or not description or not questions:
        return jsonify({'error': 'Missing required fields.'}), 400
    
    quizzes = load_quizzes()
    new_quiz = {
        # uuid is a standard python library for generating unique identifiers
        # uuid4 generates a completely random uuid
        'id': str(uuid.uuid4()),
        'title': title,
        'description': description,
        'questions': questions
    }

    # appends new_quiz to the full list and calls save_quizzes to overwrite old list with new list
    quizzes.append(new_quiz)
    save_quizzes(quizzes)

    # return success confirmation message and 201 (code for Created)
    return jsonify({'success': True, 'id': new_quiz['id']}), 201

# receives the full list of quizzes and writes to quizzes.json
def save_quizzes(quizzes):
    with open(DATA_FILE, 'w') as f:
        json.dump(quizzes, f, indent=4)

# handles finding and deleting a specific quiz when requested
@app.route('/api/quiz/<quiz_id>', methods=['DELETE'])
def delete_quiz(quiz_id):
    quizzes = load_quizzes()
    # for each quiz in quizzes, if the quiz_id received does not match the quiz_id of the quiz, add it to updated. the quiz for deletion is not passed to this new list
    updated = [quiz for quiz in quizzes if quiz['id'] != quiz_id]

    # if the new list len is identical to the old len, it means the quiz was not found
    if len(updated) == len(quizzes):
        return jsonify({'error': 'Quiz not found.'}), 404
    
    save_quizzes(updated)
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)