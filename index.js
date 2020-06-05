var express = require('express');
var mysql = require('./dbcon.js');
var CORS = require('cors');

var app = express();
app.set('port', 1113);
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(CORS());

const getAllQuery = 'SELECT * FROM workout';
const insertQuery = 'INSERT INTO workout (`name`, `reps`, `weight`, `unit`, `date`) VALUES (?, ?, ?, ?, ?)';
const updateQuery = 'UPDATE workout SET name=?, reps=?, weight=?, unit=?, date=? WHERE id=?';
const deleteQuery = 'DELETE FROM workout WHERE id=?';
const dropTableQuery = 'DROP TABLE IF EXISTS workout';
// unit = 0 is lbs, unit = 1 is kgs
const makeTableQuery = `CREATE TABLE workout(
                        id INT PRIMARY KEY AUTO_INCREMENT, 
                        name VARCHAR(255) NOT NULL,
                        reps INT,
                        weight INT,
                        unit BOOLEAN,
                        date DATE);`;

function getAllData(res) {
    mysql.pool.query(getAllQuery, function(err, rows, fields) {
        if(err) {
            next(err);
            return;
        }
        res.json({rows: rows});
    })
}
    
// GET
app.get('/', function(req, res, next) {
    getAllData(res);
})

// INSERT
app.post('/', function(req, res, next) {
    var {name, reps, weight, unit, date, id} = req.body;
    mysql.pool.query(insertQuery, [name, reps, weight, unit, date, id], function(err, result){
        if(err) {
            next(err);
            return;
        }
        getAllData(res);
    })
})

// DELETE
app.delete('/', function(req, res, next) {
    // console.log(req.body);
    mysql.pool.query(deleteQuery, [req.body.id], function(err, result){
        if(err) {
            next(err);
            return;
        }
        getAllData(res);
    })
})

// UPDATE
app.put('/', function(req, res, next) {
    // console.log(req.body);
    var {name, reps, weight, unit, date, id} = req.body;
    mysql.pool.query(updateQuery, [name, reps, weight, unit, date, id], function(err, result){
        if(err) {
            next(err);
            return;
        }
        getAllData(res);
    })
})

// RESET TABLE
app.get('/reset-table', function(req, res, next) {
    mysql.pool.query(dropTableQuery, function(err){
        mysql.pool.query(makeTableQuery, function(err) {
            res.send('Table reset');
        })
    })
})

app.use(function(req, res) {
    res.status(404);
    res.send("Error 404!");
})

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.send("Error 500!");
})

app.listen(app.get('port'), function() {
    console.log(`Express started on http://${process.env.HOSTNAME}:${app.get('port')}. Press Ctrl+C to terminate.`);
})