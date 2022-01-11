class Rooms{
    constructor() {
        this.rooms = new Map();
        this.roomDetails = new Map();
        this.roomRounds = new Map();
    }
    isValidRoom(roomName) {
        console.log(this.rooms);
        console.log(roomName);
        console.log(this.roomDetails);
        return this.rooms.has(roomName);
    }
    addRoom(params) {
        const { roomName, password } = params;
        this.rooms.set(roomName, 1);
        this.roomDetails.set(roomName, password);
        this.roomRounds.set(roomName, 0);
    }
    validateRoom(roomName, password) {
        console.log(this.roomDetails);
        console.log(roomName, password);
        console.log(this.roomDetails.get(roomName));
        if (password === this.roomDetails.get(roomName)) {
            return true;
        }
        return false;
    }
    addUserInRoom(roomName) {
        this.rooms.set(roomName, this.rooms.get(roomName) + 1);
    }
    playersInRoom(roomName) {
        return this.rooms.get(roomName);
    }
    nextRound(roomName) {
        this.roomRounds.set(roomName, this.roomRounds.get(roomName) + 1);
    }
    getRound(roomName) {
        return this.roomRounds.get(roomName);
    }
}

module.exports = { Rooms };