const { notify } = require("../../routes/userRoutes");

class Data{
    constructor() {
        this.turns = new Map();
    }
    initialiseTurns(roomName) {
        this.turns.set(roomName,[0,0]);
    }
    turnUpdate(roomName, roundNo) {
        let noTurns = this.turns.get(roomName);
        noTurns[roundNo - 1]++;
        this.turns.set(roomName, noTurns);
    }
    getTurns(roomName) {
        return this.turns.get(roomName);
    }
}

module.exports = { Data };
