// password 2FA gmail : osxgblrpdlkzcaos
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'radengugi@gmail.com',
        pass: 'osxgblrpdlkzcaos'
    },
    tls: {
        rejectUnauthorized: false
    }
})

module.exports = { transporter }