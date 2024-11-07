let questions = [];
let currentQuestion;
let guessedLetters = [];
let hintIndex = 0;
let isDarkTheme = false;
let isGameActive = false; // Flag to check if game is active

// Elements for Start and Theme buttons, game content, and displays
const startButton = document.getElementById("start-button");
const themeButton = document.getElementById("theme-button");
const gameContent = document.getElementById("game-content");
const wordDisplay = document.getElementById("word-display");
const hintText = document.getElementById("hint-text");
const message = document.getElementById("message");
const newGameButton = document.getElementById("new-game-button");

// Event Listeners
startButton.addEventListener("click", startGame);
themeButton.addEventListener("click", toggleTheme);
newGameButton.addEventListener("click", startNewGame);
document.addEventListener("keydown", handleKeyPress);

// Load Questions from JSON
async function loadQuestions() {
  try {
    const response = await fetch("questions.json");
    questions = await response.json();
    console.log("Questions loaded:", questions);
  } catch (error) {
    console.error("Error loading questions:", error);
  }
}

function startGame() {
  if (questions.length === 0) {
    message.textContent = "Loading questions, please wait...";
    return;
  }

  startButton.classList.add("hidden");  // Hide the start button
  gameContent.classList.remove("hidden");  // Show the game content section
  startNewGame();  // Start a new game round
}

function toggleTheme() {
  document.body.classList.toggle("dark-theme");
  isDarkTheme = !isDarkTheme;
}

function startNewGame() {
  // Reset game state for a new round
  currentQuestion = getRandomQuestion();
  currentQuestion.word = currentQuestion.word.toUpperCase(); // Ensure uppercase for consistency
  guessedLetters = []; // Clear guessed letters for new word
  hintIndex = 0;
  isGameActive = true; // Set game as active

  console.log("New word to guess:", currentQuestion.word); // Debug log for loaded word

  // Update displays
  updateDisplay();
  hintText.textContent = currentQuestion.hints[hintIndex];
  message.textContent = "";
  newGameButton.classList.add("hidden");  // Hide the New Game button until the round is finished
}

function getRandomQuestion() {
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

function updateDisplay() {
  // Show underscores for unguessed letters and reveal guessed letters
  wordDisplay.textContent = currentQuestion.word
    .split("")
    .map(letter => (guessedLetters.includes(letter) ? letter : "_"))
    .join(" ");
}

function handleKeyPress(event) {
  // Ignore input if the game is not active
  if (!isGameActive) return;

  const guess = event.key.toUpperCase();
  if (!/^[A-Z]$/.test(guess)) return; // Only allow alphabetic characters

  // Check if the letter has already been guessed
  if (guessedLetters.includes(guess)) {
    message.textContent = `${guess} has already been guessed!`;
    console.log(`Ignored: ${guess} was already guessed.`);
    return;
  }

  guessedLetters.push(guess);  // Add guessed letter to guessedLetters
  console.log(`Guessed letters so far: ${guessedLetters}`); // Debug log for guessed letters

  // Check if the guessed letter is in the word
  if (currentQuestion.word.includes(guess)) {
    message.textContent = `Good job! ${guess} is in the word.`;
  } else {
    // Show the next hint if available
    hintIndex = Math.min(hintIndex + 1, currentQuestion.hints.length - 1);
    message.textContent = `Wrong guess! Here's another hint.`;
    hintText.textContent = currentQuestion.hints[hintIndex];
  }

  updateDisplay();
  checkWinCondition();
}

function checkWinCondition() {
  // Check if all letters have been guessed
  const wordSolved = currentQuestion.word
    .split("")
    .every(letter => guessedLetters.includes(letter));

  if (wordSolved) {
    message.textContent = `Congratulations! You've guessed the word: ${currentQuestion.word}`;
    newGameButton.classList.remove("hidden");  // Show the New Game button
    isGameActive = false; // Set game as inactive to stop further input
  }
}

// Load questions from JSON on page load
loadQuestions();
