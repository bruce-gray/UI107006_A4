// state variables to track quiz progress
let quiz = null;
let currentQuestionIndex = 0;
let score = 0;
let answered = false;

// reads the quiz id from the url query parameter
const quizId = new URLSearchParams(window.location.search).get('id');

async function loadQuiz() {
    // if no quiz id in url, display error and stop function
    if (!quizId) {
        document.body.innerHTML = '<p>No quiz selected. <a href="/">Go Back</a></p>';
        return ;
    }

    // fetches the quiz based on the quizId from the URL
    // if not found, throw error which triggers and displays the catch
    try {
        const response = await fetch(`/api/quiz/${quizId}`);

        if (!response.ok) {
            throw new Error('Quiz not found');
        }

        // when quiz loaded, render the title and call showQuestion to display question and answer options
        quiz = await response.json();
        document.getElementById('quiz-title').textContent = quiz.title;
        shuffleQuestions(quiz)
        showQuestion();
    } catch (error) {
        document.body.innerHTML = '<p>Failed to load quiz. <a href="/">Go Back</a></p>';
    }
}

// shuffles the questions for displaying in random order
// uses Fisher-Yates shuffle algorithm
function shuffleQuestions(quiz) {
    const questions = quiz.questions;
    for (let i = questions.length - 1; i > 0; i--) {
        // generate a random index between 0 and i to swap with
        const j = Math.floor(Math.random() * (i + 1));
        // swap current element with the randomly selected element using destructuring assignment
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
}

// handles rendering of individual questions
function showQuestion() {
    const question = quiz.questions[currentQuestionIndex];
    // set answered to false, redundant on first question because of the initial declaration but needed for every subsequent question
    answered = false;

    // renders question progress as Question X/X and question text
    document.getElementById('question-progress').textContent = `Question ${currentQuestionIndex + 1}/${quiz.questions.length}`;
    document.getElementById('question-text').textContent = question.text;

    // for each of the 4 options, renders a button
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = question.options.map((option, index) => `
        <button onclick="submitAnswer(${index})">${option}</button>
    `).join('');

    // reset visibility of feedback and results sections for each new question
    document.getElementById('feedback-area').style.display = 'none';
    document.getElementById('results-section').style.display = 'none';
}

// handles submitting and checking of answers
async function submitAnswer(selectedIndex) {
    // if answered is true, stop
    //  prevents the player from clicking multiple times to send the same answer before a response is received and potentially get extra points
    if (answered) return;
    answered = true;

    // for each button on the page, disable them to prevent multiple clicks whilst waiting for a response
    document.querySelectorAll('#options-container button').forEach(btn => btn.disabled = true);

    const question = quiz.questions[currentQuestionIndex];

    try {
        // POST to send answer to backend via /api/check endpoint for checking
        const response = await fetch('/api/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quiz_id: quizId,
                question_id: question.id,
                selected_index: selectedIndex
            })
        });

        const result = await response.json();
        showFeedback(result);

    } catch (error) {
        document.getElementById('feedback-message').textContent = 'Error checking answer.';
    }
}

// handles displaying feedback
function showFeedback(result) {
    document.getElementById('feedback-area').style.display = 'block';

    // if correct == true, increment score and display 'Correct!'
    if (result.correct) {
        score++;
        document.getElementById('feedback-message').textContent = 'Correct!';
        document.getElementById('correct-answer-msg').textContent = '';
    // if result == false, display 'Incorrect.' and the correct answer
    } else {
        document.getElementById('feedback-message').textContent = 'Incorrect.';
        document.getElementById('correct-answer-msg').textContent = `The correct answer was ${result.correct_answer}`;
    }

    // checks if this question is the final one in the quiz
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
    const nextBtn = document.getElementById('next-btn')

    // if last question, render button to view results
    if (isLastQuestion) {
        nextBtn.textContent = 'See Results';
        nextBtn.onclick = showResults;
    // if not the last question, render button to advance to the next question
    } else {
        nextBtn.textContent = 'Next Question';
        nextBtn.onclick = nextQuestion;
    }
}

// just increments currentQuestionIndex and calls showQuestion() for the next question
function nextQuestion() {
    currentQuestionIndex++;
    showQuestion();
}

// handles showing results when the quiz is finished
// hides the questions section, shows the results section with summary text
function showResults() {
    document.getElementById('quiz-section').style.display = 'none';
    document.getElementById('results-section').style.display = 'block';

    const total = quiz.questions.length;
    document.getElementById('score-display').textContent = `You scored ${score} out of ${total}`;
}

loadQuiz();