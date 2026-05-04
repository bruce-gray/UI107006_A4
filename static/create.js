let questionCount = 0;

document.getElementById('add-question-btn').onclick = addQuestion;
document.getElementById('save-quiz-btn').onclick = saveQuiz;

// calls addQuestion immediately so the form always starts with 1 question input
addQuestion();

function addQuestion() {
    const container = document.getElementById('questions-container');
    const index = questionCount;

    // creates a new div inside of questions-container to hold the question inputs
    const block = document.createElement('div');
    block.id = `question-${index}`;

    // renders input fields for text and a dropdown to select the correct answer
    // each option id uses both the question index and the option index to ensure all option entires are unique across the entire form
    block.innerHTML = `
        <p>Question ${index + 1}</p>
        <input type="text" id="question-text-${index}" placeholder="Question text"/>
        <input type="text" id="option-${index}-0" placeholder="Option 1"/>
        <input type="text" id="option-${index}-1" placeholder="Option 2"/>
        <input type="text" id="option-${index}-2" placeholder="Option 3"/>
        <input type="text" id="option-${index}-3" placeholder="Option 4"/>
        <select id="correct-${index}">
            <option value="0">Option 1 is correct</option>
            <option value="1">Option 2 is correct</option>
            <option value="2">Option 3 is correct</option>
            <option value="3">Option 4 is correct</option>
        </select>
    `;

    container.appendChild(block);
    questionCount++;
}

function saveQuiz() {
    const title = document.getElementById('quiz-title').value.trim();
    const description = document.getElementById('quiz-description').value.trim();

    // input validation for empty title/desc fields
    if (!title || !description) {
        document.getElementById('error-message').textContent = 'Title and Description must both be entered.';
        return;
    }

    const questions = [];

    // for each question entered, get all values
    // .value returns it as a string and .trim removes any whitespace accidentally entered
    for (let i = 0; i < questionCount; i++) {
        const text = document.getElementById(`question-text-${i}`).value.trim();
        const options = [
            document.getElementById(`option-${i}-0`).value.trim(),
            document.getElementById(`option-${i}-1`).value.trim(),
            document.getElementById(`option-${i}-2`).value.trim(),
            document.getElementById(`option-${i}-3`).value.trim()
        ];

        // input validation for question text and options, cannot be blank
        // .some returns true if any option is empty
        if (!text || options.some(opt => !opt)) {
                document.getElementById('error-message').textContent = 'All answer options must be entered.';
                return;
            }

        const correctIndex = parseInt(document.getElementById(`correct-${i}`).value);

        questions.push({
            id: `q${i}`,
            text: text,
            options: options,
            correct_index: correctIndex
        });
    }

    // sends POST request to /api/quiz with quiz data where backend performs additional validation before saving
    fetch('/api/quiz', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title, description, questions})
    })
    // parse the request as JSON
    .then(response => response.json())
    // if success, redirect to homepage where the saved quiz should show
    // else show an error
    .then(result => {
        if (result.success) {
            window.location.href = '/';
        } else {
            document.getElementById('error-message').textContent = 'Failed to save quiz.'
        }
    });
}