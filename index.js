var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var pg = require('pg');

var conString = process.env.DATABASE_URL;
//var conString = "postgres://postgres:quake@localhost:5432/postgres";

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
})); // for parsing application/x-www-form-urlencoded

app.get('/', function(req, res) {
    //res.sendFile(__dirname + '/index.html');
	res.sendFile(__dirname + '/public/teaser.html');
});

app.get('/clean', function(req, res) {
    var client = new pg.Client(conString);
    client.connect(function(err) {
        if (err) {
            return console.error('could not connect to postgres', err);
        }
        client.query("CREATE TABLE IF NOT EXISTS EMAILS(EMAIL VARCHAR(255), REG_DATE DATE)", function(err) {
            if (err) {
                return console.error('error running query', err);
            }
            client.query("DELETE FROM EMAILS", function(err) {
                if (err) {
                    return console.error('error running query', err);
                }
                client.end();
            });
        });
    });
    res.send('<script>alert("Clean Complete");location.href="/";</script>');
});

app.post('/email', function(req, res) {
    var email = req.param('email', null);
    var client = new pg.Client(conString);
    client.connect(function(err) {
        if (err) {
            return console.error('could not connect to postgres', err);
        }
        client.query("INSERT INTO EMAILS(EMAIL, REG_DATE) values($1, NOW())", [email], function(err) {
            if (err) {
                return console.error('error running query', err);
            }
            client.end();
        });
    });
    res.send('<script>alert("Insert Complete");location.href="/";</script>');
});

app.get('/list', function(req, res) {
    var client = new pg.Client(conString);
    client.connect(function(err) {
        if (err) {
            return console.error('could not connect to postgres', err);
        }
        client.query("SELECT EMAIL, REG_DATE  FROM EMAILS", function(err, result) {
            if (err) {
                return console.error('error running query', err);
            }
            res.set('Content-Type', 'application/json');
			//res.send("{DB:" + conString + "},");
            res.send(result.rows);
            client.end();
        });
    });
});

app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});
