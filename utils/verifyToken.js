const jwt = require('jsonwebtoken')
const authenticate = (request) => {
    try {
        var decoded = jwt.verify(request.headers.token, 'secret');
        request.userId = decoded.id
        return true;
    } catch (err) {
        console.log(err)
        return false;
    }
}

const authenticationMiddleware = (req, res, next) => {
    try {

        var decoded = jwt.verify(req.headers.token, 'secret');
        req.userId = decoded.id;
        next();
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
}

module.exports = { authenticate, authenticationMiddleware };