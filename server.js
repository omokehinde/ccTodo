 // set up ========================
const express  = require('express');
const mongoose = require('mongoose');                     // mongoose for mongodb
const morgan = require('morgan');             // log requests to the console (express4)
const bodyParser = require('body-parser');    // pull information from HTML POST (express4)
const methodOverride = require('method-override'); // simulate DELETE and PUT (express4)


mongoose.connect('mongodb://omokehinde:davids12@cluster0-shard-00-00-ki1vf.mongodb.net:27017,cluster0-shard-00-01-ki1vf.mongodb.net:27017,cluster0-shard-00-02-ki1vf.mongodb.net:27017/<DATABASE>?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin');     // connect to mongoDB database on modulus.io
let db = mongoose.connection;

// check for db errors
db.on('error', (err) => {
    console.log(err);
});

// check connection
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// init app
const app = express();

app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// listen (start app with node server.js) ======================================
// app.listen(8080);
// console.log("App listening on port 8080");


// define model =================
var Todo = mongoose.model('Todo', {
        text : String
    });

// routes ======================================================================

// api ---------------------------------------------------------------------
// get all todos
app.get('/api/todos', function(req, res) {

// use mongoose to get all todos in the database
    Todo.find(function(err, todos) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        res.json(todos); // return all todos in JSON format
        });
    });

// create todo and send back all todos after creation
app.post('/api/todos', function(req, res) {

    // create a todo, information comes from AJAX request from Angular
    Todo.create({
        text : req.body.text,
        done : false
        }, (err, todo) => {
            if (err)
                res.send(err);

    // get and return all the todos after you create another
    Todo.find((err, todos) => {
        if (err)
            res.send(err)
        res.json(todos);
            });
        });

    });

// delete a todo
app.delete('/api/todos/:todo_id', (req, res) => {
    Todo.remove({
        _id : req.params.todo_id
    }, (err, todo) => {
        if (err)
            res.send(err);

        // get and return all the todos after you create another
        Todo.find((err, todos) => {
            if (err)
                res.send(err)
            res.json(todos);
        });
    });
});

// application -------------------------------------------------------------
app.get('*', (req, res) => {
    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

app.listen(3030, () => {
    console.log('Express listening on port 3030...');
});
