const bells = new Audio("./mixkit-final-level-bonus-2061.wav");
const startBtn = document.querySelector(".btn-start");
const pauseBtn = document.querySelector(".btn-pause");
const resetBtn = document.querySelector(".btn-reset");
const session = document.querySelector(".minutes");
const sessionSeconds = document.querySelector(".seconds");

let myInterval;
let state = true; // true = stopped/paused, false = running
let totalSeconds;
let startingSeconds = null;
let sessionAmount;
let sessionAmountSeconds;

const renderTime = () => {
    let minutesLeft = Math.floor(totalSeconds / 60);
    let secondsLeft = totalSeconds % 60;
    session.textContent = String(minutesLeft).padStart(2, "0");
    sessionSeconds.textContent = String(secondsLeft).padStart(2, "0");
};

const readInputs = () => {
    const rawMinutes = session.textContent.trim().replace(/\u00a0/g, "");
    const rawSeconds = sessionSeconds.textContent.trim().replace(/\u00a0/g, "");

    sessionAmount = Number.parseInt(rawMinutes, 10);
    sessionAmountSeconds = Number.parseInt(rawSeconds, 10);

    if (Number.isNaN(sessionAmount)) sessionAmount = 25;
    if (Number.isNaN(sessionAmountSeconds)) sessionAmountSeconds = 0;
    if (sessionAmountSeconds > 59) sessionAmountSeconds = 59;

    totalSeconds = (sessionAmount * 60) + sessionAmountSeconds;
    startingSeconds = totalSeconds;

    renderTime();
};

const formatInput = (element) => {
    let val = Number.parseInt(element.textContent.trim(), 10);
    if (Number.isNaN(val)) val = 0;
    element.textContent = String(val).padStart(2, "0");
};

// Reset startingSeconds when user clicks to type new input
const clearSavedStartOnEdit = () => {
    startingSeconds = null;
};

// Start timer on Enter key instead of creating a new line
const handleEnterKey = (e) => {
    if (e.key === "Enter") {
        e.preventDefault(); // Prevents new line
        e.target.blur();    // Triggers formatInput formatting
        appTimer();         // Starts the timer
    }
};

// Restrict inputs to digits only
const handleNumericOnly = (e) => {
    if (e.data && !/^\d+$/.test(e.data)) {
        e.preventDefault();
    }
};

session.addEventListener("beforeinput", handleNumericOnly);
sessionSeconds.addEventListener("beforeinput", handleNumericOnly);
session.addEventListener("blur", () => formatInput(session));
sessionSeconds.addEventListener("blur", () => formatInput(sessionSeconds));
session.addEventListener("focus", clearSavedStartOnEdit);
sessionSeconds.addEventListener("focus", clearSavedStartOnEdit);


const moveCursorToEnd = (e) => {
    const element = e.target;
    
    // Ensure the element has content
    if (!element.childNodes.length) return;

    const range = document.createRange();
    const selection = window.getSelection();

    // Target the internal text node and set range to the very end
    const textNode = element.childNodes[0];
    range.setStart(textNode, textNode.length);
    range.collapse(true); // Collapse range to a single cursor point

    selection.removeAllRanges();
    selection.addRange(range);
};

session.addEventListener("keydown", handleEnterKey);
sessionSeconds.addEventListener("keydown", handleEnterKey);

session.addEventListener("focus", (e) => {
    clearSavedStartOnEdit();
    setTimeout(() => moveCursorToEnd(e), 0);
});

sessionSeconds.addEventListener("focus", (e) => {
    clearSavedStartOnEdit();
    setTimeout(() => moveCursorToEnd(e), 0);
});
const appTimer = () => {
    if (state) {
        // Always clear existing intervals to prevent double-speed bug
        clearInterval(myInterval);

        // Read inputs if fresh start or after user made manual edits
        if (startingSeconds === null || totalSeconds === undefined) {
            readInputs();
        }

        state = false;

        // Lock editing while counting down
        session.contentEditable = "false";
        sessionSeconds.contentEditable = "false";

        const updateSeconds = () => { 
            totalSeconds--;

            renderTime();   

            if (totalSeconds <= 0) {
                bells.play();
                clearInterval(myInterval);
                state = true;
                startingSeconds = null; // Clear saved baseline on finish
                session.contentEditable = "true";
                sessionSeconds.contentEditable = "true";
            }
        };

        myInterval = setInterval(updateSeconds, 1000);
    } else {
        alert("Session has already started.");
    }
};

const appPause = () => {
    clearInterval(myInterval);
    state = true;

    // disallow editing again when paused
    session.contentEditable = "true";
    sessionSeconds.contentEditable = "true";
};

const appReset = () => {
    clearInterval(myInterval);
    state = true;

    // Restore saved baseline duration if available
    if (startingSeconds !== null) {
        totalSeconds = startingSeconds;
        renderTime();
    } else {
        readInputs();
    }

    session.contentEditable = "true";
    sessionSeconds.contentEditable = "true";
};

startBtn.addEventListener("click", appTimer);
pauseBtn.addEventListener("click", appPause);
resetBtn.addEventListener("click", appReset);