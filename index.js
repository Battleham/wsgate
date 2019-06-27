var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fetch = require('node-fetch');
var bodyparser = require('body-parser');
var sleeper = process.env.SLEEPERSVC || 'localhost';

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
  });

app.post('/connections', (req, res) => {
    console.log(req.body);
    let data = req.body;
    let id = data.connectionId;
    if(!data.connectionId)
    {
        return res.status(404).send("No connection id.");
    }
    //console.log(io.sockets.connected[id]);
    console.log(id);
    let sock = io.sockets.connected[id];
    if(!sock){
        return res.status(404).send("Invalid connection id.");
    }
    sock.emit('response', data.msg);
    res.send("success");
});

io.use((socket, next) => {
    let clientId = socket.handshake.headers['x-clientid'];
    if (clientId === "APIKEYMOTHERFUCKER") {
        return next();
    }
    console.log("Nope...");
    return next(new Error('Authentication error'));
});

io.on('connection', function(socket){
    socket.emit('response', "Successfully Connected");
    console.log('a user connected ' + socket.id);
    socket.on('disconnect', function(){
        console.log('user diconnected');
    });
    socket.on('action', function(msg){
        let myHeaders = {
            "conID" : socket.id
        };
        let options = {};
        options.headers = myHeaders;
        fetch(`http://${sleeper}:4000/`, options)
        .then(res => res.text())
        .then((body) => {
            console.log(body);
            io.emit("response", body);
        }).catch((err) => {
            console.log(err.message);
            io.emit("response", err.message)
    });

    });
});

http.listen(3000, function(){
    console.log('listening on port: 3000');
});