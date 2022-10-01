var timerMinutes;
var timerSeconds = '';
var startButton = '';
var modeLabel = '';
var changeModeButton;
var pomodoroCounterLabel;
let focusMinutes;
let shortBreakMinutes;
let longBreakMinutes;
let interval;
let timerMode = "stopped";
let timerRunning = false;
let pomodoros = 0;
let timerModeSelection = "focus";

window.onload = function() {
    timerMinutes = document.getElementById('timer_minutes');
    timerSeconds = document.getElementById('timer_seconds');
    startButton = document.getElementById('timer_start');
    modeLabel = document.getElementById('mode_label');
    changeModeButton = document.getElementById('switch_modes');
    pomodoroCounterLabel = document.getElementById('pomodoro_counter');
    if(localStorage.getItem("pomodoro_timer.focusMinutes") == undefined){
        focusMinutes = 30;
        localStorage.setItem("pomodoro_timer.focusMinutes", focusMinutes);
    }
    if(localStorage.getItem("pomodoro_timer.shortBreakMinutes") == undefined){
        shortBreakMinutes = 5;
        localStorage.setItem("pomodoro_timer.shortBreakMinutes", shortBreakMinutes);
    }
    if(localStorage.getItem("pomodoro_timer.longBreakMinutes") == undefined){
        longBreakMinutes = 15;
        localStorage.setItem("pomodoro_timer.longBreakMinutes", longBreakMinutes);
    }
    else{
        focusMinutes = localStorage.getItem("pomodoro_timer.focusMinutes");
        shortBreakMinutes = localStorage.getItem("pomodoro_timer.shortBreakMinutes");
        longBreakMinutes = localStorage.getItem("pomodoro_timer.longBreakMinutes");
        console.log('Loaded localstorage items');
    }
    timerMinutes.textContent = focusMinutes;
    let observer = new MutationObserver((mutations) => {
        if(!timerRunning){
            mutations.forEach((mutation) => {
                saveMinutes();
            });
        }
    });
    var mutations = {
        childList: true,
        subtree: true,
        characterData: true
    }
    observer.observe(timerMinutes, mutations);
}

function selectAll(target) {
    timerMinutes.focus();
    document.execCommand('selectAll', false, null);
}

function changeMode(mode){
    if(mode){
        switch(mode){
            case "focus":
                modeLabel.textContent = "Mode: Focus";
                startButton.innerHTML = "Start focusing!";
                break;
            case "shortb":
                modeLabel.textContent = "Mode: Short break";
                startButton.innerHTML = "Start short break!";
                break;
            case "longb":
                modeLabel.textContent = "Mode: Long break";
                startButton.innerHTML = "Start long break!";
                break;
        }
    }
    else{
        switch(modeLabel.textContent){
            case "Mode: Focus time":
                timerMinutes.textContent = shortBreakMinutes;
                modeLabel.textContent = "Mode: Short break";
                startButton.style.display = "none";
                break;
            case "Mode: Short break":
                timerMinutes.textContent = longBreakMinutes;
                modeLabel.textContent = "Mode: Long break";
                startButton.style.display  = "none";
                break;
            case "Mode: Long break":
                timerMinutes.textContent = focusMinutes;
                modeLabel.textContent = "Mode: Focus time";
                startButton.style.display = "block";
                break;
                }
            }
    }

    function saveMinutes() {
        if(timerMinutes.textContent > 0 && timerMinutes.textContent != "" && ! isNaN(timerMinutes.textContent)){
            switch(modeLabel.textContent){
                case "Mode: Focus time":
                    focusMinutes = timerMinutes.textContent;
                    localStorage.setItem("pomodoro_timer.focusMinutes", focusMinutes);
                    break
                case "Mode: Short break":
                    shortBreakMinutes = timerMinutes.textContent;
                    localStorage.setItem("pomodoro_timer.shortBreakMinutes", shortBreakMinutes);
                    break
                case "Mode: Long break":
                    longBreakMinutes = timerMinutes.textContent;
                    localStorage.setItem("pomodoro_timer.longBreakMinutes", longBreakMinutes);
                    break;
            }
        }
        else{
            console.log("Input is invalid");
        }
}

function updatePomodoros(action, number){
    if(action == "set"){
        pomodoros = number;
    }
    else{
        pomodoros += number;
    }
    pomodoroCounterLabel.textContent = `${pomodoros} 🍅`;
}

function getRemainingTime(endTime) {
    const currentTime = Date.parse(new Date());
    const delta = endTime - currentTime;
    const total = Number.parseInt(delta / 1000, 10);
    if(delta <= 0){
        return 0
    }
    return total;
}

function startTimer(mode, timeInSeconds) {
    changeModeButton.style.display = "none";
    startButton.innerText = "Reset";
    let endTime = Date.parse(new Date()) + timeInSeconds * 1000;
    interval = setInterval(() => {
        timerRunning = true;
        remainingTimeInSeconds = timerMinutes.textContent * 60 + Number.parseInt(timerSeconds.textContent);
        remainingTimeInSeconds = getRemainingTime(endTime);
        let minutes = Number.parseInt((remainingTimeInSeconds / 60) % 60, 10);
        let seconds = Number.parseInt(remainingTimeInSeconds % 60, 10);
        if(seconds <= 9){
            timerMinutes.textContent = minutes;
            timerSeconds.textContent = "0" + seconds;
        }
        else{
            timerMinutes.textContent = minutes;
            timerSeconds.textContent = seconds;
        }
        if (remainingTimeInSeconds <= 0){
            if(mode == "focus"){
                if(pomodoros > 0 && pomodoros % 4 != 0){
                    timerMode = "shortb";
                    changeMode("shortb");
                }
                else{
                    changeMode("longb");
                }
            }
            else if(mode == "shortb"){
                timerMode = "stopped";
                changeMode("focus");
            }
            else if(mode == "longb"){
                timerMode = "stopped";
                changeMode("focus");
            }
            timerRunning = false;
            alarmAudio.play();
            clearInterval(interval);
        }
    }, 1000);
}

function timerHandler() {
    if(!timerRunning){
        switch(timerMode){
            case "stopped":
                if(pomodoros > 0 && pomodoros % 4 == 0){
                    changeMode("longb");
                    startTimer("longb", convertToSeconds(longBreakMinutes));
                }
                else{
                    changeMode("focus");
                    updatePomodoros("add", 1);
                    startTimer("focus", convertToSeconds(focusMinutes));
                }
                break;
            case "focus":
                timerMode = "stopped";
                startButton.innerText = "Start";
                timerMinutes.textContent = focusMinutes;
                timerSeconds.textContent = "00";
                break;
            case "shortb":
                startTimer("shortb", convertToSeconds(shortBreakMinutes));
                break;
            case "longb":
                startTimer("longb", convertToSeconds(longBreakMinutes));
                break;
        }
    }
    else{
        changeModeButton.style.display = "block";
        clearInterval(interval);
        timerRunning = false;
        changeMode("focus");
        timerMode = "stopped";
        startButton.innerText = "Start";
        timerMinutes.textContent = focusMinutes;
        timerSeconds.textContent = "00";
        updatePomodoros("set", 0);
    }
}

function convertToSeconds(timeInMinutes){
    return timeInMinutes * 60;
}