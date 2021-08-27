const database = require('./database')
const nodemailer = require('./nodemailer')
const token = require('./token')
const uploader = require('./uploader')

module.exports = ({
    ...database, ...nodemailer, ...token, ...uploader
})