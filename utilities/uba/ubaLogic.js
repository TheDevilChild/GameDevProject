class UbaLogic {
    constructor() {
        this.roomMap = new Map();

    }
    newGame(roomName) {
        let noOfPlayers = 2;
        let playersToBid = noOfPlayers;
        let noOfRounds = 3;
        let roundsLeft = noOfRounds;
        const finalScore = new Array(this.noOfPlayers);
        for (let i = 0; i < noOfPlayers; i++) {
            finalScore[i] = 0;
        }
        const arr = new Array(31);
        const average = new Array(noOfPlayers);
        const scoresOfRound = new Array(noOfPlayers);

        for (let i = 0; i < noOfPlayers; i++) {
            average[i] = 0;
            scoresOfRound[i] = 0;
        }
        for (let i = 0; i < 31; i++) {
            arr[i] = {
                bidValue: i,
                persons: []
            };
        }
        let myDictionary = {
            noOfPlayers,
            playersToBid,
            noOfRounds,
            roundsLeft,
            finalScore,
            arr,
            average,
            scoresOfRound
        };
        this.roomMap.set(roomName, myDictionary);
    }

    getRoomData(roomName) {
        return this.roomMap.get(roomName);
    }

    setRoomData(roomName, myDict) {
        this.roomMap.set(roomName, myDict);
    }

    addPlayerBids(roomName, bidArray, index) {
        const myDict = this.roomMap.get(roomName);
        for (let i = 0; i < bidArray.length; i++){
            myDict.arr[parseInt(bidArray[i])].persons.push(index);
            myDict.average[index] += bidArray[i];
        }
        myDict.average[index] /= 3;
        myDict.playersToBid--;
        this.roomMap.set(roomName, myDict); 
    }

    isRoundOver(roomName) {
        const myDict = this.getRoomData(roomName);
        return !myDict.playersToBid;
    }

    roundResult(roomName) {
        const myDict = this.roomMap.get(roomName)
        const filteredArray = myDict.arr.filter(element => {
            return element.persons.length;
        })
        const low = filteredArray.reduce((accumulator, currValue) => {
            // console.log(accumulator, currValue);
            if (accumulator.persons.length > currValue.persons.length) {
                return currValue;
            } else {
                return accumulator;
            }
        })
        const high = filteredArray.reduce((accumulator, currValue) => {
            if (accumulator.persons.length >= currValue.persons.length) {
                return currValue;
            } else {
                return accumulator;
            }
        })
        for (let i = 0; i < low.persons.length; i++) {
            myDict.scoresOfRound[low.persons[i]] += 25000;
        }
        for (let i = 0; i < high.persons.length; i++) {
            myDict.scoresOfRound[high.persons[i]] += 50000;
        }
        for (let i = 0; i < myDict.scoresOfRound.length; i++) {
            if (myDict.scoresOfRound[i] > 0) {
                myDict.scoresOfRound[i] -= 1000 * myDict.average[i];
            }
            myDict.finalScore[i] += myDict.scoresOfRound[i];
        }
        myDict.roundsLeft--;
        const myDict2 = { ...myDict };
        myDict2.playersToBid = myDict2.noOfPlayers;
        myDict2.arr = new Array(31);
        myDict2.scoresOfRound = new Array(myDict2.noOfPlayers);
        myDict2.average = new Array(myDict2.noOfPlayers);
        for (let i = 0; i < myDict2.noOfPlayers; i++) {
            myDict2.average[i] = 0;
            myDict2.scoresOfRound[i] = 0;
        }
        for (let i = 0; i < 31; i++) {
            myDict2.arr[i] = {
                bidValue: i,
                persons: []
            };
        }
        console.log(myDict2);
        this.roomMap.set(roomName, myDict2);
        return myDict;
    }

}

module.exports = { UbaLogic };