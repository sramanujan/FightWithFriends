var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(8028);

io.configure('development', function() {
    io.set('transports', ['xhr-polling']);
});

function handler (req, res) {
    fs.readFile(__dirname + '/index.html',
    function (err, data) {
    if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
    });
}

var room = 'defaultRoom';
var data_namespace = 'IOSOCKET';
var roomArray = new Array();
io.sockets.on('connection', function (socket) {

    socket[data_namespace] = {};

    console.log("Connection initiated.....");
    socket.roomUpdate = function(eventType) {
        room = socket[data_namespace].room;
        clientName = socket[data_namespace].clientName;
        var value = 'unknown';
        switch(eventType) {
            case 'join': value = { position: socket[data_namespace].targetPosition }; break;
            case 'leave': value = 'somerandomleave'; break;
            case 'update': 
                          value = new Array();
                          var clientList = io.sockets.clients(room);
                          for (var i = 0; i < clientList.length; i++) {
                              value.push( { clientName: clientList[i][data_namespace].clientName, position: clientList[i][data_namespace].targetPosition } );
                          }
                          break;
        }
        socket.broadcast.to(room).emit('roomUpdate', { clientName: clientName, eventName: eventType, value: value});
        //io.sockets.in(room).emit('roomUpdate', { clientName: clientName, eventName: eventType, value: value});
    }

    socket.on('setClientDetails', function (data) {
        console.log("setting client name and id");
        socket[data_namespace].clientName = data.name;
        socket[data_namespace].clientId = data.name;
        //at this point, connect to couchbase and check if this id is there, else add it.

        data.existingRooms = io.sockets.manager.rooms;
        socket.emit('registered', data);
    });
        
    socket.on('joinRoom', function (data) {
        socket.join(data.room);
        socket[data_namespace].room = data.room;
        socket[data_namespace].targetPosition = { x: 0, y: 0 };
        socket[data_namespace].currentPosition = { x: 0, y: 0 };
        value = new Array();
        var clientList = io.sockets.clients(data.room);
        for (var i = 0; i < clientList.length; i++) {
            value.push( { clientName: clientList[i][data_namespace].clientName, position: clientList[i][data_namespace].targetPosition } );
        }
        socket.emit('joined', { room: data.room, value: value });
        socket.roomUpdate('join');
    });

    socket.on('leaveRoom', function (data) {
        console.log("leave room...");
        socket.roomUpdate('leave');
        socket.leave(data.room);
        socket[data_namespace].room = null;
    });

    socket.on('stateUpdate', function (update) {
        console.log("Sent state update data...");
        socket[data_namespace].targetPosition = update.position;
        socket.roomUpdate('update');
    });

    socket.on('disconnect', function () {
        console.log("disconnect...");
        socket.roomUpdate('leave');
        socket.leave(socket[data_namespace].room);
        socket[data_namespace].room = null;
    });

});


setInterval(function() {
    var existingRooms = io.sockets.manager.rooms;
    for (var roomName in existingRooms) {
        var properName = roomName.replace('/','');
        if (properName == '' || properName == undefined || properName == 'undefined') {
            continue;
        }
        var clientList = io.sockets.clients(properName);
        var value = new Array();
        for (var i = 0; i < clientList.length; i++) {
            var remX = clientList[i][data_namespace].targetPosition.x - clientList[i][data_namespace].currentPosition.x;
            var remY = clientList[i][data_namespace].targetPosition.y - clientList[i][data_namespace].currentPosition.y;
            //dist is maximum distance you can move in one interval (in this case 100 ms) - lets say you can move 1/150th of game board... which would be 0.006
            var dist = 0.006;
            var totDist = Math.sqrt( Math.pow(remX, 2) + Math.pow(remY, 2) );
            if(totDist != 0) {
                if(totDist > dist) {
                    clientList[i][data_namespace].currentPosition.x += remX * (dist / totDist);
                    clientList[i][data_namespace].currentPosition.y += remY * (dist / totDist);  
                } else {
                    clientList[i][data_namespace].currentPosition.x += remX;
                    clientList[i][data_namespace].currentPosition.y += remY; 
                }  
            }
            value.push( { clientName: clientList[i][data_namespace].clientName, position: clientList[i][data_namespace].currentPosition } );
        }
        io.sockets.in(properName).emit('reAdjust', { value: value }); 
    }
}, 100);



