module.exports.game = (req, res) => {
    const { roomName, password, formDecision } = req.body;
    const { username, fullname, email } = res.locals.currentUser;
    const roomAndUserDetails = {roomName,password,formDecision,username,fullname,email,isGame:true}
    res.render('5InARow',  roomAndUserDetails);
}

module.exports.game2 = (req, res) => {
    const { roomName, password, formDecision } = req.body;
    const { username, fullname, email } = res.locals.currentUser;
    const roomAndUserDetails = { roomName, password, formDecision, username, fullname, email,isGame:true };
    res.render('uba',roomAndUserDetails);
}