document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav a');
    const featureCards = document.querySelectorAll('.feature-card');

    function showCard(targetId) {
        featureCards.forEach(card => {
            if (card.id === targetId) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');

            showCard(targetId);
        });
    });

    // Show the clock card by default
    showCard('clock');

    // Clock Feature
    const clockDisplay = document.getElementById('clock-display');
    let showDate = true; // This will be controlled by settings later

    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        let dateString = '';
        if (showDate) {
            dateString = now.toLocaleDateString();
        }
        clockDisplay.innerHTML = `
            <div class="time">${timeString}</div>
            <div class="date">${dateString}</div>
        `;
    }

    setInterval(updateClock, 1000);
    updateClock(); // Initial call

    // Timer Feature
    const timerDisplay = document.getElementById('timer-display');
    const hoursInput = document.getElementById('hours');
    const minutesInput = document.getElementById('minutes');
    const secondsInput = document.getElementById('seconds');
    const startTimerBtn = document.getElementById('start-timer');
    const pauseTimerBtn = document.getElementById('pause-timer');
    const resetTimerBtn = document.getElementById('reset-timer');

    let timerInterval;
    let totalSeconds = 0;
    let isTimerPaused = false;

    function updateTimerDisplay() {
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const s = String(totalSeconds % 60).padStart(2, '0');
        timerDisplay.textContent = `${h}:${m}:${s}`;
    }

    function timerFinished() {
        playSound();
        // Vibration
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]); // Vibrate pattern
        }
        clearInterval(timerInterval);
    }

    startTimerBtn.addEventListener('click', () => {
        if (totalSeconds <= 0) {
            const hours = parseInt(hoursInput.value) || 0;
            const minutes = parseInt(minutesInput.value) || 0;
            const seconds = parseInt(secondsInput.value) || 0;
            totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
        }

        if (totalSeconds > 0 && (timerInterval === undefined || isTimerPaused)) {
            isTimerPaused = false;
            timerInterval = setInterval(() => {
                totalSeconds--;
                updateTimerDisplay();
                if (totalSeconds <= 0) {
                    timerFinished();
                }
            }, 1000);
        }
    });

    pauseTimerBtn.addEventListener('click', () => {
        isTimerPaused = true;
        clearInterval(timerInterval);
    });

    resetTimerBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        timerInterval = undefined;
        isTimerPaused = false;
        totalSeconds = 0;
        hoursInput.value = '';
        minutesInput.value = '';
        secondsInput.value = '';
        updateTimerDisplay();
    });

    // Stopwatch Feature
    const stopwatchDisplay = document.getElementById('stopwatch-display');
    const startStopwatchBtn = document.getElementById('start-stopwatch');
    const pauseStopwatchBtn = document.getElementById('pause-stopwatch');
    const resetStopwatchBtn = document.getElementById('reset-stopwatch');
    const lapStopwatchBtn = document.getElementById('lap-stopwatch');
    const lapsList = document.getElementById('laps-list');

    let stopwatchInterval;
    let stopwatchStartTime;
    let stopwatchElapsedTime = 0;
    let lapCounter = 1;

    function formatTime(ms) {
        const date = new Date(ms);
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');
        return `${minutes}:${seconds}.${milliseconds}`;
    }

    function updateStopwatchDisplay() {
        stopwatchDisplay.textContent = formatTime(stopwatchElapsedTime);
    }

    function addLap() {
        const lapTime = stopwatchElapsedTime;
        const lapItem = document.createElement('li');
        lapItem.innerHTML = `
            <span>Lap ${lapCounter++}: ${formatTime(lapTime)}</span>
            <input type="text" placeholder="Add a note...">
        `;
        lapsList.appendChild(lapItem);
    }

    startStopwatchBtn.addEventListener('click', () => {
        if (!stopwatchInterval) {
            stopwatchStartTime = Date.now() - stopwatchElapsedTime;
            stopwatchInterval = setInterval(() => {
                stopwatchElapsedTime = Date.now() - stopwatchStartTime;
                updateStopwatchDisplay();
            }, 10);
        }
    });

    pauseStopwatchBtn.addEventListener('click', () => {
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
    });

    resetStopwatchBtn.addEventListener('click', () => {
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
        stopwatchElapsedTime = 0;
        lapCounter = 1;
        updateStopwatchDisplay();
        lapsList.innerHTML = '';
    });

    lapStopwatchBtn.addEventListener('click', () => {
        if (stopwatchInterval) {
            addLap();
        }
    });

    // World Clock Feature
    const timezoneSelect = document.getElementById('timezone-select');
    const addWorldClockBtn = document.getElementById('add-world-clock');
    const worldClockContainer = document.getElementById('world-clock-container');

    const allTimezones = ct.getAllTimezones();
    for (const tz in allTimezones) {
        const option = document.createElement('option');
        option.value = tz;
        option.textContent = tz;
        timezoneSelect.appendChild(option);
    }

    let worldClocks = [];

    function createWorldClock(timezone) {
        const clockEl = document.createElement('div');
        clockEl.classList.add('world-clock-item');
        worldClockContainer.appendChild(clockEl);
        worldClocks.push({ timezone, element: clockEl });
    }

    function updateWorldClocks() {
        worldClocks.forEach(clock => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { timeZone: clock.timezone });
            clock.element.innerHTML = `
                <div class="world-clock-timezone">${clock.timezone}</div>
                <div class="world-clock-time">${timeString}</div>
            `;
        });
    }

    addWorldClockBtn.addEventListener('click', () => {
        const selectedTimezone = timezoneSelect.value;
        if (selectedTimezone && !worldClocks.some(c => c.timezone === selectedTimezone)) {
            createWorldClock(selectedTimezone);
        }
    });

    setInterval(updateWorldClocks, 1000);

    // Alarm Feature
    const alarmTimeInput = document.getElementById('alarm-time');
    const setAlarmBtn = document.getElementById('set-alarm');
    const alarmsList = document.getElementById('alarms-list');

    let alarms = [];

    function checkAlarms() {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        alarms.forEach((alarm, index) => {
            if (alarm.time === currentTime && !alarm.triggered) {
                playSound();
                if (navigator.vibrate) {
                    navigator.vibrate([200, 100, 200]); // Vibrate pattern
                }
                alarm.triggered = true;
            }
        });
    }

    setAlarmBtn.addEventListener('click', () => {
        const time = alarmTimeInput.value;
        if (time) {
            const newAlarm = { time, triggered: false };
            alarms.push(newAlarm);
            renderAlarms();
        }
    });

    function renderAlarms() {
        alarmsList.innerHTML = '';
        alarms.forEach((alarm, index) => {
            const alarmItem = document.createElement('li');
            alarmItem.textContent = alarm.time;
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => {
                alarms.splice(index, 1);
                renderAlarms();
            });
            alarmItem.appendChild(deleteBtn);
            alarmsList.appendChild(alarmItem);
        });
    }

    setInterval(checkAlarms, 1000);

    // Settings Feature
    const appNameInput = document.getElementById('app-name');
    const appLogoInput = document.getElementById('app-logo');
    const dateToggle = document.getElementById('date-toggle');
    const colorThemeSelect = document.getElementById('color-theme');
    const fontSelect = document.getElementById('font-select');
    const alarmSoundSelect = document.getElementById('alarm-sound');

    appNameInput.addEventListener('input', (e) => {
        document.title = e.target.value;
        document.querySelector('header h1').textContent = e.target.value;
    });

    appLogoInput.addEventListener('input', (e) => {
        const newLogoUrl = e.target.value;
        let favicon = document.querySelector("link[rel*='icon']");
        if (favicon) {
            favicon.href = newLogoUrl;
        } else {
            favicon = document.createElement('link');
            favicon.rel = 'shortcut icon';
            favicon.href = newLogoUrl;
            document.getElementsByTagName('head')[0].appendChild(favicon);
        }
    });

    dateToggle.addEventListener('change', (e) => {
        showDate = e.target.checked;
        updateClock(); // Update immediately
    });

    colorThemeSelect.addEventListener('change', (e) => {
        document.body.className = e.target.value + '-theme';
    });

    fontSelect.addEventListener('change', (e) => {
        document.getElementById('clock-display').style.fontFamily = e.target.value;
    });

    let selectedAlarmSound = 'default';

    function playSound() {
        let soundFile;
        switch (selectedAlarmSound) {
            case 'beep':
                soundFile = 'sounds/beep.wav';
                break;
            case 'chime':
                soundFile = 'sounds/chime.wav';
                break;
            default:
                soundFile = 'sounds/beep.wav'; // Default sound
                break;
        }
        const audio = new Audio(soundFile);
        audio.play();
    }

    alarmSoundSelect.addEventListener('change', (e) => {
        selectedAlarmSound = e.target.value;
    });
});
