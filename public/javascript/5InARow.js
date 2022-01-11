const log = (text) => {
    const parent = document.querySelector('#events');
    const el = document.createElement('li');
    el.innerHTML = text;
    parent.appendChild(el);
    parent.scrollTop = parent.scrollHeight;
};
const onChatSubmitted = (socket, currentUser) => (e) => {
    e.preventDefault();
    console.log('msg1');
    console.log(currentUser.fullname);
    socket.emit("newMessage", {
        from: currentUser.fullname,
        fromUser:currentUser.username,
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


function scrollToBottom() {
    let messages = document.querySelector('#messages').lastElementChild;
    messages.scrollIntoView();
}



const getBoard = (canvas, numCells = 6) => {
    const ctx = canvas.getContext('2d');
    const cellSize = Math.floor(canvas.width / numCells);

    const fillCell = (x, y, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    };
    const drawGrid = () => {

        ctx.strokeStyle = '#000';
        ctx.beginPath();
        for (let i = 0; i < numCells + 1; i++) {
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, cellSize * numCells);
        }
        for (let i = 0; i < numCells + 1; i++) {
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(cellSize * numCells, i * cellSize);
        }

        ctx.stroke();
    };
    const clear = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    const renderBoard = (board = []) => {
        board.forEach((row, y) => {
            row.forEach((color, x) => {
                color && fillCell(x, y, color);
            })
        })
    };
    const reset = (board) => {
        clear();
        drawGrid();
        renderBoard(board);
    };
    const getCellCoordinates = (x, y) => {
        return {
            x: Math.floor(x / cellSize),
            y: Math.floor(y / cellSize)
        };
    };

    return { fillCell, reset, getCellCoordinates };
};

const getClickCoordinates = (element, event) => {
    const { top, left } = element.getBoundingClientRect();
    const { clientX, clientY } = event;
    return {
        x: clientX - left,
        y: clientY - top
    };
};

const displayUserInfo = (currentUser) => {
    console.log(currentUser.fullname, currentUser.username);
}

const startBtn = document.querySelector('#startGame');
const willShowButton = (isCreator) => {
    if (isCreator) {
        startBtn.classList.remove('hidden')
        isAttacker = true;
        color = 'red';
        myTurn = true;

    } else {
        isAttacker = false;
        color = 'blue';
        myTurn = false;
    }
}

const willBeEnabled = (noOfPlayers) => {
    if (noOfPlayers === 2) {
        console.log(noOfPlayers, 'hellloooo');
        startBtn.disabled = false;
        startBtn.classList.remove('disabled');
    } else {
        console.log(noOfPlayers);
        startBtn.disabled = true;
    }
}


const removeWaitingScreen = () => {
    const waitingScreen = document.querySelector('#waitingScreen');
    waitingScreen.classList.remove('waitingScreen')
    waitingScreen.classList.add('waitingScreenDisabled')
    startBtn.classList.add('hidden')
    if (isAttacker) {
        const ele = document.querySelector('#role_update');
        ele.innerHTML = ' Attacker';
        ele.classList.add('attacker');
    } else {
        const ele = document.querySelector('#role_update');
        ele.innerHTML = ' Defender';
        ele.classList.add('defender');
    }
}

(() => {
    const currentUser = { username: UserUsername, fullname: UserFullname, emial: UserEmail };
    const canvas = document.querySelector('canvas');
    const { fillCell, reset, getCellCoordinates } = getBoard(canvas);
    const socket = io();

    color = 'red';
    myTurn = true;
    socket.on('connect', function () {
        console.log(roomName, password, formDecision);
        if (parseInt(formDecision)) {
            socket.emit('createRoom', { roomName, password, currentUser }, function (err) {
                if (err) {
                    alert(err);
                    window.location.href = '/';
                } else {
                    console.log('No Error');
                }
            })
        }
        else {
            socket.emit('join', { roomName, password, currentUser }, function (err) {
                if (err) {
                    alert(err);
                    window.location.href = '/'
                } else {
                    console.log('No Error')
                }
            })
        }
    })

    socket.on('board', reset);

    const onClick = (e) => {
        const { x, y } = getClickCoordinates(canvas, e);
        socket.emit('turn', { ...getCellCoordinates(x, y), color, myTurn, currentUser });
    }
    canvas.addEventListener('click', onClick);

    socket.on('UserInfo', displayUserInfo);
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
    // socket.on('newMessage', (text) => log(text));
    socket.on('turn', ({ x, y, color }) => {
        fillCell(x, y, color)
        myTurn = !myTurn;
    });
    socket.on('isCreator', willShowButton);
    socket.on('noOfPlayers', willBeEnabled);
    socket.on('removeWaitingScreen', ()=>removeWaitingScreen(currentUser));
    document.querySelector('#chat-form').addEventListener('submit', onChatSubmitted(socket, currentUser));
    socket.on('round2', function () {
        if (color == 'red') {
            isAttacker = false;
            color = 'blue';
            myTurn = false;
            const ele = document.querySelector('#role_update');
            ele.innerHTML = ' Defender';
            ele.classList.add('defender');
            ele.classList.remove('attacker');
        } else {
            isAttacker = true;
            color = 'red';
            myTurn = true;
            const ele = document.querySelector('#role_update');
            ele.innerHTML = ' Attacker';
            ele.classList.add('attacker');
            ele.classList.remove('defender');
        }
        const round = document.getElementById('round_strip');
        round.innerHTML = 'Round 2';
    })
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
    socket.on('Draw', function () {
        const ele = document.querySelector('#draw');
        ele.classList.remove('hidden');
        console.log('Draw');
    })
    socket.on('Win', function () {
        const ele = document.querySelector('#win');
        ele.classList.remove('hidden');
        console.log('Win');
    })
    socket.on('Lose', function () {
        const ele = document.querySelector('#lose');
        ele.classList.remove('hidden');
        console.log('Lose');
    })
    startBtn.addEventListener('click', () => {
        if (!startBtn.disabled) {
            socket.emit('removeWaitingScreen', currentUser);
        }
    })


})();
