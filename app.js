const state = { operation: 'add', range: 10, question: 1, total: 10, correct: 0, attempts: 0, streak: 0, bestStreak: 0, answer: 0, locked: false, sound: true };

const $ = (id) => document.getElementById(id);
const elements = {
  left: $('leftNumber'), right: $('rightNumber'), operator: $('operator'), input: $('answerInput'),
  display: $('answerDisplay'), feedback: $('feedback'), submit: $('submitButton'), progress: $('progressBar'),
  number: $('questionNumber'), correct: $('correctCount'), streak: $('streakCount'), accuracy: $('accuracyCount')
};

function randomNumber(max) { return Math.floor(Math.random() * (max + 1)); }

function createQuestion() {
  let operation = state.operation === 'mixed' ? (Math.random() < 0.5 ? 'add' : 'subtract') : state.operation;
  let left = randomNumber(state.range);
  let right = randomNumber(state.range);
  if (operation === 'add') {
    right = randomNumber(state.range - left);
    state.answer = left + right;
  } else {
    if (right > left) [left, right] = [right, left];
    state.answer = left - right;
  }
  elements.left.textContent = left;
  elements.right.textContent = right;
  elements.operator.textContent = operation === 'add' ? '＋' : '−';
  elements.input.value = '';
  elements.display.textContent = '?';
  elements.display.className = 'answer-box';
  elements.feedback.textContent = '把答案填進格子裡吧';
  elements.feedback.className = 'feedback';
  elements.submit.innerHTML = '確認答案 <span>→</span>';
  state.locked = false;
  elements.input.focus();
  updateDashboard();
}

function updateDashboard() {
  elements.number.textContent = state.question;
  elements.progress.style.width = `${(state.question / state.total) * 100}%`;
  elements.correct.textContent = state.correct;
  elements.streak.textContent = state.bestStreak;
  elements.accuracy.textContent = state.attempts ? `${Math.round(state.correct / state.attempts * 100)}%` : '—';
}

function checkAnswer() {
  if (state.locked) { nextQuestion(); return; }
  if (elements.input.value.trim() === '') {
    elements.feedback.textContent = '別忘了先輸入答案喔！';
    elements.feedback.className = 'feedback error';
    elements.input.focus();
    return;
  }
  const value = Number(elements.input.value);
  state.attempts += 1;
  state.locked = true;
  elements.display.textContent = value;
  elements.display.classList.add('filled');
  if (value === state.answer) {
    state.correct += 1; state.streak += 1; state.bestStreak = Math.max(state.bestStreak, state.streak);
    elements.display.classList.add('correct');
    elements.feedback.textContent = '答對了，太厲害啦！';
    elements.feedback.className = 'feedback success';
    celebrate(); playTone(660);
  } else {
    state.streak = 0;
    elements.display.classList.add('wrong');
    elements.feedback.textContent = `差一點！正確答案是 ${state.answer}`;
    elements.feedback.className = 'feedback error';
    playTone(220);
  }
  elements.submit.innerHTML = state.question === state.total ? '查看結果 <span>→</span>' : '下一題 <span>→</span>';
  updateDashboard();
}

function nextQuestion() {
  if (state.question === 0) {
    resetPractice();
    return;
  }
  if (state.question >= state.total) {
    const message = `完成！你答對 ${state.correct} 題，正確率 ${Math.round(state.correct / state.attempts * 100)}%`;
    elements.feedback.textContent = message;
    elements.feedback.className = 'feedback success';
    elements.submit.textContent = '再練習一次';
    state.question = 0;
    state.locked = true;
    return;
  }
  state.question += 1;
  createQuestion();
}

function resetPractice() {
  Object.assign(state, { question: 1, correct: 0, attempts: 0, streak: 0, bestStreak: 0, locked: false });
  createQuestion();
}

function celebrate() {
  const colors = ['#ff7b66','#f7bf47','#57b8d7','#55bd8b'];
  for (let i = 0; i < 18; i += 1) {
    const bit = document.createElement('i');
    bit.style.left = `${Math.random() * 100}%`; bit.style.background = colors[i % colors.length];
    bit.style.animationDelay = `${Math.random() * .35}s`; $('celebration').appendChild(bit);
    setTimeout(() => bit.remove(), 1700);
  }
}

function playTone(frequency) {
  if (!state.sound) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext(); const oscillator = context.createOscillator(); const gain = context.createGain();
  oscillator.frequency.value = frequency; gain.gain.setValueAtTime(.08, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .18);
  oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .18);
}

$('operationChoice').addEventListener('click', (event) => {
  const button = event.target.closest('button'); if (!button) return;
  [...event.currentTarget.children].forEach((item) => item.classList.toggle('active', item === button));
  state.operation = button.dataset.operation; resetPractice();
});
$('rangeChoice').addEventListener('click', (event) => {
  const button = event.target.closest('button'); if (!button) return;
  [...event.currentTarget.children].forEach((item) => item.classList.toggle('active', item === button));
  state.range = Number(button.dataset.range); resetPractice();
});
$('soundButton').addEventListener('click', (event) => {
  state.sound = !state.sound; event.currentTarget.setAttribute('aria-pressed', state.sound); event.currentTarget.textContent = state.sound ? '♪' : '×';
  event.currentTarget.setAttribute('aria-label', state.sound ? '關閉音效' : '開啟音效');
});
$('resetButton').addEventListener('click', resetPractice);
elements.submit.addEventListener('click', checkAnswer);
elements.input.addEventListener('keydown', (event) => { if (event.key === 'Enter') checkAnswer(); });
elements.input.addEventListener('input', () => {
  if (!state.locked) { elements.display.textContent = elements.input.value || '?'; elements.display.classList.toggle('filled', Boolean(elements.input.value)); }
});

createQuestion();
