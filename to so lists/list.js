const form = document.getElementById('new-quest-form');
const taskInput = document.getElementById('task-input');
const effortSelect = document.getElementById('effort-select');
const questListContainer = document.getElementById('quest-list-container');

const dateDisplay = document.getElementById('current-date-display');
const dailyCountDisplay = document.getElementById('daily-complete-count');

const levelDisplay = document.getElementById('level-display');
const xpBarFill = document.getElementById('xp-bar-fill');
const xpValueText = document.getElementById('xp-value-text');

const resetButton = document.getElementById('reset-button');
const historyListContainer = document.getElementById('history-list-container');

let tasksArray = [];
let currentLevel = 1;
let currentXP = 0;
let levelHistory = [];

const LEVEL_THRESHOLDS = [10, 25, 50, 85, 130, 180, 240, 310, 400, 500];

const getTodayString = () => new Date().toISOString().split('T')[0];


const checkLevelUp = () => {
    const requiredXP = LEVEL_THRESHOLDS[currentLevel - 1];

    while (currentXP >= requiredXP) {
        currentXP -= requiredXP;
        currentLevel += 1;
        
        const logEntry = {
            level: currentLevel,
            date: new Date().toLocaleDateString('en-US'),
            xpNeeded: requiredXP
        };
        levelHistory.push(logEntry);
        
        console.log(`✨ PROGRESS INCREASED! You reached Level ${currentLevel}!`);

        if (currentLevel > LEVEL_THRESHOLDS.length) {
            break; 
        }
    }
    saveData();
};

const completeTask = (taskId) => {
    const taskIndex = tasksArray.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
        const task = tasksArray[taskIndex];

        if (!task.isCompleted) {
            task.isCompleted = true;
            task.completionDate = getTodayString(); 
            
            currentXP += task.effortXP;
            checkLevelUp();
            saveData();
            renderApp();
        }
    }
};

const saveData = () => {
    localStorage.setItem('questLogTasks', JSON.stringify(tasksArray));
    localStorage.setItem('currentLevel', currentLevel.toString());
    localStorage.setItem('currentXP', currentXP.toString());
    localStorage.setItem('levelHistoryLog', JSON.stringify(levelHistory));
};

const deleteTask = (taskId) => {
    tasksArray = tasksArray.filter(task => task.id !== taskId);
    
    saveData();
    renderApp();
}

const displayCurrentDate = () => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = today.toLocaleDateString('en-US', options);
};

const updateDailyCount = () => {
    const todayString = getTodayString();

    const completedToday = tasksArray.filter(task => 
        task.isCompleted && task.completionDate === todayString
    );

    dailyCountDisplay.textContent = completedToday.length;
};

const renderHistory = () => {
    historyListContainer.innerHTML = '';

    const reversedHistory = [...levelHistory].reverse();

    if (reversedHistory.length === 0) {
        historyListContainer.innerHTML = '<li class="history-item">No progress streak recorded yet.</li>';
        return;
    }

    reversedHistory.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.classList.add('history-item');
        listItem.innerHTML = `
            <span>Progress Grew to <strong>Level ${entry.level}</strong></span>
            <span>on ${entry.date}</span>
        `;
        historyListContainer.appendChild(listItem);
    });
};

const renderApp = () => {
    questListContainer.innerHTML = '';

    tasksArray.forEach(task => {
        const listItem = document.createElement('li');
        listItem.classList.add('quest-item');
        if (task.isCompleted) {
            listItem.classList.add('completed');
        }

        listItem.innerHTML = `
            <input 
                type="checkbox" 
                class="complete-checkbox" 
                ${task.isCompleted ? 'checked' : ''}
                ${task.isCompleted ? 'disabled' : ''} 
            />
            <span class="task-text">${task.text}</span>
            <span class="task-effort-xp">${task.effortXP} XP</span>
            <button class="delete-btn" data-id="${task.id}">Abandon</button>
        `;

        const checkbox = listItem.querySelector('.complete-checkbox');
        if (!task.isCompleted) {
             checkbox.addEventListener('click', () => completeTask(task.id));
        }
       
        const deleteBtn = listItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        questListContainer.appendChild(listItem);
    });

    levelDisplay.textContent = currentLevel;

    const requiredXP = LEVEL_THRESHOLDS[currentLevel - 1] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

    let xpPercentage = (currentXP / requiredXP) * 100;
    if (xpPercentage > 100) xpPercentage = 100;

    xpBarFill.style.width = `${xpPercentage}%`;
    xpValueText.textContent = `${currentXP} / ${requiredXP} XP`;
    
    updateDailyCount();
    renderHistory();
};

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const text = taskInput.value.trim();
    const effortXP = parseInt(effortSelect.value);

    if (text === "") {
        alert("Please enter a mission objective.");
        return;
    }

    const newTask = {
        id: Date.now(),
        text: text,
        isCompleted: false,
        effortXP: effortXP,
        completionDate: null
    };

    tasksArray.push(newTask);

    taskInput.value = '';
    saveData();
    renderApp();
});

const resetProgress = () => {
    const confirmReset = confirm("Are you sure you want to start a new campaign? All current progress will be lost!");
    
    if (confirmReset) {
        tasksArray = [];
        currentLevel = 1;
        currentXP = 0;
        levelHistory = [];

        localStorage.removeItem('questLogTasks');
        localStorage.removeItem('currentLevel');
        localStorage.removeItem('currentXP');
        localStorage.removeItem('levelHistoryLog');

        renderApp();
        console.log("New Campaign started. Progress wiped clean.");
    }
}

resetButton.addEventListener('click', resetProgress);


const loadData = () => {
    const savedTasks = localStorage.getItem('questLogTasks');
    const savedLevel = localStorage.getItem('currentLevel');
    const savedXP = localStorage.getItem('currentXP');
    const savedHistory = localStorage.getItem('levelHistoryLog');

    if (savedTasks) {
        tasksArray = JSON.parse(savedTasks);
    }
    if (savedLevel) {
        currentLevel = parseInt(savedLevel);
    }
    if (savedXP) {
        currentXP = parseInt(savedXP);
    }
    if (savedHistory) {
        levelHistory = JSON.parse(savedHistory);
    }

    displayCurrentDate();
    renderApp();
};

loadData();
