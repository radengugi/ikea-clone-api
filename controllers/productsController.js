const { db, dbQuery, uploader } = require('../config')
const fs = require('fs')

module.exports = {
    // addProducts: async (req, res, next) => {
    //     try {
    // let getSQL = `Insert into products (nama,brand,deskripsi,harga,idstatus)
    //     values (${db.escape(req.body.nama)},${db.escape(req.body.brand)},
    //     ${db.escape(req.body.deskripsi)},${db.escape(req.body.harga)},
    //     ${db.escape(req.body.idstatus)});`
    // let postStock = `Insert into product_stock values`
    // let postImage = `Insert into product_image values`

    // // get All idcategory dari child -> parent
    // let getIdCategory = `WITH RECURSIVE category_path (idcategory, category, parent_id) AS
    //     (
    //         SELECT idcategory, category, parent_id
    //             FROM category
    //             WHERE idcategory = ${req.body.idcategory} -- kategori yg paling bawah yg dipilih
    //         UNION ALL
    //         SELECT c.idcategory, c.category, c.parent_id
    //             FROM category_path AS cp JOIN category AS c
    //             ON cp.parent_id = c.idcategory
    //     )
    //     SELECT * FROM category_path;`

    // getIdCategory = await dbQuery(getIdCategory)
    // console.log(getIdCategory)

    // dataSQL = await dbQuery(getSQL)
    // if (dataSQL.insertId) {
    //     // query untuk insert data ke table product_category
    //     getIdCategory = getIdCategory.map(item => [dataSQL.insertId, item.idcategory])
    //     await dbQuery(`Insert into product_category (idproducts,idcategory) values ?`, [getIdCategory])

    //     // Menjalankan insert untuk product_image dan product_stock
    //     console.log("Cek dataImage :", dataImage)

    //     let dataStock = []
    //     req.body.stock.forEach(item => {
    //         dataStock.push(`(null,${dataSQL.insertId},${db.escape(item.type)},
    //         ${db.escape(item.qty)},${db.escape(req.body.idstatus)})`)
    //     })
    //     await dbQuery(postStock + dataStock)

    //     // Upload Image
    //     let dataImage = []
    //     req.body.images.forEach(item => {
    //         dataImage.push(`(null,${dataSQL.insertId},${db.escape(item)})`)
    //     })
    //     await dbQuery(postImage + dataImage)

    //     console.log("Success add products :", dataSQL)
    // res.status(200).send("Insert product success")
    // }

    //         const upload = uploader('/images', 'IMG').fields([{ name: 'images' }])

    //         upload(req, res, async (error) => {
    //             try {
    //                 let json = JSON.parse(req.body.data)
    //                 const { images } = req.files
    //                 console.log(JSON.parse(req.body.data))
    //                 console.log("Cek file upload images :", images)

    //                 // await dbQuery()
    //                 // res.status(200).send("Insert product success")
    //             } catch (err) {
    //                 // Hapus gambar jika proses upload error
    //                 fs.unlinkSync(`./public/images/${req.files.images[0].filename}`)
    //                 // error catch dari fungsi dbQuery
    //                 console.log(err)
    //                 // error dari fungsi upload
    //                 next(err)
    //             }
    //         })

    //     } catch (error) {
    //         res.status(500).send({ status: 'Error MySQL AddProducts :', messages: error })
    //     }
    // },
    addProducts: async (req, res) => {
        try {
            let getSQL = `Insert into products (nama,brand,deskripsi,harga,idstatus)
                values (${db.escape(req.body.nama)},${db.escape(req.body.brand)},
                ${db.escape(req.body.deskripsi)},${db.escape(req.body.harga)},
                ${db.escape(req.body.idstatus)});`
            let postStock = `Insert into product_stock values`
            let postImage = `Insert into product_image values`

            // get All idcategory dari child -> parent
            let getIdCategory = `WITH RECURSIVE category_path (idcategory, category, parent_id) AS
                (
                    SELECT idcategory, category, parent_id
                        FROM category
                        WHERE idcategory = ${req.body.idcategory} -- kategori yg paling bawah yg dipilih
                    UNION ALL
                    SELECT c.idcategory, c.category, c.parent_id
                        FROM category_path AS cp JOIN category AS c
                        ON cp.parent_id = c.idcategory
                )
                SELECT * FROM category_path;`

            getIdCategory = await dbQuery(getIdCategory)
            console.log(getIdCategory)

            dataSQL = await dbQuery(getSQL)
            if (dataSQL.insertId) {
                // query untuk insert data ke table product_category
                getIdCategory = getIdCategory.map(item => [dataSQL.insertId, item.idcategory])
                await dbQuery(`Insert into product_category (idproducts,idcategory) values ?`, [getIdCategory])

                // Menjalankan insert untuk product_image dan product_stock
                let dataImage = []
                req.body.images.forEach(item => {
                    dataImage.push(`(null,${dataSQL.insertId},${db.escape(item)})`)
                })
                console.log("Cek dataImage :", dataImage)

                let dataStock = []
                req.body.stock.forEach(item => {
                    dataStock.push(`(null,${dataSQL.insertId},${db.escape(item.type)},
                    ${db.escape(item.qty)},${db.escape(req.body.idstatus)})`)
                })
                await dbQuery(postImage + dataImage)
                await dbQuery(postStock + dataStock)

                res.status(200).send("Insert product success")
            }
        } catch (error) {
            res.status(500).send({ status: 'Error MySQL AddProducts :', messages: error })
        }
    },
    getProducts: async (req, res) => {
        try {
            let getSQL, dataSearch = [],
                getImage = `Select * from product_image;`,
                getStock = `Select * from product_stock ps JOIN status s on ps.idstatus = s.idstatus;`

            for (let prop in req.query) {
                dataSearch.push(`${prop}= ${db.escape(req.query[prop])}`)
            }

            if (dataSearch.length > 0) {
                getSQL = `Select * from products p JOIN status s on p.idstatus = s.idstatus where ${dataSearch.join(' AND ')};`
            } else {
                getSQL = `Select * from products p JOIN status s on p.idstatus = s.idstatus where p.idstatus=1;`
            }

            let get = await dbQuery(getSQL)
            let getImg = await dbQuery(getImage)
            let getStck = await dbQuery(getStock)
            // Looping results data product
            get.forEach(item => {
                // Membuat properti images untuk product
                item.images = []
                // Looping results_image untuk di cocokan foreign key nya dengan
                // Results data product
                getImg.forEach(el => {
                    // Jika id sama, data results_image akan disamakan ke dalam properti 
                    if (item.idproducts == el.idproducts) {
                        item.images.push(el)
                        // item.images.push(el.images)
                    }
                })

                item.stock = []
                getStck.forEach(el => {
                    if (item.idproducts == el.idproducts) {
                        // item.stock.push(el)
                        item.stock.push({
                            idproduct_stock: el.idproduct_stock,
                            type: el.type,
                            qty: el.qty,
                            status: el.status
                        })
                    }
                })
            })
            res.status(200).send(get)
        } catch (error) {
            res.status(500).send({ status: 'Error MySQL', messages: error })
        }
    },
    // getProducts: async (req, res) => {
    //     try {
    //         let getSQL, dataSearch = [],
    //             getImage = `Select * from product_image;`,
    //             getStock = `Select * from product_stock ps JOIN status s on ps.idstatus = s.idstatus;`

    //         for (let prop in req.body) {
    //             dataSearch.push(`${prop}= ${db.escape(req.body[prop])}`)
    //         }

    //         if (dataSearch.length > 0) {
    //             getSQL = `Select * from products p JOIN product_category pc on p.idproducts = pc.idproducts where ${dataSearch.join(' AND ')};`
    //         } else {
    //             getSQL = `Select * from products p JOIN product_category pc on p.idproducts = pc.idproducts;`
    //         }

    //         // // get All idcategory dari child -> parent
    //         // let getIdCategory = `WITH RECURSIVE category_path (idcategory, category, parent_id) AS
    //         //     (
    //         //         SELECT idcategory, category, parent_id
    //         //             FROM category
    //         //             WHERE idcategory = ${req.body.idcategory} -- kategori yg paling bawah yg dipilih
    //         //         UNION ALL
    //         //         SELECT c.idcategory, c.category, c.parent_id
    //         //             FROM category_path AS cp JOIN category AS c
    //         //             ON cp.parent_id = c.idcategory
    //         //     )
    //         //     SELECT * FROM category_path;`

    //         // getIdCategory = await dbQuery(getIdCategory)
    //         // console.log(getIdCategory)

    //         // get All idcategory dari child -> parent
    //         let getIdCategory = `WITH RECURSIVE category_path (idcategory, category, path) AS
    //             (
    //                 SELECT idcategory, category, category as path
    //                     FROM category
    //                     WHERE parent_id is null -- kategori parent to child
    //                 UNION ALL
    //                 SELECT c.idcategory, c.category, concat(cp.path, '->', c.category)
    //                     FROM category_path AS cp JOIN category AS c
    //                     ON cp.idcategory = c.parent_id
    //             )
    //             SELECT * FROM category_path order by path;`

    //         getIdCategory = await dbQuery(getIdCategory)
    //         console.log(getIdCategory)

    //         let get = await dbQuery(getSQL)
    //         let getImg = await dbQuery(getImage)
    //         let getStck = await dbQuery(getStock)
    //         // Looping results data product
    //         get.forEach(item => {
    //             // Membuat properti images untuk product
    //             item.images = []
    //             // Looping results_image untuk di cocokan foreign key nya dengan
    //             // Results data product
    //             getImg.forEach(el => {
    //                 // Jika id sama, data results_image akan disamakan ke dalam properti 
    //                 if (item.idproducts == el.idproducts) {
    //                     item.images.push(el)
    //                     // item.images.push(el.images)
    //                 }
    //             })

    //             item.stock = []
    //             getStck.forEach(el => {
    //                 if (item.idproducts == el.idproducts) {
    //                     // item.stock.push(el)
    //                     item.stock.push({
    //                         idproduct_stock: el.idproduct_stock,
    //                         type: el.type,
    //                         qty: el.qty,
    //                         status: el.status
    //                     })
    //                 }
    //             })
    //         })
    //         res.status(200).send(get)
    //     } catch (error) {
    //         res.status(500).send({ status: 'Error MySQL', messages: error })
    //     }
    // },
    updateProduct: async (req, res) => {  //Penulisan disederhanakan
        try {
            console.log("data Update :", req.body)
            let { idproducts, nama, brand, deskripsi, harga, idstatus, images, stock } = req.body

            // Update product_image
            let updateImages = images.map(item => `Update product_image set images=${db.escape(item.images)} 
                where idproduct_image=${db.escape(item.idproduct_image)};`)
            console.log("Query Images :", updateImages.join('\n'))

            // Update product_stock
            let updateStock = stock.map(item => `Update product_stock set type=${db.escape(item.type)},
                qty=${item.qty} where idproduct_stock=${item.idproduct_stock};`)

            // Update product master
            let update = `Update products set nama=${db.escape(nama)}, brand=${db.escape(brand)}, deskripsi=${db.escape(deskripsi)},
                harga=${db.escape(harga)}, idstatus=${db.escape(idstatus)} where idproducts=${db.escape(idproducts)};
                ${updateImages.join('\n')}
                ${updateStock.join('\n')}`

            await dbQuery(update)
            res.status(200).send("Update Stock and Images Success")
        } catch (error) {
            res.status(500).send({ status: 'Error MySQL', messages: error })
        }


    },
    deleteProduct: async (req, res) => {
        try {
            await dbQuery(`Update products set idstatus = 2 where idproducts=${req.query.id};`)
            res.status(200).send("Delete product success")
        } catch (error) {
            res.status(500).send({ status: 'Error MySQL', messages: error })
        }
    }
}

// addProduct: async (req, res, next) => {
//     try {
//       const upload = uploader("/images", "IMG").fields([{ name: "images" }]);
//       upload(req, res, async (error) => {
//         if (error) {
//           //hapus gambar jika proses upload error
//           fs.unlinkSync(`./public/images/${req.files.images[0].filename}`);
//           next(error);
//         }
//         try {
//           var json = JSON.parse(req.body.data);
//           const { images } = req.files;
//           console.log("req body data", images[0].filename);
//           console.log("cek file upload :", images);
//           let postProduct = `Insert into products values (null,${db.escape(
//             json.nama
//           )},${db.escape(json.brand)},
//                 ${db.escape(json.deskripsi)},${db.escape(json.harga)},
//                 ${db.escape(json.idstatus)});`;
//           let postImage = `Insert into products_image values `;
//           let postStock = `Insert into products_stock values `;
//           // get all idcategory dari child->parent
//           let getIdCategory = `WITH RECURSIVE category_path (idcategory, category, parent_id) AS
//                 (
//                   SELECT idcategory, category, parent_id
//                     FROM category
//                     WHERE idcategory = ${json.idcategory}
//                   UNION ALL
//                   SELECT c.idcategory, c.category, c.parent_id
//                     FROM category_path AS cp JOIN category AS c
//                       ON cp.parent_id = c.idcategory
//                 )
//                 SELECT * FROM category_path;`;
//           getIdCategory = await dbQuery(getIdCategory);
//           console.log(getIdCategory);
//           postProduct = await dbQuery(postProduct);
//           if (postProduct.insertId) {
//             // query untuk insert data ke table product_category
//             getIdCategory = getIdCategory.map((item) => [
//               postProduct.insertId,
//               item.idcategory,
//             ]);
//             await dbQuery(
//               `insert into product_category (idproduct,idcategory) values ?`,
//               [getIdCategory]
//             );
//             // menjalankan insert untuk product_img dan product_stck
//             let dataStock = [];
//             json.stock.forEach((item) => {
//               dataStock.push(
//                 `(null,${postProduct.insertId},${db.escape(
//                   item.type
//                 )},${db.escape(item.qty)},${db.escape(json.idstatus)})`
//               );
//             });
//             await dbQuery(postStock + dataStock);
//             let dataImg = [];
//             dataImg.push(
//               `(null,${postProduct.insertId},'${images[0].filename}')`
//             );
//             // req.body.images.forEach((item) => {
//             //   dataImg.push(`(null,${postProduct.insertId},${db.escape(item)})`);
//             // });
//             await dbQuery(postImage + dataImg);
//           }
//         } catch (error) {
//           fs.unlinkSync(`./public/images/${req.files.images[0].filename}`);
//           next(error);
//         }
//       });
//       res.status(200).send("Insert product success :white_check_mark:");
//       // }
//     } catch (error) {
//       next(error);
//     }
//   }

/** Back-up Controller -- Penulisan Sychronous
 * updateProduct: (req, res) => {
        console.log("data Update :", req.body)
        let { idproducts, nama, brand, deskripsi, harga, idstatus, images, stock } = req.body
        let update = `Update products set nama=${db.escape(nama)}, brand=${db.escape(brand)}, deskripsi=${db.escape(deskripsi)},
            harga=${db.escape(harga)}, idstatus=${db.escape(idstatus)} where idproducts=${db.escape(idproducts)};`

        db.query(update, (err, results) => {
            if (err) {
                res.status(500).send({ status: 'Error MySQL', messages: err })
            }
            console.log("Update Product Success :", results)

            // Update images dan stock
            let updateImages = images.map(item => `Update product_image set images=${db.escape(item.images)}
                where idproduct_image=${db.escape(item.idproduct_image)};`)
            console.log("Query Images :", updateImages.join('\n'))

            let updateStock = stock.map(item => `Update product_stock set type=${db.escape(item.type)},
                qty=${item.qty} where idproduct_stock=${item.idproduct_stock};`)

            db.query(updateImages.join('\n'), (err_image, results_image) => {
                if (err_image) {
                    res.status(500).send({ status: 'Error MySQL', messages: err_image })
                }

                db.query(updateStock.join('\n'),(err_stock,results_stock)=>{
                    if (err_stock) {
                        res.status(500).send({ status: 'Error MySQL', messages: err_stock })
                    }
                    res.status(200).send("Update Stock and Images Success")
                })
            })
        })
    },
    updateProduct: (req, res) => {  //Penulisan disederhanakan
        console.log("data Update :", req.body)
        let { idproducts, nama, brand, deskripsi, harga, idstatus, images, stock } = req.body

        // Update product_image
        let updateImages = images.map(item => `Update product_image set images=${db.escape(item.images)}
        where idproduct_image=${db.escape(item.idproduct_image)};`)
        console.log("Query Images :", updateImages.join('\n'))

        // Update product_stock
        let updateStock = stock.map(item => `Update product_stock set type=${db.escape(item.type)},
        qty=${item.qty} where idproduct_stock=${item.idproduct_stock};`)

        // Update product master
        let update = `Update products set nama=${db.escape(nama)}, brand=${db.escape(brand)}, deskripsi=${db.escape(deskripsi)},
            harga=${db.escape(harga)}, idstatus=${db.escape(idstatus)} where idproducts=${db.escape(idproducts)};
            ${updateImages.join('\n')}
            ${updateStock.join('\n')}`

        console.log(update)
        db.query(update, (err, results) => {
            if (err) {
                res.status(500).send({ status: 'Error MySQL', messages: err })
            }
            console.log("Update Product Success :", results)

            res.status(200).send("Update Stock and Images Success")
        })
    },
    deleteProduct: (req, res) => {
        let delQuery = `Update products set idstatus = 2 where idproducts=${req.query.id};`
        db.query(delQuery, (err, results) => {
            if (err) {
                res.status(500).send({ status: 'Error MySQL', messages: err })
            }
            res.status(200).send("Delete product success")
        })
    },
    addProducts: (req, res) => {
        console.log(req.body)
        let getSQL = `Insert into products (nama,brand,deskripsi,harga,idstatus)
        values (${db.escape(req.body.nama)},${db.escape(req.body.brand)},
        ${db.escape(req.body.deskripsi)},${db.escape(req.body.harga)},
        ${db.escape(req.body.idstatus)});`

        let postImage = `Insert into product_image values`
        let postStock = `Insert into product_stock values`

        db.query(getSQL, (err, results) => {
            if (err) {
                res.status(500).send({ status: 'Error MySQL AddProducts :', messages: err })
            } else {
                // let getData = `Select * from products`
                // db.query(getData, (err, resultsData) => {
                //     res.status(200).send(resultsData)
                // })

                console.log("Result product :", results)
                if (results.insertId) {
                    // Menjalankan insert untuk product_image dan product_stock
                    let dataImage = []
                    req.body.images.forEach(item => {
                        dataImage.push(`(null,${results.insertId},${db.escape(item)})`)
                    })

                    let dataStock = []
                    req.body.stock.forEach(item => {
                        dataStock.push(`(null,${results.insertId},${db.escape(item.type)},
                        ${db.escape(item.qty)},${db.escape(req.body.idstatus)})`)
                    })
                    // console.log(postImage + dataImage)
                    // console.log(postStock + dataStock)

                    db.query(postImage + dataImage, (err_image, results_image) => {
                        if (err_image) {
                            res.status(500).send({ status: 'Error MySQL AddProducts :', messages: err_image })
                        }
                        db.query(postStock + dataStock, (err_stock, results_stock) => {
                            if (err_stock) {
                                res.status(500).send({ status: 'Error MySQL AddProducts :', messages: err_stock })
                            }
                            res.status(200).send("Insert product success")
                        })
                    })
                }
            }
        })
    }
 */