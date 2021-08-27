const { db, dbQuery, transporter, createToken } = require('../config')

module.exports = {
    getCart: async (req, res, next) => {
        try {
            // console.log("Cek Cart User", req.user)
            let queryGet = `Select c.idcart, c.iduser, p.idproducts, p.nama, p.harga, ps.type, ps.qty as qty_stock, 
                ps.idproduct_stock, c.qty from cart c JOIN products p on c.idproducts = p.idproducts
                JOIN product_stock ps on ps.idproduct_stock = c.idstock 
                WHERE c.iduser=${req.user.iduser};`,
                getImage = `Select * from product_image;`

            getSQL = await dbQuery(queryGet)
            getImg = await dbQuery(getImage)

            getSQL.forEach(item => {
                item.images = []
                getImg.forEach(el => {
                    if (item.idproducts == el.idproducts) {
                        item.images.push(el)
                        // item.images.push(el.images)
                    }
                })
            })
            res.status(200).send(getSQL)
        } catch (error) {
            next(error)
        }
    },
    // getCart: (req, res) => {
    //     console.log("Cek Cart User", req.user)
    //     let queryGet = `Select c.idcart, c.iduser, p.idproducts, p.nama, p.harga, ps.type, ps.qty as qty_stock, 
    //             ps.idproduct_stock, c.qty from cart c JOIN products p on c.idproducts = p.idproducts
    //             JOIN product_stock ps on ps.idproduct_stock = c.idstock 
    //             WHERE c.iduser=${req.user.iduser};`,
    //         getImage = `Select * from product_image;`

    //     queryGet.forEach(item => {
    //         item.images = []
    //         getImage.forEach(el => {
    //             if (item.idproducts == el.idproducts) {
    //                 item.images.push(el)
    //                 // item.images.push(el.images)
    //             }
    //         })
    //     })

    //     db.query(queryGet, (err, results) => {
    //         if (err) {
    //             res.status(500).send({ status: 'Error MySQL Login', messages: err })
    //         }
    //         if (results.length > 0) {
    //             // res.status(200).send(results)
    //             let { idcart, iduser, idproducts, idstock, qty } = results[0]

    //             let token = createToken({ idcart, iduser, idproducts, idstock, qty })
    //             res.status(200).send({ idcart, iduser, idproducts, idstock, qty, token })
    //         } else {
    //             res.status(400).send({ status: 'Account Not Found' })
    //         }
    //     })
    // },
    addCart: async (req, res, next) => {
        try {
            let queryInsert = `Insert into cart set ?`
            queryInsert = await dbQuery(queryInsert, { iduser: req.user.iduser, ...req.body })

            res.status(200).send({ status: "Success Add to Cart ✅", results: queryInsert })
        } catch (error) {
            next(error)
        }
    },
    updateCart: async (req, res, next) => {
        try {
            let queryUpdate = await dbQuery(`Update cart set qty = ${req.body.qty} where idcart=${req.body.idcart};`)
            res.status(200).send({ status: "Success Update to Cart", results: queryUpdate })
        } catch (error) {
            next(error)
        }
    },
    updateStatus: async (req, res, next) => {
        try {
            let queryUpdate = await dbQuery(`Update transaction set idstatus = 7
              where idtransaction=${req.body.idtransaction};`)
            res.status(200).send({ status: "Success✅", results: queryUpdate });
        } catch (error) {
            next(error);
        }
    },
    updateStatusAdmin: async (req, res, next) => {
        try {
            let queryUpdate = await dbQuery(`Update transaction set idstatus = 8
              where idtransaction=${req.body.idtransaction};`)
            res.status(200).send({ status: "Success✅", results: queryUpdate });
        } catch (error) {
            next(error);
        }
    },
    deleteCart: async (req, res, next) => {
        try {
            let queryDelete = await dbQuery(`Delete from cart where idcart=${req.params.idcart};`)
            res.status(200).send({ status: "Delete product success", results: queryDelete })
        } catch (error) {
            next(error)
        }
    },
    getTransaksi: async (req, res, next) => {
        try {
            let queryGet = `Select * from transaction tr JOIN status s on tr.idstatus = s.idstatus ${req.params.id > 0 && `where iduser=${req.params.id}`};`,
                getTransaction = `Select p.nama, p.harga, ps.type, td.* from transaction_detail td JOIN products p on td.idproducts = p.idproducts
                JOIN product_stock ps on ps.idproduct_stock = td.idstock;`

            getTrans = await dbQuery(queryGet)
            getTransaction = await dbQuery(getTransaction)
            // console.log("Cek Get Transaksi :",getTrans)
            getTrans.forEach(item => {
                item.transaksi_detail = []
                getTransaction.forEach(el => {
                    if (item.idtransaction == el.idtransaction) {
                        item.transaksi_detail.push(el)
                        // item.images.push(el.images)
                    }
                })
            })
            res.status(200).send(getTrans)
        } catch (error) {
            next(error)
        }
    },
    addCheckout: async (req, res, next) => {
        try {
            // console.log(req.body)
            let iduser = req.user.iduser
            let { invoice, ongkir, total_payment, note, idstatus, detail } = req.body
            let insertQuery = `Insert into transaction set ?`
            insertQuery = await dbQuery(insertQuery, { invoice, iduser, ongkir, total_payment, note, idstatus })
            // console.log("Checkout Success :", insertQuery)

            let detailQuery = `Insert into transaction_detail (idtransaction,idproducts,idstock,qty) values ?`
            let dataDetail = detail.map(item => [insertQuery.insertId, item.idproducts, item.idstock, item.qty])
            // console.log(dataDetail)
            detailQuery = await dbQuery(detailQuery, [dataDetail])

            // console.log("Checkout Success detailQuery :", detailQuery)
            let deleteCart = `Delete from cart where (idcart, iduser) IN (?);`
            let delCart = detail.map(item => [item.idcart, iduser])
            deleteCart = await dbQuery(deleteCart, [delCart])
            // console.log("Checkout Success deleteCart :", detailQuery)
            res.status(200).send({ success: true, message: "Checkout Success" })
        } catch (error) {
            next(error)
        }
    }
}