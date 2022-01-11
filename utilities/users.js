class Users{
    constructor() {
        this.users = [];
    }
    addUser(id, name, room,isCreator) {
        let user = { id, name, room ,isCreator};
        this.users.push(user);
        return user;
    }
    getUserList(room) {
        let users = this.users.filter((user) => user.room == room);
        let namesArray = users.map((user) => user.name);
        return namesArray;
    }
    getUser(id) {
        return this.users.filter((user) => user.id === id)[0];
    }
    removeUser(id) {
        let user = this.getUser(id);
        if (user) {
            this.users = this.users.filter((user) => user.id !== id);
        }
        return user;
    }
    isUserCreator(id) {
        let user = this.getUser(id);
        if (user) {
            return user.isCreator;
        }
        else {
            return false;
        }
    }
    getRoomName(id) {
        let user = this.getUser(id);
        if (user) {
            return user.room;
        }
    }
    getUserIndex(id) {
        const room = this.getRoomName(id);
        let users = this.users.filter((user) => user.room == room);
        let idArray = users.map((user) => user.id);
        for (let i = 0; i < idArray.length; i++){
            if (idArray[i] == id) {
                return i;
            }
        }
        return -1;
    }
}

module.exports = { Users };
