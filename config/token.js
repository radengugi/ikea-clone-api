const jwt = require('jsonwebtoken')

module.exports = {
    // Middleware atau method function untuk membuat token
    createToken: (payload) => {
        // return jwt.sign(payload, "ikeaQ", {
        return jwt.sign(payload, process.env.KEYTKN, {
            expiresIn: '12h' //untuk memberikan expired dalam 12 jam
        })
    },
    readToken: (req, res, next) => {
        // jwt.verify(req.token, "ikeaQ", (err, decoded) => {
        jwt.verify(req.token, process.env.KEYTKN, (err, decoded) => {
            if (err) {
                return res.status(401).send("User not authorization")
            }

            // data hasil terjemahan token
            req.user = decoded

            next()
        })
    }
}