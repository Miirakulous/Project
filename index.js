//import dependencies
//express
const express = require('express');
const path = require('path');
const session = require('express-session');
//express validator
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const port = 8080;

// set up global package variables
var myApp = express();
myApp.use(express.urlencoded({ extended: true }));

// path to public and views folders
myApp.set('views', path.join(__dirname, 'views'));
myApp.use(express.static(__dirname + '/public'));
myApp.use(fileUpload());

// define the view engine to be used
myApp.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27017/miirakulousart', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// set up model for page
const Page = mongoose.model('Page', {
    title: String,
    imageName: String,
    content: String
});


// set up model for admin
const Admin = mongoose.model('Admin', {
    username: String,
    password: String
});

// set up session
myApp.use(session({
    secret: 'temiloluwaiyanuoluwaolugbanmu',
    resave: false,
    saveUninitialized: true
}));

// set up routes (pages)
// home page
myApp.get('/', function(req, res) {
    Page.find({}).exec(function(err, pages) {
        res.render('home', { pages: pages });
    });
});


// set up log in page
myApp.get('/login', function(req, res) {
    Page.find({}).exec(function(err, pages) {
        res.render('login', { pages: pages });
    });
});

// log in form post
myApp.post('/login', function(req, res) {
    Page.find({}).exec(function(err, pages) {
        var username = req.body.username;
        var password = req.body.password;

        console.log(username);
        console.log(password);

        Admin.findOne({ username: username, password: password }).exec(function(err, admin) {
            console.log('Error: ' + err);
            console.log('Admin: ' + admin);
            if (admin) {
                req.session.username = admin.username;
                req.session.userLoggedIn = true;
                //redirect to the dashboard
                res.redirect('/dashboard');
            } else {
                res.render('login', { error: 'Sorry, cannot login' }, { pages: pages });
            }
        });
    });
});

// dashboard page
myApp.get('/dashboard', function(req, res) {
    //check if user is logged in
    if (req.session.userLoggedIn) {

        res.render('dashboard', { message: 'Hello Admin, you are now logged in.Welcome to your Dashboard!' });
    } else {
        res.redirect('/login');
    }
});

// display pages
myApp.get('/pages', function(req, res) {
    //check if user is logged in
    if (req.session.userLoggedIn) {
        Page.find({}).exec(function(err, pages) {
            console.log('Error: ' + err);
            console.log('Page Found: ' + pages);
            res.render('pages', { pages: pages });
        });
    } else {
        res.redirect('/login');
    }
});

// set up add page
myApp.get('/addpage', function(req, res) {
    //check if user is logged in
    if (req.session.userLoggedIn) {

        res.render('addpage');
    } else {
        res.redirect('/login');
    }
});

myApp.post('/addpage', [
    check('title', 'Please give the page a title.').notEmpty(),
    check('content', 'Please give the page some content').notEmpty()
], function(req, res) {

    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        res.render('addpage', { er: errors.array() });
    } else {

        var title = req.body.title;
        var content = req.body.content;

        // get the name of the file
        var imageName = req.files.image.name;
        //get file(temporary file)
        var imageFile = req.files.image;
        //save image
        var imagePath = 'public/uploads/' + imageName;
        // move file to correct folder
        imageFile.mv(imagePath, function(err) {
            console.log(err);
        });

        var pageData = {
            title: title,
            imageName: imageName,
            content: content
        }

        var newPage = new Page(pageData);
        newPage.save().then(function() {
            console.log('New Page Created');
        });
    }
    res.render('dashboard', { message: 'You have successfully Added a new Page!' });
});

myApp.get('/:pageid', function(req, res) {
    Page.find({}).exec(function(err, pages) {
        var pageid = req.params.pageid;
        console.log(pageid);
        Page.findOne({ _id: pageid }).exec((err, page) => {
            console.log('Error: ' + err);
            console.log('Page Found: ' + page);

            if (page) {
                res.render('blank', {
                    title: page.title,
                    image: page.imageName,
                    content: page.content,
                    pages: pages
                });
            } else {
                res.send('404: Sorry, wrong page!!!.');
            }
        });
    });
});

myApp.get('/editpage', function(req, res) {
    //check if user is logged in
    if (req.session.userLoggedIn) {

        res.render('editpage');
    } else {
        res.redirect('/login');
    }
});

// set up edit page
myApp.get('/editpage/:pageid', function(req, res) {
    //check if user is logged in
    if (req.session.userLoggedIn) {
        var pageid = req.params.pageid;
        console.log(pageid);
        Page.findOne({ _id: pageid }).exec(function(err, page) {
            console.log('Error: ' + err);
            console.log('Page: ' + page);
            if (page) {
                res.render('editpage', { page: page });
            } else {
                res.send('No page found with that id...');
            }
        });
    } else {
        res.redirect('/login');
    }
});


myApp.post('/editpage/:id', [
    check('title', 'Please give the page a title.').notEmpty(),
    check('content', 'Please give the page some content').notEmpty()
], function(req, res) {

    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        Page.findOne({ _id: pageid }).exec(function(err, page) {
            console.log('Error: ' + err);
            console.log('Page: ' + page);
            if (page) {
                res.render('editpage', { page: page, er: errors.array() });
            } else {
                res.send('No page found with that id...');
            }
        });
    } else {

        var pageid = req.params.id;
        console.log(pageid);

        Page.findOne({ _id: pageid }).exec(function(err, page) {
            console.log('Error: ' + err);
            console.log('Page: ' + page);
        });

        var title = req.body.title;
        var content = req.body.edcontent;

        // get the name of the file
        var imageName = req.files.image.name;
        //get file(temporary file)
        var imageFile = req.files.image;
        //save image
        var imagePath = 'public/uploads/' + imageName;
        // move file to correct folder
        imageFile.mv(imagePath, function(err) {
            console.log(err);
        });

        var id = req.params.id;
        Page.findOne({ _id: id }, function(err, page) {
            page.title = title;
            page.imageName = imageName;
            page.content = content;
            page.save();
        });
    }
    res.render('editedpage', { message: 'You have successfully edited the Page!' });
});



// log out page
myApp.get('/logout', function(req, res) {
    req.session.username = '';
    req.session.userLoggedIn = false;
    res.render('login', { error: 'Successfully Logged Out' });
});

//delete page
myApp.get('/delete/:pageid', function(req, res) {
    Page.find({}).exec(function(err, pages) {
        //check if user is logged in
        if (req.session.userLoggedIn) {
            //delete
            var pageid = req.params.pageid;
            console.log(pageid);
            Page.findByIdAndDelete({ _id: pageid }).exec(function(err, page) {
                console.log('Error: ' + err);
                console.log('Page: ' + page);
                if (page) {
                    res.render('delete', { message: 'Successfully deleted...' });
                } else {
                    res.render('delete', { message: 'Sorry, unable to delete!' });
                }
            });

        } else {
            res.redirect('/login');
        }
    });
});


myApp.listen(port, () => console.log('> Server is up and running on port : ' + port));