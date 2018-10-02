var multer = require('multer');
var path = require('path');
var db = require('./db'); //a reference to the database functions so they can be used

//a storage function determining how to store the file
exports.storage = function(path) {
    //use diskstorage
    var storage = multer.diskStorage({
        destination: function (req, file, callback) {
            //save it to the ./uploads path
            callback(null, './uploads/' + path);
        },
        //change the filename by appending some random characters on the end
        //of the filename before the extension
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

//limit file size
exports.limits = {
    fileSize: 2 * 1024 * 1024 //2mb limit
}

//a function to only certain files through
exports.fileFilter = function (req, file, callback) {
    //convert the extension to lower case so less checks have to be made 
    //and extensions are usually case insensitive
    var ext = path.extname(file.originalname).toLowerCase();

    //check if it is an image in .png, .jpg, .jpeg, .gif form
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
        //otherwise throw an error
        return callback(new Error('Only png, jpg and gif are allowed'))
    }
    callback(null, true);
}