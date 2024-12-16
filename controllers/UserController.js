const User = require('.././models/User');

module.exports.register = async (req,res) => {
    try {
        const userCredentials = req.body;
        const user = new User({email : userCredentials.email , username : userCredentials.username});
        const newUser = await User.register(user,userCredentials.password);
        req.login(newUser,(err) => {
            if(err) return next(err);
            req.flash('success','Welcome!');
            res.redirect('/locations');
        })
    } catch(e) {
        req.flash('error',e.message);
        res.redirect('/users/register');
    }
}

module.exports.login = async (req,res) => {
    const redirectUrl = res.locals.returnTo || '/locations';
    req.flash('success',"Welcome Back!");
    res.redirect(redirectUrl); 
}

module.exports.logout = (req,res,next) => {
    req.logout((err) => {
        if(err) return next(err);
    })
    req.flash('success','successfully logged out');
    return res.redirect('/');
}