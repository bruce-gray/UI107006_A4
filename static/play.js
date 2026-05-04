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
        showQuestion();
    } catch (error) {
        document.body.innerHTML = '<p>Failed to load quiz. <a href="/">Go Back</a></p>';
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
}

loadQuiz();