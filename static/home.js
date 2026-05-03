// async and await allow the function to wait for the API response without blocking the page
// fetches quiz list from Flask endpoint, parses the JSON response into a js array
async function loadQuizzes() {
    try {
        const response = await fetch('/api/quizzes');
        const quizzes = await response.json();
        renderQuizList(quizzes);
    } catch (error) {
        document.getElementById('quiz-list').innerHTML = '<p>Failed to load quizzes.</p>';
    }
}

// renders content within quiz-list div or a fallback message if no quizzes exist
function renderQuizList(quizzes) {
    const container = document.getElementById('quiz-list');

    if (quizzes.length === 0) {
        container.innerHTML = '<p>No quizzes yet.</p>';
        return;
    }

    // .map used - for each quiz in quizzes, transform it to html strings then .join to join them all as one string
    container.innerHTML = quizzes.map(quiz => `
        <div class="quiz-card">
            <h2>${quiz.title}</h2>
            <p>${quiz.description}</p>
            <p>${quiz.question_count} questions</p>
            <a href="/play?id=${quiz.id}">Play</a>
        </div>
    `).join('');
}

loadQuizzes();