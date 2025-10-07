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

// Dummy data for available tests and results
let availableTests = [
  { title: 'Grand Test', subject: 'Mathematics', duration: 30, questions: 4, difficulty: 'Hard, Easy', status: 'available' }
];
let studentResults = [
  // Example: { test: 'Grand Test', score: '3/4', date: '2025-10-07' }
];

function renderTakeTests() {
  const panel = document.getElementById('tab-take-tests');
  if (!availableTests.length) {
    panel.innerHTML = `<div class='tab-panel'><p style='text-align:center; color:#888; margin:32px 0;'>You haven't taken any tests yet. Go to "Take Tests" to get started!</p></div>`;
    return;
  }
  panel.innerHTML = `
    <div style="margin: 32px 0 0 0;">
      <h3>Available Tests</h3>
      <p class="form-desc">Select a test to begin</p>
      <div class="student-test-card">
        <div><b>${availableTests[0].title}</b></div>
        <div style="margin: 8px 0;">
          <span class="test-badge">${availableTests[0].subject}</span>
          ${availableTests[0].difficulty.split(',').map(d => `<span class="test-badge">${d.trim()}</span>`).join('')}
        </div>
        <div style="margin-bottom: 8px; color:#444;">
          <span>📄 ${availableTests[0].questions} questions</span> &nbsp; <span>⏰ ${availableTests[0].duration} minutes</span>
        </div>
        <button class="start-test-btn" onclick="startTest()">▶ Start Test</button>
      </div>
    </div>
  `;
}

function renderScores() {
  const panel = document.getElementById('tab-view-scores');
  panel.innerHTML = `
    <div style="margin: 32px 0 0 0;">
      <h3>Your Scores</h3>
      <div class="results-list">
        <ul>
          ${studentResults.length ? studentResults.map(r => `<li><b>${r.test}</b> - Score: ${r.score} (${r.date})</li>`).join('') : '<li>You haven\'t taken any tests yet.</li>'}
        </ul>
      </div>
    </div>
  `;
}

function startTest() {
  // Simulate test completion and add a dummy result
  setTimeout(() => {
    studentResults.push({ test: availableTests[0].title, score: '3/4', date: '2025-10-07' });
    renderScores();
    alert('Test completed! Your score: 3/4');
  }, 500);
}

renderTakeTests();
renderScores();
