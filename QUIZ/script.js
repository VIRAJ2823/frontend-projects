const homeScreen = document.getElementById("homeScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");
const loader = document.getElementById("loader");
const leaderboardScreen = document.getElementById("leaderboardScreen");

const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");
const backBtn = document.getElementById("backBtn");

const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const scoreEl = document.getElementById("score");
const finalScoreEl = document.getElementById("finalScore");
const questionCounter = document.getElementById("questionCounter");
const leaderboardList = document.getElementById("leaderboardList");

const categorySelect = document.getElementById("category");
const difficultySelect = document.getElementById("difficulty");
const usernameInput = document.getElementById("username");

const shareBtn = document.getElementById("shareBtn");
const themeBtn = document.getElementById("themeBtn");

let questions = [];
let currentQuestion = 0;
let score = 0;

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");

  if(document.body.classList.contains("light")){
    themeBtn.innerHTML = "☀️";
  } else {
    themeBtn.innerHTML = "🌙";
  }
});

startBtn.addEventListener("click", fetchQuestions);

async function fetchQuestions(){

  const category = categorySelect.value;
  const difficulty = difficultySelect.value;

  homeScreen.classList.add("hidden");
  loader.classList.remove("hidden");

  const url = `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`;

  const response = await fetch(url);
  const data = await response.json();

  questions = data.results;

  loader.classList.add("hidden");
  quizScreen.classList.remove("hidden");

  currentQuestion = 0;
  score = 0;

  showQuestion();
}

function showQuestion(){

  nextBtn.classList.add("hidden");

  const q = questions[currentQuestion];

  questionCounter.innerText = `Question ${currentQuestion + 1}/10`;

  questionEl.innerHTML = decodeHTML(q.question);

  scoreEl.innerText = `Score: ${score}`;

  answersEl.innerHTML = "";

  const answers = [...q.incorrect_answers, q.correct_answer];

  answers.sort(() => Math.random() - 0.5);

  answers.forEach(answer => {

    const btn = document.createElement("button");

    btn.classList.add("answer-btn");

    btn.innerHTML = decodeHTML(answer);

    btn.addEventListener("click", () => selectAnswer(btn, q.correct_answer));

    answersEl.appendChild(btn);

  });

}

function selectAnswer(button, correctAnswer){

  const buttons = document.querySelectorAll(".answer-btn");

  buttons.forEach(btn => {

    btn.disabled = true;

    if(btn.innerHTML === decodeHTML(correctAnswer)){
      btn.classList.add("correct");
    }

  });

  if(button.innerHTML === decodeHTML(correctAnswer)){
    score++;
    scoreEl.innerText = `Score: ${score}`;
  } else {
    button.classList.add("wrong");
  }

  nextBtn.classList.remove("hidden");
}

nextBtn.addEventListener("click", () => {

  currentQuestion++;

  if(currentQuestion < questions.length){
    showQuestion();
  } else {
    showResult();
  }

});

function showResult(){

  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  finalScoreEl.innerHTML = `
    ${usernameInput.value || "Player"}, your score is:
    <br><br>
    ${score} / 10
  `;

  saveLeaderboard();

  if(score >= 8){
    confetti({
      particleCount:200,
      spread:100
    });
  }

}

restartBtn.addEventListener("click", () => {

  resultScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");

});

function saveLeaderboard(){

  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

  leaderboard.push({
    name: usernameInput.value || "Player",
    score: score
  });

  leaderboard.sort((a,b) => b.score - a.score);

  localStorage.setItem("leaderboard", JSON.stringify(leaderboard.slice(0,10)));

}

leaderboardBtn.addEventListener("click", showLeaderboard);

function showLeaderboard(){

  homeScreen.classList.add("hidden");
  leaderboardScreen.classList.remove("hidden");

  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

  leaderboardList.innerHTML = "";

  leaderboard.forEach(player => {

    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${player.name}</strong>
      - ${player.score}/10
    `;

    leaderboardList.appendChild(li);

  });

}

backBtn.addEventListener("click", () => {

  leaderboardScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");

});

shareBtn.addEventListener("click", async () => {

  const text = `🎯 I scored ${score}/10 on the Ultimate Quiz App!`;

  if(navigator.share){

    await navigator.share({
      title:"Quiz Score",
      text:text
    });

  } else {

    navigator.clipboard.writeText(text);

    alert("Score copied to clipboard!");

  }

});

function decodeHTML(html){

  const txt = document.createElement("textarea");

  txt.innerHTML = html;

  return txt.value;

}