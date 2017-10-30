var multer = require('multer');
var path = require('path');
var db = require('./db'); //a reference to the database functions so they can be used

exports.storage = function(path) {
    var storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, './uploads/' + path);
        },
        filename: function (req, file, callback) {
            var ext = "";
            var fileName = file.originalname;
            if (fileName.indexOf(".") > 0) {
                ext = fileName.substr(fileName.lastIndexOf(".") + 1).toLowerCase(); //get everything after last dot (extension)
                fileName = db.makeid() + "." + ext; //concatenate with a few random characters
            } else {
                fileName = db.makeid();
            }
    
            callback(null, fileName);
        }
    });
    return storage;
}

exports.limits = {
    fileSize: 2 * 1024 * 1024 //2mb limit
}

exports.fileFilter = function (req, file, callback) {
    var ext = path.extname(file.originalname).toLowerCase();
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
        return callback(new Error('Only png, jpg and gif are allowed'))
    }
    callback(null, true);
}