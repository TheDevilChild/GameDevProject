const onChatSubmitted = (socket, currentUser) => (e) => {
    e.preventDefault();
    socket.emit("newMessage", {
        from: currentUser.fullname,
        fromUser: currentUser.username,
        text: document.querySelector('input[name="message"]').value
    })
    document.querySelector('input[name="message"]').value = '';

};

const createElementHtml = (createdAt, from, text) => {
    const HTMLText = `
        <div class="message__title">
            <h4>${from}</h4>
            <span>${createdAt}</span>
        </div>
        <div class="message__body">
            <p>${text}</p>
        </div>
    `
    return HTMLText;
}


function openModal(modal) {
    console.log(modal);
    if (modal == null) return
    modal.classList.add('active')
    overlay.classList.add('active')
}

function closeModal(modal) {
    if (modal == null) return
    modal.classList.remove('active')
    overlay.classList.remove('active');
}



function scrollToBottom() {
    let messages = document.querySelector('#messages').lastElementChild;
    messages.scrollIntoView();
}

const startBtn = document.querySelector('#startGame');
const willShowButton = (isCreator) => {
    if (isCreator) {
        startBtn.classList.remove('hidden')
    }
}

const willBeEnabled = (noOfPlayers) => {
    if (noOfPlayers === 2) {
        startBtn.disabled = false;
        startBtn.classList.remove('disabled');
    } else {
        startBtn.disabled = true;
    }
}

const removeWaitingScreen = () => {
    const waitingScreen = document.querySelector('#waitingScreen');
    waitingScreen.classList.remove('waitingScreen')
    waitingScreen.classList.add('waitingScreenDisabled')
    startBtn.classList.add('hidden')
}

const isRoundDone = (socket, lockedBids, currentUser, bid_arr) => {
    if (lockedBids == 3) {
        //Round Done Do stuff
        const waitingScreen = document.querySelector('#waitingScreen');
        waitingScreen.innerHTML = 'Waiting For other players to bid';
        waitingScreen.classList.add('waitingScreen');
        waitingScreen.classList.remove('waitingScreenDisabled');
        console.log('Client side', bid_arr);
        socket.emit('myBidData', { currentUser, bid_arr });

    }
}
const openModalButtons = document.querySelectorAll('[data-modal-target]');
const closeModalButtons = document.querySelectorAll('[data-close-button]');
const overlay = document.getElementById('overlay');

(() => {

    const currentUser = { username: UserUsername, fullname: UserFullname, emial: UserEmail };
    const socket = io();
    let lockedBids = 0;

    const bid_btn1 = document.querySelector('#bid1-btn');
    const bid_btn2 = document.querySelector('#bid2-btn');
    const bid_btn3 = document.querySelector('#bid3-btn');
    const bid_arr = new Array(3);

    bid_btn1.addEventListener('click', () => {
        if (!bid_btn1.disabled) {
            const bid_input1 = document.querySelector('#bid1-input');
            if (bid_input1.value) {
                bid_btn1.disabled = true;
                bid_btn1.innerHTML = 'Locked';
                lockedBids++;
                bid_arr[0] = parseInt(bid_input1.value);
                isRoundDone(socket, lockedBids, currentUser, bid_arr);
            }
        }
    })

    bid_btn2.addEventListener('click', () => {
        if (!bid_btn2.disabled) {
            const bid_input2 = document.querySelector('#bid2-input');
            if (bid_input2.value) {
                bid_btn2.disabled = true;
                bid_btn2.innerHTML = 'Locked';
                lockedBids++;
                bid_arr[1] = parseInt(bid_input2.value);
                isRoundDone(socket, lockedBids, currentUser, bid_arr);
            }
        }
    })

    bid_btn3.addEventListener('click', () => {
        if (!bid_btn3.disabled) {
            const bid_input3 = document.querySelector('#bid3-input');
            if (bid_input3.value) {
                bid_btn3.disabled = true;
                bid_btn3.innerHTML = 'Locked';
                lockedBids++;
                bid_arr[2] = parseInt(bid_input3.value);
                isRoundDone(socket, lockedBids, currentUser, bid_arr);
            }
        }

    })

    socket.on('connect', function () {
        console.log(roomName, password, formDecision);
        if (parseInt(formDecision)) {
            socket.emit('createRoom2', { roomName, password, currentUser }, function (err) {
                if (err) {
                    alert(err);
                    window.location.href = '/';
                } else {
                    console.log('No Error');
                }
            })
        }
        else {
            socket.emit('join2', { roomName, password, currentUser }, function (err) {
                if (err) {
                    alert(err);
                    window.location.href = '/'
                } else {
                    console.log('No Error')
                }
            })
        }
    })
    socket.on('newMessage', function (message) {
        console.log('msg3');
        const formattedTime = moment(message.createdAt).format('LT');
        const ele = createElementHtml(formattedTime, message.from, message.text);
        const liEle = document.createElement('li');
        liEle.classList.add('message');
        liEle.innerHTML = ele;
        document.getElementById('messages').appendChild(liEle);
        scrollToBottom();
    });

    socket.on('isCreator', willShowButton);
    socket.on('noOfPlayers', willBeEnabled);
    socket.on('removeWaitingScreen2', () => removeWaitingScreen(currentUser));
    document.querySelector('#chat-form').addEventListener('submit', onChatSubmitted(socket, currentUser));

    socket.on('updateUsersList', function (users) {
        console.log(users, "hi");
        let ol = document.createElement('ol');
        users.forEach(function (user) {
            let li = document.createElement('li');
            li.innerHTML = user;
            ol.appendChild(li);
        })

        let usersList = document.querySelector('#users');
        usersList.innerHTML = "";
        usersList.appendChild(ol);
    })

    startBtn.addEventListener('click', () => {
        if (!startBtn.disabled) {
            socket.emit('removeWaitingScreen2', currentUser);
        }
    })

    socket.on('roundOver', ({ roundResult, nameOfUsers }) => {
        for (let i = 1; i <= 3; i++) {
            const bid_btn = document.querySelector(`#bid${i}-btn`);
            const bid_input = document.querySelector(`#bid${i}-input`);
            bid_input.value = '';
            bid_btn.disabled = false;
            bid_btn.innerHTML = 'Bid';
            lockedBids--;
            bid_arr[i - 1] = 0;
        }
        const waitingScreen = document.querySelector('#waitingScreen');
        waitingScreen.innerHTML = '';
        waitingScreen.classList.remove('waitingScreen');
        waitingScreen.classList.add('waitingScreenDisabled');
        console.log(roundResult)
        // Make a new button to add this rounds result...
        const round_result_btn = document.querySelector(`#roundResultBtn${3 - roundResult.roundsLeft}`);
        round_result_btn.classList.remove('hidden');
        //Change values of the popup modal acc to the data we got from the results
        const filteredArray = roundResult.arr.filter(element => {
            return element.persons.length;
        })
        console.log(filteredArray);
        const roundTable = document.getElementById(`score-${3 - roundResult.roundsLeft}-table`);
        for (let i = 0; i < roundResult.scoresOfRound.length; i++) {
            let template = `
            <tr>
                <td>${nameOfUsers[i]}</td>
                <td>${roundResult.scoresOfRound[i].toFixed(2)}</td>
            </tr>
            `
            roundTable.insertAdjacentHTML('beforeend', template);
        }
        let bids = filteredArray.map(ele => ele.bidValue);
        let frequency = filteredArray.map(ele => ele.persons.length);
        const roundctx = document.getElementById(`round-${3 - roundResult.roundsLeft}-freq`).getContext('2d');
        const roundChart = new Chart(roundctx, {
            type: 'bar',
            data: {
                labels: [...bids],
                datasets: [{
                    label: 'Frequency Table',
                    data: [...frequency],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    })

    socket.on('gameOver', ({ roundResult, nameOfUsers }) => {
        for (let i = 1; i <= 3; i++) {
            const bid_btn = document.querySelector(`#bid${i}-btn`);
            const bid_input = document.querySelector(`#bid${i}-input`);
            bid_input.value = '';
            bid_btn.disabled = false;
            bid_btn.innerHTML = 'Bid';
            lockedBids--;
            bid_arr[i - 1] = 0;
        }
        const waitingScreen = document.querySelector('#waitingScreen');
        waitingScreen.innerHTML = 'Game Over';
        console.log(roundResult)
        // Make a new button to add this rounds result...
        const round_result_btn = document.querySelector(`#roundResultBtn${3 - roundResult.roundsLeft}`);
        const game_over_btn = document.querySelector('#gameResult');
        game_over_btn.classList.remove('hidden');
        round_result_btn.classList.remove('hidden');
        //Change values of the popup modal acc to the data we got from the results
        const filteredArray = roundResult.arr.filter(element => {
            return element.persons.length;
        })
        console.log(filteredArray);
        const roundTable = document.getElementById(`score-${3 - roundResult.roundsLeft}-table`);
        const gameOverTable = document.getElementById('game-over-table')
        for (let i = 0; i < roundResult.scoresOfRound.length; i++) {
            let template = `
            <tr>
                <td>${nameOfUsers[i]}</td>
                <td>${roundResult.scoresOfRound[i].toFixed(2)}</td>
            </tr>
            `
            let temp2 = `
            <tr>
                <td>${nameOfUsers[i]}</td>
                <td>${roundResult.finalScore[i].toFixed(2)}</td>
            </tr>
            `
            roundTable.insertAdjacentHTML('beforeend', template);
        }
        let bids = filteredArray.map(ele => ele.bidValue);
        let frequency = filteredArray.map(ele => ele.persons.length);
        const roundctx = document.getElementById(`round-${3 - roundResult.roundsLeft}-freq`).getContext('2d');
        const gameOverCtx = document.getElementById('game-over-freq').getContext('2d');
        const gameChart = new Chart(gameOverCtx, {
            type: 'pie',
            data: {
                labels: nameOfUsers,
                datasets: [{
                    label: 'Frequency Table',
                    data: roundResult.finalScore,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        })
        const roundChart = new Chart(roundctx, {
            type: 'bar',
            data: {
                labels: [...bids],
                datasets: [{
                    label: 'Frequency Table',
                    data: [...frequency],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });


    })



    openModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = document.querySelector(button.dataset.modalTarget)
            console.log(modal, 'hello');
            openModal(modal)
        })
    })

    overlay.addEventListener('click', () => {
        const modals = document.querySelectorAll('.modal.active')
        modals.forEach(modal => {
            closeModal(modal)
        })
    })

    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal')
            closeModal(modal)
        })
    })

})();

