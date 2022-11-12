function allowDrop(event) {
    event.preventDefault()
}

function dragEnterInsertionBox(event) {
    event.target.classList.add('insertion-box-extended')
}

function dragLeaveInsertionBox(event) {
    event.target.classList.remove('insertion-box-extended')
}

function dropOnInsertionHandler(event, index) {
    const characterId = event.dataTransfer.getData('charId')
    const poolIndex = event.dataTransfer.getData('poolIndex')

    const character = gameList[characterId]

    sortedListData.splice(index, 0, {
        id: characterId,
        itemName: character.name,
        itemValue: character.value,
        correct: false
    })

    var correctUp = true

    for (let i = index - 1; i >= 0; i--) {
        if (sortedListData[i].correct && +(sortedListData[i].id) > +characterId) {
            correctUp = false
        }
    }

    var correctDown = true

    for (let i = index + 1; i < sortedListData.length; i++) {
        if (sortedListData[i].correct && +(sortedListData[i].id) < +characterId) {
            correctDown = false
        }
    }

    sortedListData[index].correct = correctUp && correctDown

    if (correctUp && correctDown) {
        incrementScore(1)
    }

    unsortedPool.splice(poolIndex, 1)

    saveState[selectedDay].unsortedPool = unsortedPool
    saveState[selectedDay].sortedListData = sortedListData

    localStorage.setItem('saveState', JSON.stringify(saveState))

    document.getElementById('score-counter').innerHTML = `${(sortedListData.length - 1)}/${gameList.length - 1}${sortedListData.length > 1 ? `, davon ${parseInt(score / (sortedListData.length - 1) * 100)}% richtig` : ''}`
    document.getElementById('score-bar-fill').style.setProperty('width', `calc(${parseInt((sortedListData.length - 1) / (gameList.length - 1) * 100)}% - 6px)`)

    renderList(sortedListData)
    renderPool(unsortedPool)

    checkGameEnded()
}

function checkGameEnded() {
    if (saveState[selectedDay]?.completed) {
        showGameEndedPopUp(750)
    } else if (unsortedPool.length == 0) {
        saveState[selectedDay].completed = true
        localStorage.setItem('saveState', JSON.stringify(saveState))
        showGameEndedPopUp(750)
    }
}

function showGameEndedPopUp(delay) {
    setTimeout(() => {
        showPopUp({
            title: 'Liste geschafft',
            content: `
                <div class="popup-text">Sie haben alle Elemente einsortiert.</div>
                <div class="popup-score">${(sortedListData.length - 1)}/${gameList.length - 1}, ${parseInt(score / (sortedListData.length - 1) * 100)}% richtig</div>
                <div class="popup-button" onclick="dismissPopup();openArchive()">Zum Archiv</div>    
            `
        })
    }, delay)
}

function showPopUp(args) {
    document.getElementById('popup-title').innerHTML = args.title
    document.getElementById('popup-content').innerHTML = args.content
    document.getElementById('popup').style.display = 'flex'
    document.getElementById('popup-message').classList.add('popup-slidein')
}

function dismissPopup() {
    document.getElementById('popup').style.display = 'none'
    document.getElementById('popup-message').classList.remove('popup-slidein')
}

function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function startDraggingCharacter(event, characterId, index) {
    event.dataTransfer.setData('charId', characterId)
    event.dataTransfer.setData('poolIndex', index)
}

function incrementScore(amount) {
    score += amount
    saveState[selectedDay].score += amount;
    localStorage.setItem('saveState', JSON.stringify(saveState))
}

function renderList(list) {
    let htmlString = `
    <div 
    class="insertion-box"
    ondrop="dropOnInsertionHandler(event, 0)"
    ondragenter="dragEnterInsertionBox(event)"
    ondragleave="dragLeaveInsertionBox(event)"
    ondragover="allowDrop(event)"></div>
    `

    /*
        if (list[0].correct) {
        htmlString = `
        <div 
            class="insertion-box"
            ondrop="dropOnInsertionHandler(event, 0)"
            ondragenter="dragEnterInsertionBox(event)"
            ondragleave="dragLeaveInsertionBox(event)"
            ondragover="allowDrop(event)"
        ></div>
    `
    }
    list.forEach((element, index) => {
        htmlString += `
        <div class="character character-inserted ${element.correct ? (element.standard ? 'inserted-standard' : '') : 'inserted-wrong'}">
            <div class="character-name">${element.itemName}</div>
            <div class="character-status-box">
                <div class="character-screentime-value">${element.itemValue}</div>
                <div class="character-screentime-status character-screentime-status-${element.standard ? 'standard' : element.correct ? "correct" : "wrong"}">${element.correct ? "✓" : "×"}</div>
            </div>
        </div>
        ${index == sortedListData.length - 1 || sortedListData[index + 1].correct ? `
            <div 
            class="insertion-box"
            ondrop="dropOnInsertionHandler(event, ${index + 1})"
            ondragenter="dragEnterInsertionBox(event)"
            ondragleave="dragLeaveInsertionBox(event)"
            ondragover="allowDrop(event)"
        ></div>` : ``}
        `
    })*/
    list.forEach((element, index) => {
        htmlString += `
        <div class="character character-inserted ${element.correct ? (element.standard ? 'inserted-standard' : '') : 'inserted-wrong'}">
            <div class="character-name">${element.itemName}</div>
            <div class="character-status-box">
                <div class="character-screentime-value">${element.itemValue}</div>
                <div class="character-screentime-status character-screentime-status-${element.standard ? 'standard' : element.correct ? "correct" : "wrong"}">${element.correct ? "✓" : "×"}</div>
            </div>
        </div>
        <div 
        class="insertion-box"
        ondrop="dropOnInsertionHandler(event, ${index + 1})"
        ondragenter="dragEnterInsertionBox(event)"
        ondragleave="dragLeaveInsertionBox(event)"
        ondragover="allowDrop(event)">
            <div class="insertion-hint"></div>
        </div>
        `
    })
    document.getElementById('character-list').innerHTML = htmlString
}

function renderPool(pool) {
    let poolString = ''
    pool.forEach((element, index) => {
        poolString += `
            <div class="character draggable" draggable="true" ondragstart="startDraggingCharacter(event, ${element.id}, ${index})">
                ${element.name}
            </div>
        `
    })
    document.getElementById('unsorted-pool').innerHTML = poolString;
}

var unsortedPool = []

var sortedListData = []

var score = 0

var saveState

var gameList

var selectedDay

function onLoad() {
    startGameForDay(getCurrentDay())
}

function startGameForDay(day) {

    document.getElementById('day-counter').innerHTML = `#${day + 1}`

    saveState = JSON.parse(localStorage.getItem('saveState')) ?? {}
    selectedDay = day

    score = 0
    sortedListData = []
    unsortedPool = []

    $.getJSON('./schedule.json', (schedule) => {
        $.getJSON(`./lists/${schedule.schedule[day].id}.json`, (list) => {
            gameList = list.things
            document.getElementById('movie-title').innerHTML = list.name
            document.getElementById('movie-description').innerHTML = list.description
            if (saveState[day]) {
                unsortedPool = saveState[day].unsortedPool
                sortedListData = saveState[day].sortedListData
                score = saveState[day].score
            } else {
                const standard = list.standard
                gameList.forEach((entry, index) => {
                    if (entry.name == standard) {
                        sortedListData.push({
                            id: index,
                            itemName: entry.name,
                            itemValue: entry.value,
                            correct: true,
                            standard: true
                        })
                    } else {
                        unsortedPool.push({
                            id: index,
                            name: entry.name,
                            value: entry.name
                        })
                    }
                })

                saveState[day] = {
                    unsortedPool: unsortedPool,
                    sortedListData: sortedListData,
                    score: score
                }

                localStorage.setItem("saveState", JSON.stringify(saveState))
            }

            shuffle(unsortedPool)

            renderList(sortedListData)
            renderPool(unsortedPool)
            document.getElementById('score-counter').innerHTML = `${sortedListData.length - 1}/${gameList.length - 1}${sortedListData.length > 1 ? `, davon ${parseInt(score / (sortedListData.length - 1) * 100)}% richtig` : ''}`
            document.getElementById('score-bar-fill').style.setProperty('width', `calc(${parseInt((sortedListData.length - 1) / (gameList.length - 1) * 100)}% - 6px)`)
            checkGameEnded()
        })
    })
}

var titleIndex = 0

function setTitleIndex(index, animated) {
    const prefixes = ['m', 'r', 'w', 'd', 'st', 'tw', 'gl', 'f', 'sp', 'br', 'sm', 'undefined', 'qu', 'z', 'h', 'hypersph']
    titleIndex = index % prefixes.length
    const title = document.getElementById('title')
    const titleString = `${prefixes[titleIndex]}itchlist`
    title.innerHTML = titleString
    document.title = titleString
    if (animated) {
        title.classList.add('spinning')
        title.addEventListener('animationend', (event) => {
            title.classList.remove('spinning')
        })
    }
}

function getCurrentDay() {
    const today = new Date()
    const baseDate = new Date('11/05/2022')
    return Math.floor((today.getTime() - baseDate.getTime()) / 86400000)
}

function openArchive() {
    $.getJSON('./schedule.json', (schedule) => {
        var archiveListHTMLString = ''
        for (let i = getCurrentDay(); i >= 0; i--) {
            const list = schedule.schedule[i]
            const listCompleted = saveState?.[i]?.completed
            archiveListHTMLString += `
                <div class="archive-list-entry" onclick="dismissPopup();startGameForDay(${i})">
                    <div class="archive-list-index">#${i + 1}</div>
                    <div class="archive-list-title">${list.name}</div>
                    <div class="archive-list-status">${listCompleted ?? false ? '✓' : ''}</div>    
                </div>
            `
        }
        showPopUp({
            title: 'Archiv',
            content: `
            <div class="archive-list">${archiveListHTMLString}</div>
        `
        })
    })

}

$(document).ready(() => {
    onLoad()
    setTitleIndex(Math.floor(Math.random() * 13), false)
})