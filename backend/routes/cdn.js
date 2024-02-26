var express = require('express');
var createError = require("http-errors");
const { verifyAccessToken } = require('../helpers/jwt');
const verifyRecaptcha = require('../helpers/recaptcha');
var router = express.Router();
const multer = require('multer');
const path = require('node:path'); 

const { default: mongoose } = require('mongoose');
const CDN = require('../schemas/cdn');
const { v4 } = require('uuid');
const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, process.env.CDN_PATH);
  },
  filename: function (req, file, callback) {
    callback(null, req.name+path.extname(file.originalname));
  }
});
const upload = multer({storage: storage, fileFilter: function (req, file, callback) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if(mimetype && extname) {
        return callback(null, true)
    }
    return callback('Only images are allowed')
}, limits: {fileSize: process.env.CDN_UPLOAD_LIMIT}}).single('file')


router.post('/upload', verifyAccessToken, verifyRecaptcha("uploadCDN"), async function (req, res, next) {
    const imageID = v4()
    req.name = imageID
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            if(err.code==='LIMIT_FILE_SIZE') return res.status(400).send("File must be under 5Mb")
            else {console.log(err);return res.status(400).send('unknown error')}
        } else if (err) {
            return res.status(400).send(err)
        }

        if(!req.file) return res.status(400).send("No file was sent")
        
        const fileDb = new CDN({
            author: req.payload.aud,
            filename: imageID+path.extname(req.file.originalname).toLowerCase(),
            type: path.extname(req.file.originalname).toLowerCase(),
            originalName: req.file.originalname,
            path: process.env.CDN_PATH +"/"+imageID+path.extname(req.file.originalname).toLowerCase()
        })

        try {
            await fileDb.save()
            res.status(200).send(imageID+path.extname(req.file.originalname).toLowerCase());
        }
        catch(err) {
            return next(createError.InternalServerError())
        }
    })
})

router.get("/:file", async function(req, res, next) {
    const file = req.params.file;
    if(!file) return next(createError.BadRequest())
    const filePath = await CDN.findOne({filename: file})
    if(!filePath) return next(createError.NotFound("File not found"))

    const options = {
        root: path.dirname(require.main.filename)
    };
    res.sendFile(filePath.path, options, function (err) {
        if (err.status === 404) {
            return next(createError.NotFound("File not found"))
        }
        else {
            return next(createError.InternalServerError())
        }
    });
    //res.send("success")
})


module.exports = router;