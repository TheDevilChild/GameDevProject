// const createBoard = (size) => {
//     let board;
//     const clear = () => {
//         board = Array(size).fill().map(() => Array(size).fill(null));
//     }
//     const getBoard = () => board;
//     const makeTurn = (x, y, color) => {
//         board[y][x] = color;
//         if (color == 'red') {
//             return isWinningTurn(x, y);
//         } else {
//             return false;
//         }
//     }
//     const inBound = (x, y) => {
//         return y >= 0 && y < board.length && x >= 0 && x < board.length;
//     }
//     const notOccupied = (x, y) => {
//         if (board[y][x]) {
//             return false;
//         }
//         return true;
//     }
//     const numMatches = (x, y, dx, dy) => {
//         let i = 1;
//         while (inBound(x + 1 * dx, y + i * dy) && board[y + i * dy][x + i * dx] === board[y][x]) {
//             i++;
//         }
//         return i - 1;
//     }


//     const isWinningTurn = (x, y) => {
//         for (let dx = -1; dx < 2; dx++) {
//             for (let dy = -1; dy < 2; dy++) {
//                 if (dx === 0 && dy === 0) {
//                     continue;
//                 }
//                 const count = numMatches(x, y, dx, dy) + numMatches(x, y, -dx, -dy) + 1;
//                 if (count >= 5) {
//                     return true;
//                 }
//             }
//         }
//         return false;
//     }

//     clear();
//     return {
//         clear, getBoard, makeTurn,notOccupied
//     };
// }

class Board{
    constructor() {
        this.boardMap = new Map();
        this.noOfFours = new Map();
    }
    clear(roomName, size) {
        if (this.boardMap.has(roomName)) {
            this.boardMap.delete(roomName);
            this.boardMap.set(roomName, Array(size).fill().map(() => Array(size).fill(null)));
        }
        else {
            this.boardMap.set(roomName, Array(size).fill().map(() => Array(size).fill(null)));
            this.noOfFours.set(roomName, [0, 0]);
        }
    }
    getBoard(roomName) {
        return this.boardMap.get(roomName);
    }
    makeTurn(x, y, color, roomName,roundNumber) {
        let board = this.boardMap.get(roomName);
        board[y][x] = color;
        this.boardMap.set(roomName, board);
        if (color == 'red') {
            return this.isWinningTurn(x, y,roomName,roundNumber);
        } else {
            return false;
        }
    }
    inBound(x, y, roomName) {
        let board = this.boardMap.get(roomName);
        return y >= 0 && y < board.length && x >= 0 && x < board.length;
    }
    notOccupied(x, y, roomName) {
        let board = this.boardMap.get(roomName);
        if (board[y][x]) {
            return false;
        }
        return true;
    }
    numMatches(x, y, dx, dy, roomName) {
        let board = this.boardMap.get(roomName);
        let i = 1;
        while (this.inBound(x + 1 * dx, y + i * dy,roomName) && board[y + i * dy][x + i * dx] === board[y][x]) {
            i++;
        }
        return i - 1;
    }
    isWinningTurn(x, y, roomName,roundNumber) {
        for (let dx = -1; dx < 2; dx++) {
            for (let dy = -1; dy < 2; dy++) {
                if (dx === 0 && dy === 0) {
                    continue;
                }
                const count = this.numMatches(x, y, dx, dy,roomName) + this.numMatches(x, y, -dx, -dy,roomName) + 1;
                if (count >= 5) {
                    return true;
                } else if (count == 4) {
                    let updatedFours = this.noOfFours.get(roomName);
                    updatedFours[roundNumber - 1]++;
                    this.noOfFours.set(roomName, updatedFours);
                }
            }
        }
        return false;
    }
    getFours(roomName) {
        return this.noOfFours.get(roomName);
    }
}
module.exports = { Board };
