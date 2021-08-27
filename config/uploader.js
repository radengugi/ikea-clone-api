const multer = require('multer')
const fs = require('fs')

module.exports = {
    uploader: (directory, fileNamePrefix) => {
        // Lokasi penyimpanan file secara default
        let defaultDir = './public'

        // diskStorage : untuk menyimpan file ke dalam local directory Backend / API
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const pathDir = directory ? defaultDir + directory : defaultDir
                // Melakukan pengecekan directory pada local Backend / API
                if (fs.existsSync(pathDir)) {
                    // Jika ada, pathDir akan di return oleh cb(callback)()
                    console.log("Directory Exist ✅")
                    cb(null, pathDir)
                } else {
                    // Jika tidak ada, maka directory akan dibuat
                    fs.mkdir(pathDir, { recursive: true }, error => cb(error, pathDir))
                    console.log("Directory Success Created ✅")
                }
            },
            filename: (req, file, cb) => {
                let ext = file.originalname.split('.')
                let filename = fileNamePrefix + Date.now() + '.' + ext[ext.length - 1]
                cb(null, filename)
            }
        })
        const fileFilter = (req, file, cb) => {
            // extension file yg diperbolehkan untuk disimpan
            const ext = /\.(jpg|png|pdf|docx|gif|xlsx|txt)/
            if (!file.originalname.match(ext)) {
                return cb(new Error("Your File type are denied"), false)
            }
            cb(null, true)
        }

        return multer({ storage, fileFilter })
    }
}