const express = require('express')
const app = express()
const PORT = 2025
const cors = require('cors')
const bearerToken = require('express-bearer-token')
const https = require('https')
const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config()

app.use(cors())
app.use(bearerToken()) //fungsinya untuk mengambil data authorization/token dari request header yg dikirim oleh frontend

// untuk memberikan akses langsung ke directory public
app.use(express.static('public'))

app.use(express.json()) // agar dapat menerima data dari req.body

const { db } = require('./config/database')

db.getConnection((err, connection) => {
    if (err) {
        return console.error('error MySQL :', err.message)
    }
    console.log(`Connected to MySQL Server : ${connection.threadId}`)
})

app.get('/', (req, res) => {
    res.status(200).send(`<h1>Welcome to IKEA API,${process.env.GRT}</h1>`)
})

const { usersRouter, productsRouter, transactionRouter } = require('./routers')
app.use('/users', usersRouter)
app.use('/products', productsRouter)
app.use('/transaction', transactionRouter)

// Error Handling
app.use((error, req, res, next) => {
    console.log("Handling Error :", error)
    res.status(500).send({ status: 'Error MySQL', messages: error })
})

app.listen(PORT, () => console.log("IKEA API Running :", PORT))

// https.createServer({
//     key: fs.readFileSync('./ssl/ikeassl.key'),
//     cert: fs.readFileSync('./ssl/ikeassl.cert')
// }, app).listen(PORT, () => console.log("IKEA API Running :", PORT))

// // Config MySQL
// HOSTSQL=localhost
// PORTSQL=3306
// USERSQL=gugi
// PASSWORD=Penerbangan91
// DBSQL=ikea_api

// // TOKEN
// KEYTKN = ikeaQ

// // GREETING
// GRT = Welcome Boss