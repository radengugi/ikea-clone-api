const { db, dbQuery, transporter, createToken } = require('../config')
const Crypto = require('crypto');

module.exports = {
    getUsers: async (req, res) => {
        try {
            let getSQL, dataSearch = [];

            for (let prop in req.query) {
                dataSearch.push(`${prop}= ${db.escape(req.query[prop])}`)
            }

            if (dataSearch.length > 0) {
                getSQL = `Select * from users where ${dataSearch.join(' AND ')};`
            } else {
                getSQL = `Select * from users;`
            }

            let get = await dbQuery(getSQL)
            res.status(200).send(get)

        } catch (error) {
            res.status(500).send({ status: 'Error MySQL', messages: error })
        }
    },
    login: (req, res) => {
        if (req.body.email && req.body.password) {
            let hashPassword = Crypto.createHmac("sha256", "ikea$$$").update(req.body.password).digest("hex")
            let getFromSQL = `Select * from users where email=${db.escape(req.body.email)} and password=${db.escape(hashPassword)};`
            db.query(getFromSQL, (err, results) => {
                if (err) {
                    res.status(500).send({ status: 'Error MySQL Login', messages: err })
                }
                if (results.length > 0) {
                    // res.status(200).send(results)
                    let { iduser, username, email, role, idstatus } = results[0]

                    let token = createToken({ iduser, username, email, role, idstatus })
                    res.status(200).send({ iduser, username, email, role, idstatus, token })
                } else {
                    res.status(400).send({ status: 'Account Not Found' })
                }
            })
        } else {
            res.status(500).send({ error: true, messages: "Your params not complete" })
        }
    },
    // login: async (req, res, next) => {
    //     try {
    //         if (req.body.email && req.body.password) {
    //             let hashPassword = Crypto.createHmac("sha256", "ikea$$$").update(req.body.password).digest("hex")
    //             let getFromSQL = `Select * from users where email=${db.escape(req.body.email)} and password=${db.escape(hashPassword)};`
    //             let get = await dbQuery(getFromSQL)
    //             // console.log("Cek get :", get)

    //             let { iduser, username, email, role, idstatus } = get[0]

    //             let token = createToken({ iduser, username, email, role, idstatus })
    //             res.status(200).send({ iduser, username, email, role, idstatus, token })
    //         }
    //     } catch (error) {
    //         next(error)
    //     }
    // },
    keepLogin: async (req, res) => {
        try {
            if (req.user.iduser) {
                let getFromSQL = `Select * from users where iduser=${db.escape(req.user.iduser)};`
                let get = await dbQuery(getFromSQL)
                let { iduser, username, email, role, idstatus } = get[0]

                let token = createToken({ iduser, username, email, role, idstatus })
                res.status(200).send({ iduser, username, email, role, idstatus, token })
            }
        } catch (error) {
            res.status(500).send({ status: 'Error MySQL Login', messages: error })
        }
    },
    // keepLogin: (req, res) => {
    //     if (req.user.iduser) {
    //         let getFromSQL = `Select * from users where iduser=${db.escape(req.user.iduser)};`
    //         db.query(getFromSQL, (err, results) => {
    //             if (err) {
    //                 res.status(500).send({ status: 'Error MySQL Login', messages: err })
    //             }
    //             if (results.length > 0) {
    //                 // res.status(200).send(results)
    //                 let { iduser, username, email, role, idstatus } = results[0]

    //                 let token = createToken({ iduser, username, email, role, idstatus })
    //                 res.status(200).send({ iduser, username, email, role, idstatus, token })
    //             } else {
    //                 res.status(404).send({ status: 'Account Not Found' })
    //             }
    //         })
    //     } else {
    //         res.status(500).send({ error: true, messages: "Your params not complete" })
    //     }
    // },
    updateVerified: async (req, res, next) => {
        try {
            console.log("Hasil readToken :", req.user)
            let queryUpdate = `Update users set idstatus = 11 where iduser=${req.user.iduser} and otp=${db.escape(req.body.otp)};`
            queryUpdate = await dbQuery(queryUpdate)
            res.status(200).send({ success: true, messages: "Verification Success" });
        } catch (error) {
            next(error)
        }
    },
    reVerification: async (req, res, next) => {
        try {
            let hashPassword = Crypto.createHmac("sha256", "ikea$$$").update(req.body.password).digest("hex")
            let getUser = await dbQuery(`Select * from users where email=${db.escape(req.body.email)} and password=${db.escape(hashPassword)};`)

            let { iduser, username, email, role, idstatus } = getUser[0]

            // Generate OTP
            let karakter = '0123456789abcdefghijklmnopqrstuvwxyz'
            let OTP = ''

            for (let i = 0; i < 6; i++) { // dibuat hanya 6 karakter
                OTP += karakter.charAt(Math.floor(Math.random() * karakter.length))
            }

            // Update otp
            await dbQuery(`Update users set otp=${db.escape(OTP)} where iduser=${iduser};`)

            // Membuat Token
            let token = createToken({ iduser, username, email, role, idstatus })

            // Membuat konfigurasi email
            // 1. Konten email
            let mail = {
                from: 'Admin IKEA <radengugi@gmail.com>', //email pengirim, sesuai config nodemailer
                to: email, //email penerima sesuai data Select dari database
                subject: '[IKEA-WEB] Re-Verification Email', //subject email
                html: `<div style="text-align:'center'">
                        <p>Hello ${username}, NEW OTP : <b>${OTP}</b></p>
                        <a href='http://localhost:3000/verification/${token}'>Re-Verification your email</a>
                </div>` //isi dari email
            }

            // 2. Konfigurasi Transporter
            await transporter.sendMail(mail)
            res.status(200).send({ success: true, message: "Verification Success, Check Your Email" })
        } catch (error) {
            next(error)
        }
    },
    register: async (req, res, next) => {
        try {
            // Generate OTP
            let karakter = '0123456789abcdefghijklmnopqrstuvwxyz'
            let OTP = ''

            for (let i = 0; i < 6; i++) { // dibuat hanya 6 karakter
                OTP += karakter.charAt(Math.floor(Math.random() * karakter.length))
            }

            // hashing password
            let hashPassword = Crypto.createHmac("sha256", "ikea$$$").update(req.body.password).digest("hex")

            // Fungsi Register
            // if (req.body.username && req.body.email && req.body.password) {
            let getFromSQL = `Insert into users (username,email,password,otp) 
                values (${db.escape(req.body.username)},${db.escape(req.body.email)},${db.escape(hashPassword)},${db.escape(OTP)});`

            let get = await dbQuery(getFromSQL)

            let getUser = await dbQuery(`Select * from users where iduser=${get.insertId}`)
            let { iduser, username, email, role, idstatus, otp } = getUser[0]

            // Membuat Token
            let token = createToken({ iduser, username, email, role, idstatus })

            // Membuat konfigurasi email
            // 1. Konten email
            let mail = {
                from: 'Admin IKEA <radengugi@gmail.com>', //email pengirim, sesuai config nodemailer
                to: email, //email penerima sesuai data Select dari database
                subject: '[IKEA-WEB] Verification Email', //subject email
                html: `<div style="text-align:'center'">
                        <p>Your OTP : <b>${otp}</b></p>
                        <a href='http://localhost:3000/verification/${token}'>Verification your email</a>
                </div>` //isi dari email
            }

            // 2. Konfigurasi Transporter
            await transporter.sendMail(mail)

            res.status(200).send({ success: true, message: "Register Success" })
        } catch (error) {
            next(error)
            // res.status(500).send({ status: 'Error MySQL Register :', messages: err })
        }
    }
}

/** Backup - Synchronous
 * getUsers: (req, res) => {
        // if (req.query.role || req.query.status || req.query.email || req.query.username || req.query.iduser) {
        //     let getFromSQL = `Select * from users where
        //     iduser=${db.escape(req.query.iduser)} or
        //     username=${db.escape(req.query.username)} or
        //     email=${db.escape(req.query.email)} or
        //     role=${db.escape(req.query.role)} or
        //     status=${db.escape(req.query.status)}
        //     ;`

        //     db.query(getFromSQL, (err, results) => {
        //         if (err) {
        //             res.status(500).send({ status: 'Error MySQL Get', messages: err })
        //         }
        //         res.status(200).send(results)
        //     })
        // } else {
        //     let getData = `Select * from users`
        //     db.query(getData, (err, resultsData) => {
        //         res.status(200).send(resultsData)
        //     })
        // }

        let getSQL, dataSearch = [];
        for (let prop in req.query) {
            dataSearch.push(`${prop}= ${db.escape(req.query[prop])}`)
        }
        if (dataSearch.length > 0) {
            getSQL = `Select * from users where ${dataSearch.join(' AND ')};`
        } else {
            getSQL = `Select * from users;`
        }

        db.query(getSQL, (err, results) => {
            if (err) {
                res.status(500).send({ status: 'Error MySQL', messages: err })
            }
            res.status(200).send(results)
        })
    },
    login: (req, res) => {
        if (req.body.email && req.body.password) {
            let getFromSQL = `Select * from users where email=${db.escape(req.body.email)} and password=${db.escape(req.body.password)};`
            db.query(getFromSQL, (err, results) => {
                if (err) {
                    res.status(500).send({ status: 'Error MySQL Login', messages: err })
                }
                if (results.length > 0) {
                    // res.status(200).send(results)
                let { iduser, username, email, role, idstatus } = get[0]

                let token = createToken({ iduser, username, email, role, idstatus })
                res.status(200).send(iduser, username, email, role, idstatus, token)
                } else {
                    res.status(400).send({ status: 'Account Not Found' })
                }
            })
        } else {
            res.status(500).send({ error: true, messages: "Your params not complete" })
        }
    },
    keepLogin: (req, res) => {
        console.log(req.body)
        if (req.body.id) {
            let getFromSQL = `Select * from users where iduser=${db.escape(req.body.id)};`
            db.query(getFromSQL, (err, results) => {
                if (err) {
                    res.status(500).send({ status: 'Error MySQL Login', messages: err })
                }
                if (results.length > 0) {
                    res.status(200).send(results)
                } else {
                    res.status(404).send({ status: 'Account Not Found' })
                }
            })
        } else {
            res.status(500).send({ error: true, messages: "Your params not complete" })
        }
    },
    register: (req, res) => {
        if (req.body.username && req.body.email && req.body.password) {
            let getFromSQL = `Insert into users (username,email,password)
            values (${db.escape(req.body.username)},${db.escape(req.body.email)},${db.escape(req.body.password)});`
            db.query(getFromSQL, (err, results) => {
                if (err) {
                    res.status(500).send({ status: 'Error MySQL Register :', messages: err })
                } else {
                    let getData = `Select * from users`
                    db.query(getData, (err, resultsData) => {
                        res.status(200).send(resultsData)
                    })
                }
            })
        } else {
            res.status(500).send({ error: true, messages: "Your params not complete" })
        }
    }
 */