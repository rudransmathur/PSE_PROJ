// Tab switching logic
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tabPanels.forEach(panel => {
      panel.style.display = panel.id === 'tab-' + btn.dataset.tab ? '' : 'none';
    });
  });
});

// Dummy data for question bank, tests, and results
let questionBank = [
  { subject: 'Mathematics', difficulty: 'Easy', question: '2+2=?', options: ['2','3','4','5'], answer: 2 },
];
let tests = [
  { title: 'Grand Test', subject: 'Mathematics', date: '2025-10-07', duration: 30, questions: 4, difficulty: 'Easy', status: 'draft' }
];
let results = [
  { student: 'John Doe', test: 'Grand Test', score: '3/4', date: '2025-10-07' }
];

// Render functions for each tab
function renderQuestions() {
  const panel = document.getElementById('tab-questions');
  panel.innerHTML = `
    <form id="question-form" class="question-form">
      <h3>Create New Question</h3>
      <p class="form-desc">Add questions to your question bank</p>
      <div class="form-row">
        <div class="form-group">
          <label>Subject</label>
          <input type="text" name="subject" placeholder="Enter subject" required />
        </div>
        <div class="form-group">
          <label>Difficulty</label>
          <select name="difficulty">
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Question</label>
        <input type="text" name="question" placeholder="Enter your question here" required />
      </div>
      <div class="form-group">
        <label>Answer Options</label>
        <input type="text" name="option1" placeholder="Option 1" required />
        <input type="text" name="option2" placeholder="Option 2" required />
        <input type="text" name="option3" placeholder="Option 3" required />
        <input type="text" name="option4" placeholder="Option 4" required />
      </div>
      <div class="form-group">
        <label>Correct Answer</label>
        <div class="radio-group">
          <label><input type="radio" name="answer" value="0" checked /> Option 1</label>
          <label><input type="radio" name="answer" value="1" /> Option 2</label>
          <label><input type="radio" name="answer" value="2" /> Option 3</label>
          <label><input type="radio" name="answer" value="3" /> Option 4</label>
        </div>
      </div>
      <button type="submit" class="add-question-btn">+ Add Question</button>
    </form>
    <div class="question-bank-list">
      <h4>Question Bank</h4>
      <ul>
        ${questionBank.map(q => `<li><b>${q.subject}</b> [${q.difficulty}] - ${q.question}</li>`).join('')}
      </ul>
    </div>
  `;
  document.getElementById('question-form').onsubmit = function(e) {
    e.preventDefault();
    const data = new FormData(this);
    questionBank.push({
      subject: data.get('subject'),
      difficulty: data.get('difficulty'),
      question: data.get('question'),
      options: [data.get('option1'), data.get('option2'), data.get('option3'), data.get('option4')],
      answer: parseInt(data.get('answer'))
    });
    renderQuestions();
  };
}

function renderTests() {
  const panel = document.getElementById('tab-tests');
  panel.innerHTML = `
    <form id="test-form" class="test-form">
      <h3>Generate New Test Paper</h3>
      <p class="form-desc">Create a new test by selecting questions from your question bank</p>
      <div class="form-row">
        <div class="form-group">
          <label>Test Title</label>
          <input type="text" name="title" placeholder="Enter test title" required />
        </div>
        <div class="form-group">
          <label>Subject</label>
          <select name="subject">
            ${[...new Set(questionBank.map(q => q.subject))].map(s => `<option>${s}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Duration (minutes)</label>
          <input type="number" name="duration" value="30" required />
        </div>
        <div class="form-group">
          <label>Total Questions</label>
          <input type="number" name="questions" value="10" required />
        </div>
      </div>
      <div class="form-group">
        <label>Difficulty Levels</label>
        <label><input type="checkbox" name="difficulty" value="Easy" /> Easy</label>
        <label><input type="checkbox" name="difficulty" value="Medium" /> Medium</label>
        <label><input type="checkbox" name="difficulty" value="Hard" /> Hard</label>
      </div>
      <button type="submit" class="generate-test-btn">📄 Generate Test Paper</button>
    </form>
    <div class="generated-tests-list">
      <h4>Generated Test Papers (${tests.length})</h4>
      <ul>
        ${tests.map(t => `<li><b>${t.title}</b> | ${t.subject} | ${t.difficulty} | ${t.questions} questions | <span class="test-status">${t.status}</span></li>`).join('')}
      </ul>
    </div>
  `;
  document.getElementById('test-form').onsubmit = function(e) {
    e.preventDefault();
    const data = new FormData(this);
    tests.push({
      title: data.get('title'),
      subject: data.get('subject'),
      date: new Date().toISOString().slice(0,10),
      duration: data.get('duration'),
      questions: data.get('questions'),
      difficulty: Array.from(this.querySelectorAll('input[name="difficulty"]:checked')).map(cb => cb.value).join(', '),
      status: 'draft'
    });
    renderTests();
  };
}

function renderResults() {
  const panel = document.getElementById('tab-results');
  panel.innerHTML = `
    <h3>Test Results</h3>
    <div class="results-list">
      <ul>
        ${results.length ? results.map(r => `<li><b>${r.student}</b> - ${r.test} - Score: ${r.score} (${r.date})</li>`).join('') : '<li>No test submissions yet. Students haven\'t taken any tests.</li>'}
      </ul>
    </div>
  `;
}

// Initial render
renderQuestions();
renderTests();
renderResults();
