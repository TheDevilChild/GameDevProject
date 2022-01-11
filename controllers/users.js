const User = require('../model/User');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res) => {
    try {
        const { fullname, password, username, profilePic, email } = req.body;
        const user = new User({ fullname, username, profilePic, email });
        const registeredUser = await User.register(user, password);
        console.log('hi');
        req.login(registeredUser, err => {
            if (err) return next(err);
            console.log('hello');
            res.redirect('/');
        })
    } catch (e) {
        res.redirect('/register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
    console.log('login complete');
}

module.exports.logout = (req, res) => {
    req.logout();
    res.redirect('/');
};

