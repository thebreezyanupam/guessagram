import { initializeTheme, toggleTheme } from './components/theme.js';

document.addEventListener("DOMContentLoaded", () => {
    initializeTheme();

    let popupOpen = false;

    // DOM Elements
    const themeButton = document.getElementById("theme-button");
    const startButton = document.getElementById("start-button");
    const gameContent = document.getElementById("game-content");
    const wordDisplay = document.getElementById("word-display");
    const hintText = document.getElementById("hint-text");
    const message = document.getElementById("message");
    const newGameButton = document.getElementById("new-game-button");
    const levelDisplay = document.getElementById("level-display");
    const scoreDisplay = document.getElementById("score-display");
    const livesDisplay = document.getElementById("lives-display");
    const buyChanceButton = document.getElementById("buy-chance");
    const buyRevealButton = document.getElementById("buy-reveal");
    const aboutUsLink = document.getElementById("about-us-link");
    const howToPlayButton =document.getElementById("how-to-play-button") ;

    // Game Variables
    let questions = [];
    let currentQuestion = null;
    let guessedLetters = [];
    let hintIndex = 0;
    let isGameActive = false;
    let level = parseInt(localStorage.getItem("level")) || 1;
    let score = parseInt(localStorage.getItem("score")) || 0;
    let lives = parseInt(localStorage.getItem("lives")) || 3;
    let maxGuesses = 5;
    let currentGuesses = maxGuesses;
    let questionIndex = parseInt(localStorage.getItem("questionIndex")) || 0;

    // Event Listeners
    themeButton.addEventListener("click", toggleTheme);
    startButton.addEventListener("click", startGame);
    newGameButton.addEventListener("click", startNewGame);
    document.addEventListener("keydown", handleKeyPress);
    buyChanceButton.addEventListener("click", buyChance);
    buyRevealButton.addEventListener("click", buyReveal);
    aboutUsLink.addEventListener("click", (event) => {
        event.preventDefault();
        showAboutUsPopup();
    });


    howToPlayButton.addEventListener("click", (event) => {
        event.preventDefault();
        showHowToPlayPopup();
    });

    function showHowToPlayPopup() {
        popupOpen = true;
        const popup = document.createElement("div");
        popup.classList.add("popup-overlay");
        const currentTheme = localStorage.getItem("theme") || "blue";
        const themeClass = currentTheme === "orange" ? "dark-theme" : "";

        popup.innerHTML = `
           <div class="popup-content ${themeClass}">
            <h2>How to Play</h2>
            <p>Welcome to Guessagram! Here are the rules:</p>
            <ul class="text-left list-disc list-inside">
                <li>Guess the word one letter at a time. Correct letters will appear in their positions.</li>
                <li>You have a maximum of three hints per word.</li>
                <li>Scoring depends on the number of hints used:
                    <ul class="ml-4 list-disc">
                        <li>Guess with 1st hint: <strong>30 points</strong></li>
                        <li>Guess with 2nd hint: <strong>15 points</strong></li>
                        <li>Guess with 3rd hint: <strong>5 points</strong></li>
                    </ul>
                </li>
                <li>Points can be used in the shop to:
                    <ul class="ml-4 list-disc">
                        <li>Buy extra lives</li>
                        <li>Reveal letters in the word</li>
                    </ul>
                </li>
                <li>If you guess a letter wrong, you’ll lose a life.</li>
            </ul>
            <button id="close-how-to-play-popup">Close</button>
        </div>
        `;

        document.body.appendChild(popup);

        document.getElementById("close-how-to-play-popup").addEventListener("click", () => {
            popupOpen = false;
            popup.remove();
        });
    }

    // Load Questions
    async function loadQuestions() {
        try {
            const response = await fetch("./public/questions.json");
            questions = await response.json();
        } catch (error) {
            console.error("Error loading questions:", error);
            message.textContent = "Failed to load questions. Please try again later.";
        }
    }

    function startGame() {
        if (questions.length === 0) {
            message.textContent = "Loading questions, please wait...";
            loadQuestions();
            return;
        }
        startButton.classList.add("hidden");
        gameContent.classList.remove("hidden");
        startNewGame();
    }

    function startNewGame() {
        if (questionIndex >= questions.length) {
            message.textContent = "Congratulations! You've completed all questions!";
            return;
        }
        currentQuestion = questions[questionIndex];
        guessedLetters = [];
        hintIndex = 0;
        currentGuesses = maxGuesses;
        isGameActive = true;
        updateDisplay();
        hintText.textContent = currentQuestion.hints[hintIndex];
        message.textContent = "Start guessing!";
        newGameButton.classList.add("hidden");
        updateHUD();
    }

    function updateDisplay() {
        wordDisplay.textContent = currentQuestion.word
            .split("")
            .map(letter => (guessedLetters.includes(letter) ? letter : "_"))
            .join(" ");
    }

    function handleKeyPress(event) {
        if (popupOpen || !isGameActive || currentGuesses <= 0) return;
        if (lives <= 0) {
            showNoLivesPopup();
            return;
        }
        const guess = event.key.toUpperCase();
        if (!/^[A-Z]$/.test(guess) || guessedLetters.includes(guess)) return;
        if (currentQuestion.word.includes(guess)) {
            guessedLetters.push(guess);
            updateDisplay();
            checkWinCondition();
        } else {
            if (hintIndex < currentQuestion.hints.length - 1) {
                hintIndex++;
                hintText.textContent = currentQuestion.hints[hintIndex];
            } else {
                endGame(false);
            }
            currentGuesses--;
        }
        saveGameState();
    }

    function endGame(won) {
        if (!won) {
            if (lives > 0) {
                showPopup();
            } else {
                message.textContent = "Game Over! Restarting from the last checkpoint.";
                level = Math.floor((level - 1) / 5) * 5 + 1;
                saveGameState();
                startNewGame();
            }
        }
    }
    function showPopup() {
        popupOpen = true;
        const popup = document.createElement("div");
        popup.classList.add("popup-overlay");
        const currentTheme = localStorage.getItem("theme") || "blue";
        const themeClass = currentTheme === "orange" ? "dark-theme" : "";
    
        popup.innerHTML = `
            <div class="popup-content ${themeClass}">
                <h2><strong>Game Over! You have no hints left.</strong></h2>
                <button id="use-lifeline">Use Lifeline</button>
                <button id="watch-ad">Watch Ad for Extra Life</button>
                <button id="close-popup">Close</button>
            </div>
        `;
    
        document.body.appendChild(popup);
    
        document.getElementById("use-lifeline").addEventListener("click", () => {
            if (lives > 0) {
                lives--;
                updateHUD(); // Update the lives display
                popup.remove();
                popupOpen = false;
                message.textContent = "You've used a lifeline! Try again.";
            } else {
                message.textContent = "You don't have enough lives to use a lifeline.";
            }
        });
    
        document.getElementById("watch-ad").addEventListener("click", () => {
           
            updateHUD();
            popup.remove();
            popupOpen = false;
            message.textContent = "Sorry, No ads as of now.";
        });
    
        document.getElementById("close-popup").addEventListener("click", () => {
            popupOpen = false;
            popup.remove();
            message.textContent = "Game Over! Restarting from the last checkpoint.";
            level = Math.floor((level - 1) / 5) * 5 + 1;
            saveGameState();
            startNewGame();
        });
    }
    
    function showNoLivesPopup() {
        popupOpen = true;
        const popup = document.createElement("div");
        popup.classList.add("popup-overlay");
        const currentTheme = localStorage.getItem("theme") || "blue";
        const themeClass = currentTheme === "orange" ? "dark-theme" : "";
    
        popup.innerHTML = `
            <div class="popup-content ${themeClass}">
                <h2><strong>You do not have enough lives to continue playing.</strong></h2>
                <button id="watch-ad-for-life">Watch Ad to Add a Life</button>
                <button id="buy-life">Buy Life (100 Points)</button>
                <button id="close-no-lives-popup">Close</button>
            </div>
        `;
    
        document.body.appendChild(popup);
    
        document.getElementById("watch-ad-for-life").addEventListener("click", () => {
           // Add one life for watching an ad
            updateHUD();
            message.textContent = "Sorry, No ads as of now!";
            popup.remove();
            popupOpen = false;
        });
    
        document.getElementById("buy-life").addEventListener("click", () => {
            if (score >= 100) {
                lives++;
                score -= 100;
                updateHUD();
                message.textContent = "You've purchased an extra life!";
                popup.remove();
                popupOpen = false;
            } else {
                message.textContent = "Not enough points to buy a life!";
            }
        });
    
        document.getElementById("close-no-lives-popup").addEventListener("click", () => {
            popupOpen = false;
            popup.remove();
            message.textContent = "Game Over! You need more lives to continue.";
        });
    }
    
    function updateHUD() {
        levelDisplay.textContent = level;
        scoreDisplay.textContent = score;
        livesDisplay.textContent = lives;
    }
    
    function showAboutUsPopup() {
        popupOpen = true;
        const popup = document.createElement("div");
        popup.classList.add("popup-overlay");
        const currentTheme = localStorage.getItem("theme") || "blue";
        const themeClass = currentTheme === "orange" ? "dark-theme" : "";
        popup.innerHTML = `
            <div class="popup-content ${themeClass}">
                <h2>About Us</h2>
                <p>Welcome to Guessagram! We're dedicated to bringing fun and challenging word games to players everywhere. Our mission is to help players sharpen their minds, one word at a time.</p>
                <button id="close-about-us-popup">Close</button>
            </div>
        `;
        document.body.appendChild(popup);
        document.getElementById("close-about-us-popup").addEventListener("click", () => {
            popupOpen = false;
            popup.remove();
        });
    }

 

    function checkWinCondition() {
        const wordSolved = currentQuestion.word.split("").every(letter => guessedLetters.includes(letter));
        if (wordSolved) {
            message.textContent = `Congratulations! You've guessed the word: ${currentQuestion.word}`;
            level++;
            if(hintIndex==0){
                score += 30; 
            }
            if(hintIndex==1){
                score +=15;
            }
            else{
                score+=5;
            }
          

            
            saveGameState();
            newGameButton.classList.remove("hidden");
            isGameActive = false;
            questionIndex++;
        }
    }

    function buyChance() {
        if (score >= 200) {
            lives++;
            score -= 200;
            updateHUD();
        } else {
            message.textContent = "Not enough points to buy a life!";
        }
    }

    function buyReveal() {
        if (score >= 150) {
            revealOneLetter();
            score -= 150;
            updateHUD();
        } else {
            message.textContent = "Not enough points to reveal a letter!";
        }
    }

    function revealOneLetter() {
        for (let letter of currentQuestion.word) {
            if (!guessedLetters.includes(letter)) {
                guessedLetters.push(letter);
                break;
            }
        }
        updateDisplay();
    }

    function saveGameState() {
        localStorage.setItem("level", level);
        localStorage.setItem("score", score);
        localStorage.setItem("lives", lives);
        localStorage.setItem("currentQuestion", JSON.stringify(currentQuestion));
        localStorage.setItem("guessedLetters", JSON.stringify(guessedLetters));
        localStorage.setItem("hintIndex", hintIndex);
        localStorage.setItem("isGameActive", isGameActive);
        localStorage.setItem("questionIndex", questionIndex);
    }

    loadQuestions();
});
