const express = require('express');
const User = require('./model/User')
const Chat = require('./model/Chat')
const path = require('path');
const ExpressError = require('./utilities/ExpressError')
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const flash = require('connect-flash');
const middleware = require('./middleware')
const Message = require('./model/Message')
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, 'public')));

// / ---> home route
// /game/:id ---> Loading different games
// /game/:id/reviews ---> Game reviews and comments
// /login ---> login
// /register ---> register


mongoose.connect('mongodb://localhost:27017/game-dev-project', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error: "));
db.once("open", () => {
    console.log("Database Connected");
});
app.use(flash());



const sessionConfig = {
    secret: 'thisShouldBeABetterSecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.get('/form1', (req, res) => {
    res.render('joinGameForm1')
})

app.get('/createForm1', (req, res) => {
    res.render('createGameForm1')
})
app.get('/form2', (req, res) => {
    res.render('joinGameForm2')
})

app.get('/createForm2', (req, res) => {
    res.render('createGameForm2')
})

app.get('/api/users/all', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
        console.log(users);
    } catch (err) {
        res.json({ err });
    }
})

app.post('/api/messages', async (req, res) => {
    try {
        const { sender, content, chatId } = req.body;
        let message = new Message({
            content: content,
            chat: chatId,
            sender: sender
        });
        message = await message.save().catch(err => res.status(400).send(err));
        message = await message.populate('sender').catch(err => res.status(400).send(err));
        await Chat.findByIdAndUpdate(chatId, { $push: { chatMessages: message._id } }).catch(err => res.status(400).send(err));
        res.status(200).json(message);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

app.get('/api/users/search', async (req, res) => {
    try {
        console.log(req.query);
        const users = await User.find({ $or: [{ username: { $regex: req.query.query, $options: 'i' } }, { fullname: { $regex: req.query.query, $options: 'i' } }] });
        console.log(users);
        res.json(users);
    } catch (err) {
        res.json(err);
    }
})
app.get('/api/chats/:id1/:id2', async (req, res) => {
    const { id1, id2 } = req.params
    let chat = await Chat.findOne({
        chatMembers: {
            $all: [id1, id2]
        }
    })
        .populate('chatMessages')
        .populate('chatMembers')
        .populate({
            path: 'chatMessages',
            populate: {
                path: 'sender',
                model: 'User'
            }
        })
        .catch(err =>
            res.status(400).json(err)
        );
    if (!chat) {
        chat = new Chat({
            chatMembers: [id1, id2]
        });
        chat = await Chat.create({ chatMembers: [id1, id2] })
            .catch(err => res.send(err));
        chat = await chat.populate('chatMembers')
            .catch(err => {
                res.send(err);
            })
    }
    res.json(chat);
})

app.get('/chats', middleware.isLoggedIn, (req, res) => {
    res.render('chat', { currentUser: req.user });
})
app.get('/api/users/:id/following', async (req, res) => {
    try {
        const users = await User.findById(req.params.id).populate('following');
        res.status(200).json(users.following);
    } catch (err) {
        res.status(500).json({ err });
    }
})

app.get('/users', middleware.isLoggedIn, (req, res) => {
    // const { username, fullname, email } = res.locals.currentUser;
    // const currentUser = { username, fullname, email };
    res.render('users', { currentUser: req.user });
})

app.patch('/api/users/follow', async (req, res) => {
    console.log(req.body);
    const data = req.body;
    if (data.isFollowing) {
        try {
            await User.findByIdAndUpdate(data.userId, { $pull: { following: data.targetUserId } })
            await User.findByIdAndUpdate(data.targetUserId, { $pull: { followers: data.userId } })
            res.sendStatus(200);
        } catch (err) {
            res.status(400).json(err);
        }
    } else {
        try {
            await User.findByIdAndUpdate(data.userId, { $push: { following: data.targetUserId } })
            await User.findByIdAndUpdate(data.targetUserId, { $push: { followers: data.userId } })
            res.sendStatus(200);
        } catch (err) {
            res.status(400).json(err);
        }
    }
})

app.get('/redirectGame', (req, res) => {
    res.render('5InARow')
})

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/', (req, res) => {
    res.render('home');
})

app.get('/games', (req, res) => {
    res.render('gamesLanding');
})

const userRoutes = require('./routes/userRoutes');
app.use('/', userRoutes);

const gamesRoutes = require('./routes/gamesRoutes')
app.use('/', gamesRoutes);


//Socket Work starts here
const http = require('http');
const socketio = require('socket.io');
const createBoard = require('./utilities/5InARow/create-board');

const server = http.createServer(app);
const io = socketio(server);
// const { clear, getBoard, makeTurn, notOccupied } = createBoard(10);

const { generateMessage } = require('./utilities/message');
const { isRealString } = require('./utilities/5InARow/isRealString');
const { Users } = require('./utilities/users');
const { Rooms } = require('./utilities/rooms');
const { Board } = require('./utilities/5InARow/create-board');
const { Data } = require('./utilities/5InARow/Data')
const { UbaLogic } = require('./utilities/uba/ubaLogic');
// const Chat = require('./model/chat');
let users = new Users();
let rooms = new Rooms();
let boards = new Board();
let data = new Data();
let uba = new UbaLogic();
const sizeOfBoard = 6;

io.on('connection', (socket) => {

    //Room Connection
    console.log('A new user just connected');
    socket.on('join', (params, callback) => {
        const { currentUser } = params;
        if (!isRealString(params.roomName) || !isRealString(params.password)) {
            return callback('Room Name and Password are required');
        }
        if (!rooms.isValidRoom(params.roomName)) {
            return callback('Please provide a valid room name')
        }
        if (!rooms.validateRoom(params.roomName, params.password)) {
            return callback('Password Wrong');
        }
        if (rooms.playersInRoom(params.roomName) == 2) {
            return callback('Room Full');
        }
        rooms.addUserInRoom(params.roomName);
        socket.join(params.roomName);
        users.removeUser(currentUser.username);
        users.addUser(currentUser.username, currentUser.fullname, params.roomName, false);
        socket.emit('isCreator', users.isUserCreator(currentUser.username));
        console.log(rooms.playersInRoom(params.roomName));
        console.log(users.getUserList(params.username));
        io.to(params.roomName).emit('noOfPlayers', rooms.playersInRoom(params.roomName));
        io.to(params.roomName).emit('updateUsersList', users.getUserList(params.roomName));
        // socket.emit('newMessage',generateMessage('Admin: ', `Welcome to ${params.roomName}`));
        // socket.broadcast.to(params.roomName).emit('newMessage', generateMessage('Admin','New User Joined'));
        socket.emit('board', boards.getBoard(users.getRoomName(currentUser.username)));

        console.log(users.getUserList(params.roomName));
        console.log(params);
        callback();
    })

    socket.on('createRoom', (params, callback) => {
        const { currentUser } = params;
        if (!isRealString(params.roomName) || !isRealString(params.password)) {
            return callback('Room Name and Password are required');
        }
        rooms.addRoom(params);
        socket.join(params.roomName);
        users.removeUser(currentUser.username);
        users.addUser(currentUser.username, currentUser.fullname, params.roomName, true);
        socket.emit('isCreator', users.isUserCreator(currentUser.username));
        console.log(users.getUserList(params.roomName));
        io.to(params.roomName).emit('updateUsersList', users.getUserList(params.roomName));
        console.log(params);
        boards.clear(params.roomName, sizeOfBoard);
        socket.emit('board', boards.getBoard(users.getRoomName(currentUser.username)));
        data.initialiseTurns(params.roomName);
        // socket.emit('newMessage',generateMessage('Admin: ', `Welcome to ${params.roomName}`));
        // socket.broadcast.to(params.roomName).emit('newMessage', generateMessage('Admin','New User Joined'));
        callback();
    })

    socket.on('removeWaitingScreen', (currentUser) => {
        const roomInUse = users.getRoomName(currentUser.username);
        io.to(roomInUse).emit('removeWaitingScreen');
        rooms.nextRound(roomInUse);
    })


    socket.emit('newMessage', generateMessage('GameMaster', 'You Are Connected'));

    socket.on('newMessage', ({ from, fromUser, text }) => {
        console.log('msg2');
        console.log(from);
        console.log(users.getRoomName(fromUser));
        io.to(users.getRoomName(fromUser)).emit('newMessage', generateMessage(from, text));
        console.log('msg2.2')
    });
    socket.on('turn', ({ x, y, color, myTurn, currentUser }) => {
        let roomName = users.getRoomName(currentUser.username);
        let round = rooms.getRound(roomName);
        if (myTurn) {
            if (boards.notOccupied(x, y, roomName)) {
                if (color === 'red') {
                    data.turnUpdate(roomName, round);
                    const playerWon = boards.makeTurn(x, y, color, roomName, round);
                    io.to(roomName).emit('turn', { x, y, color });
                    // console.log(data.getTurns(roomName)[round - 1]);
                    if (playerWon || data.getTurns(roomName)[round - 1] === 50) {
                        rooms.nextRound(roomName);
                        console.log(rooms.getRound(roomName));
                        if (rooms.getRound(roomName) == 2) {
                            io.to(roomName).emit('round2', 'Now the Attacker Defends');
                            io.to(roomName).emit('newMessage', generateMessage('GameMaster', 'Now the Roles are switched!'))
                            boards.clear(roomName, sizeOfBoard);
                            io.to(roomName).emit('board');
                        } else {
                            const turnNumber = data.getTurns(roomName);
                            const fourNumber = boards.getFours(roomName);
                            if (turnNumber[0] == turnNumber[1]) {
                                if (fourNumber[0] == fourNumber[1]) {
                                    io.to(roomName).emit('Draw');
                                } else if (fourNumber[0] < fourNumber[1]) {
                                    socket.broadcast.to(roomName).emit('Win');
                                    socket.emit('Lose');
                                } else {
                                    socket.broadcast.to(roomName).emit('Lose');
                                    socket.emit('Win');
                                }
                            } else if (turnNumber[0] < turnNumber[1]) {
                                socket.broadcast.to(roomName).emit('Win');
                                socket.emit('Lose');
                            } else {
                                socket.broadcast.to(roomName).emit('Lose');
                                socket.emit('Win');
                            }
                            boards.clear(roomName, sizeOfBoard);

                        }
                    }
                } else {
                    boards.makeTurn(x, y, color, roomName, round);
                    io.to(roomName).emit('turn', { x, y, color });
                }
            }
        }
    });

    //GAME 2 

    socket.on('createRoom2', (params, callback) => {
        const { currentUser } = params;
        if (!isRealString(params.roomName) || !isRealString(params.password)) {
            return callback('Room Name and Password are required');
        }
        rooms.addRoom(params);

        uba.newGame(params.roomName);
        socket.join(params.roomName);
        users.removeUser(currentUser.username);
        users.addUser(currentUser.username, currentUser.fullname, params.roomName, true);
        socket.emit('isCreator', users.isUserCreator(currentUser.username));
        io.to(params.roomName).emit('updateUsersList', users.getUserList(params.roomName));
        callback();
    })


    socket.on('join2', (params, callback) => {
        const { currentUser } = params;
        if (!isRealString(params.roomName) || !isRealString(params.password)) {
            return callback('Room Name and Password are required');
        }
        if (!rooms.isValidRoom(params.roomName)) {
            return callback('Please provide a valid room name')
        }
        if (!rooms.validateRoom(params.roomName, params.password)) {
            return callback('Password Wrong');
        }
        if (rooms.playersInRoom(params.roomName) == 2) {
            return callback('Room Full');
        }
        rooms.addUserInRoom(params.roomName);
        socket.join(params.roomName);
        users.removeUser(currentUser.username);
        users.addUser(currentUser.username, currentUser.fullname, params.roomName, false);
        socket.emit('isCreator', users.isUserCreator(currentUser.username));
        console.log(rooms.playersInRoom(params.roomName));
        console.log(users.getUserList(params.username));
        io.to(params.roomName).emit('noOfPlayers', rooms.playersInRoom(params.roomName));
        io.to(params.roomName).emit('updateUsersList', users.getUserList(params.roomName));

        console.log(users.getUserList(params.roomName));
        console.log(params);
        callback();
    })

    socket.on('removeWaitingScreen2', (currentUser) => {
        const roomInUse = users.getRoomName(currentUser.username);
        io.to(roomInUse).emit('removeWaitingScreen2');
        // rooms.nextRound(roomInUse);
    })

    socket.on('myBidData', (params) => {
        const { currentUser, bid_arr } = params;
        const roomName = users.getRoomName(currentUser.username);
        const userIndex = users.getUserIndex(currentUser.username);
        uba.addPlayerBids(roomName, bid_arr, userIndex);
        console.log('inBidData');
        if (uba.isRoundOver(roomName)) {
            const roundResult = uba.roundResult(roomName);
            if (roundResult.roundsLeft) {
                //Round is over
                let nameOfUsers = users.getUserList(roomName);
                io.to(roomName).emit('roundOver', { roundResult, nameOfUsers });

            } else {
                let nameOfUsers = users.getUserList(roomName);
                io.to(roomName).emit('gameOver', { roundResult, nameOfUsers });
            }
        }
    })

    socket.on('join-chat-room', (chatId) => {
        socket.join(chatId);
    });
    socket.on('message-received', (data) => {
        socket.to(data.chatId).emit('message-received', data.message);
    });

});

server.on('error', (err) => {
    console.log('hello');
    console.error(err);
})

server.listen(3000, () => {
    console.log('server is ready');
})

//Throwing 404 is none of the above routes hit
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404));
})

//Error route
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, Something went wrong';
    res.status(statusCode).render('error', { err });
    console.log(res);
    console.log(err);
})