var SERVER = true;
//require('./db.js');
require('./protected/player.js');

var app = require('http').createServer();
var io = require('socket.io').listen(app);

app.listen(8028);

io.configure('development', function() {
    io.set('transports', ['xhr-polling']);
});
io.set('log level', 1); // reduce logging

var data_namespace = 'IOSOCKET';
var roomArray = new Array();
io.sockets.on('connection', function (socket) {

    socket[data_namespace] = {};
    console.log("Connection initiated.....");
    socket.roomUpdate = function(eventType) {
        room = socket[data_namespace].room;
        clientName = socket[data_namespace].player.name;
        clientId = socket[data_namespace].player.id;
        var value = 'unknown';
        switch(eventType) {
            case 'join': value = socket[data_namespace].player.getState(); break;
            case 'leave': value = 'somerandomleave'; break;
            case 'update': 
                          value = new Array();
                          var clientList = io.sockets.clients(room);
                          for (var i = 0; i < clientList.length; i++) {
                              value.push( clientList[i][data_namespace].player.getState() );
                          }
                          break;
        }
		console.log("sending event " + eventType);
        socket.broadcast.to(room).emit('roomUpdate', { clientName: clientName, clientId: clientId, eventName: eventType, value: value});
        //io.sockets.in(room).emit('roomUpdate', { clientName: clientName, eventName: eventType, value: value});
    }

    socket.on('setClientDetails', function (data) {
        console.log("setting client name and id");
        var data2 = { };
        socket[data_namespace].clientName = data.name;
        socket[data_namespace].clientId = data.id.toString();
        socket[data_namespace].player = new Player(data.name, data.id, true);
        if(true) {
			/*
            db.bucket.get(socket[data_namespace].clientId, function (err, doc, meta) {
                if(!doc || err || !db.isValidPlayerObject(doc)) {
                    doc = db.playerTemplate;
                    doc.id = data.id;
                    doc.first_name = data.first_name;
                    doc.last_name = data.last_name;
                    doc.gender = data.gender;
                    doc.timezone = data.timezone;
                    doc.username = data.username;
                    db.bucket.set(socket[data_namespace].clientId, doc, function(err, meta) {
                        if(err) {
                            console.log("GOT AN ERROR WHILE SETTING TO COUCHBASE");
                        }
                    });  
                } else {
                    data2.userDetails = doc;
                }
            });
			*/
            data2.existingRooms = io.sockets.manager.rooms;
            socket.emit('registered', data2);
        } else {
            console.log("COUCHBASE GLOBAL BUCKET NOT AVAILABLE!!");
        }
    });
    
	
	// this is called when 'I' join a room
    socket.on('joinRoom', function (data) {
        socket.join(data.room);
        socket[data_namespace].room = data.room;
        socket[data_namespace].targetPosition = { x: 0, y: 0 };
        socket[data_namespace].currentPosition = { x: 0, y: 0 };
        value = new Array();
        var clientList = io.sockets.clients(data.room);
        for (var i = 0; i < clientList.length; i++) {
            value.push( clientList[i][data_namespace].player.getState() );
        }
		console.log("user " + socket[data_namespace].player.name + " just joined - " + data.room);
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
        //socket.roomUpdate('update');
    });

    socket.on('updateState', function (update) {
		if (null != socket[data_namespace].player) {
			socket[data_namespace].player.updatePosition(update.states);
			//socket.roomUpdate('update');
		}
    });

    socket.on('disconnect', function () {
		if (null != socket[data_namespace].player) {
			console.log("disconnect... " + socket[data_namespace].player.name);
			socket.roomUpdate('leave');
			socket.leave(socket[data_namespace].room);
			socket[data_namespace].room = null;
		}
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
		var states = new Array();
        for (var i = 0; i < clientList.length; i++) {
			/*
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
			*/
            value.push( clientList[i][data_namespace].player.getState() );
        }
        io.sockets.in(properName).emit('reAdjust', { value : value }); 
    }
}, 100);



