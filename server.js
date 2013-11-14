var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var cookie  = require('cookie');
var connect = require('connect');
var secret = 'Askindl23@146Fscmaijnd523CXVWGN#63@#7efbsd23#$Rb';


var util = require('util');

var bcrypt = require('bcrypt');
bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash('pass', salt, function(err, hash) {
        console.log('pass', hash);
    });
});


var app = express();

app.set('port', process.env.PORT || 4130);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: secret, key: 'express.sid'}));

app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));


if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
//app.get('/users', user.list);

var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

var webRTC = require('webrtc.io').listen(4000);

var sessionobj = {};
var io = require('socket.io').listen(server);
var pin = '41300048';

io.configure('production', function(){
    io.enable('browser client minification');
    io.enable('browser client etag');
    io.enable('browser client gzip');
    io.set('log level', 1);

    io.set('transports', [
        'websocket'
        , 'flashsocket'
        , 'htmlfile'
        , 'xhr-polling'
        , 'jsonp-polling'
    ]);
});

//io.configure('development', function(){
//    io.set('transports', ['websocket']);
//});

io.set('authorization', function (handshakeData, accept) {

    if (handshakeData.headers.cookie) {

        handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);

        handshakeData.sessionID = connect.utils.parseSignedCookie(handshakeData.cookie['express.sid'], secret);

        console.log('********************', handshakeData.headers.cookie);
        console.log('********************', handshakeData.sessionID);

        if (handshakeData.cookie['express.sid'] == handshakeData.sessionID) {
            return accept('Cookie is invalid.', false);
        }
    } else {
        return accept('No cookie transmitted.', false);
    }

    accept(null, true);
});


var clients = [];
var devices = [];

io.sockets.on('connection', function (socket) {
    var mac = socket.handshake.address;

    var sessId = socket.handshake.sessionID;
    console.log('*********connection', mac, sessId);
    var yup = sessionobj[sessId];

    console.log('session id', sessId, yup);

    if(yup === true)
        socket.emit('init', devices);
    else
        socket.emit('yup', false);

    socket.on('disconnect', function() {
        if(clients.indexOf(socket) > -1) {
            clients.splice(clients.indexOf(socket), 1);
        }
    });

    socket.on('yup', function (data) {
        data = data || {};
        yup = (data.pin === pin);
        console.log('yup', JSON.stringify(data));

        if(yup === true) {
            sessionobj[sessId] = data.remember || false;
            socket.emit('init', devices);
            clients.push(socket);
        } else {
            if(clients.indexOf(socket) > -1) {
                clients.remove(socket);
            }
            sessionobj[sessId] = false;
            socket.emit('yup', false);
        }
    });

    socket.on('change', function (data) {
        if(yup !== true) {
            if(clients.indexOf(socket) > -1) {
                clients.remove(socket);
            }
            socket.emit('yup', false);
            return;
        }
        var device;
        //console.log(devices, data.id);

        for(var i = 0, il = devices.length; i < il; i++) {
            if(devices[i].id.toString() === data.id.toString()) {
                device = devices[i];
                break;
            }
        }
        //console.log('device', device);
        if(typeof device !== 'undefined' && device !== null) {
            var w = workers[device.socketId];

            if(w) {
                w.socket.emit('change', data);
            }
        } else
            console.log("can't find device for id ", data.id);
    });

});
