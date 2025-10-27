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

// API base - adjust if your backend runs at a different host/port
const API_BASE = 'http://localhost:3001/api';

let questionBank = [];
let tests = [];
let results = [];

// ensure tab panels for tests/results exist (teacher.html only has tab-questions by default)
function ensurePanels() {
  const container = document.querySelector('.tab-content');
  if (!document.getElementById('tab-tests')) {
    const div = document.createElement('div');
    div.className = 'tab-panel';
    div.id = 'tab-tests';
    container.appendChild(div);
  }
  if (!document.getElementById('tab-results')) {
    const div = document.createElement('div');
    div.className = 'tab-panel';
    div.id = 'tab-results';
    container.appendChild(div);
  }
}

async function loadData() {
  try {
    const [qRes, tRes, rRes] = await Promise.all([
      fetch(`${API_BASE}/questions`).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE}/tests`).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE}/results`).then(r => r.ok ? r.json() : []),
    ]);
    questionBank = Array.isArray(qRes) ? qRes : [];
    tests = Array.isArray(tRes) ? tRes : [];
    results = Array.isArray(rRes) ? rRes : [];
  } catch (err) {
    console.warn('Could not load backend data, using empty lists', err);
    questionBank = [];
    tests = [];
    results = [];
  }
}

// Render functions for each tab (now POSTs to backend to persist)
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
        ${questionBank.length ? questionBank.map(q => {
          const subject = q.subject ?? q.subj ?? q.category ?? '';
          const difficulty = q.difficulty ?? q.level ?? '';
          const questionText = q.question ?? q.text ?? q.q ?? '';
          return `<li><b>${subject}</b> [${difficulty}] - ${questionText}</li>`;
        }).join('') : '<li>No questions in the database.</li>'}
      </ul>
    </div>
  `;
  const form = document.getElementById('question-form');
  form.onsubmit = async function(e) {
    e.preventDefault();
    const data = new FormData(this);
    const payload = {
      subject: data.get('subject'),
      difficulty: data.get('difficulty'),
      question: data.get('question'),
      option1: data.get('option1'),
      option2: data.get('option2'),
      option3: data.get('option3'),
      option4: data.get('option4'),
      answer: parseInt(data.get('answer'), 10)
    };
    try {
      const res = await fetch(`${API_BASE}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save question');
      await loadData();
      renderQuestions();
      renderTests();
    } catch (err) {
      console.error(err);
      alert('Could not save question. Check backend and console.');
    }
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
            ${[...new Set(questionBank.map(q => q.subject ?? q.subj ?? ''))].filter(Boolean).map(s => `<option>${s}</option>`).join('')}
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
        ${tests.length ? tests.map(t => {
          const title = t.title ?? t.name ?? '';
          const subject = t.subject ?? '';
          const difficulty = t.difficulty ?? t.level ?? '';
          const questionsCount = t.questions ?? t.total_questions ?? '';
          const status = t.status ?? t.state ?? '';
          return `<li><b>${title}</b> | ${subject} | ${difficulty} | ${questionsCount} questions | <span class="test-status">${status}</span></li>`;
        }).join('') : '<li>No generated tests in the database.</li>'}
      </ul>
    </div>
  `;
  const form = document.getElementById('test-form');
  form.onsubmit = async function(e) {
    e.preventDefault();
    const data = new FormData(this);
    const payload = {
      title: data.get('title'),
      subject: data.get('subject'),
      duration: parseInt(data.get('duration'), 10),
      questions: parseInt(data.get('questions'), 10),
      difficulty: Array.from(this.querySelectorAll('input[name="difficulty"]:checked')).map(cb => cb.value).join(', '),
      status: 'draft'
    };
    try {
      const res = await fetch(`${API_BASE}/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save test');
      await loadData();
      renderTests();
    } catch (err) {
      console.error(err);
      alert('Could not save test. Check backend and console.');
    }
  };
}

function renderResults() {
  const panel = document.getElementById('tab-results');
  panel.innerHTML = `
    <h3>Test Results</h3>
    <div class="results-list">
      <ul>
        ${results.length ? results.map(r => {
          const student = r.student ?? r.name ?? '';
          const testName = r.test ?? r.test_title ?? '';
          const score = r.score ?? r.marks ?? '';
          const date = r.date ?? r.submitted_at ?? '';
          return `<li><b>${student}</b> - ${testName} - Score: ${score} (${date})</li>`;
        }).join('') : "<li>No test submissions yet. Students haven't taken any tests.</li>"}
      </ul>
    </div>
  `;
}

async function init() {
  ensurePanels();
  await loadData();
  renderQuestions();
  renderTests();
  renderResults();
}

init();
