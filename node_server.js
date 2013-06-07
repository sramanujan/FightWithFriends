var SERVER = true;
//require('./db.js');
require('./protected/player.js');
var fs = require('fs');

var app = require('http').createServer();
var io = require('socket.io').listen(app);

app.listen(8028);

io.configure('development', function() {
    io.set('transports', ['xhr-polling']);
});
io.set('log level', 1); // reduce logging

var data_namespace = 'IOSOCKET';
var roomArray = new Array();


unit_data = JSON.parse(fs.readFileSync("units.json"));
tower_data = JSON.parse(fs.readFileSync("towers.json"));

io.sockets.on('connection', function (socket) {

    socket[data_namespace] = {};
    console.log("Connection initiated.....");
    socket.roomUpdate = function(eventType) {
		if (socket[data_namespace].player) {
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
			console.log("sending event " + eventType + " for user " + clientName);
			socket.broadcast.to(room).emit('roomUpdate', { clientName: clientName, clientId: clientId, eventName: eventType, value: value});
		}
        //io.sockets.in(room).emit('roomUpdate', { clientName: clientName, eventName: eventType, value: value});
    }

    socket.on('login', function (data) {
        console.log("login name and id [" + data.name + ":" + data.id +"]");
        var data2 = {};
//        socket[data_namespace].clientName = data.name;
//        socket[data_namespace].clientId = data.id.toString();
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

            //this should have an array of tower id and position.
			/*
            data2.towers = new Array();
            data2.towers.push({
                code: "001",
                position: { x: 0.50, y: 0.100 }
            });
			*/
            data2.existingRooms = io.sockets.manager.rooms;
            data2.room = socket[data_namespace].player.name;
			
			// join my own room first
			socket.join(socket[data_namespace].player.name);
            socket.emit('iregistered', data2);
        } else {
            console.log("COUCHBASE GLOBAL BUCKET NOT AVAILABLE!!");
        }
    });
    

    socket.on('saveTowers', function (update) {
        console.log("Saving towers...");
        console.log(update);
        //do db update here.
		if (null != socket[data_namespace].player) {
			socket[data_namespace].player.updatePosition(update.states);
			//socket.roomUpdate('update');
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
        socket.emit('ijoined', { room: data.room, value: value });
        socket.roomUpdate('join');
    });

    socket.on('leaveRoom', function (data) {
        console.log("leave room... " + data.room);
        socket.roomUpdate('leave');
        socket.leave(data.room);
        socket[data_namespace].room = null;
    });
/*
    socket.on('stateUpdate', function (update) {
        console.log("Sent state update data...");
        socket[data_namespace].targetPosition = update.position;
        //socket.roomUpdate('update');
    });
*/
    socket.on('updateState', function (update) {
		if (null != socket[data_namespace].player) {
			socket[data_namespace].player.updatePosition(update.states);
            if(socket[data_namespace].player.unitsOnBoard() > 0) {
                console.log("Message from attacker");
            }
            else if(socket[data_namespace].player.towersOnBoard() > 0) {
                console.log("Message from defencer");
            }
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
		var rand = Math.floor(Math.random()*11);
		if (rand == 1) {
			console.log("readjust for room " + properName + " = " + JSON.stringify(value));
		}
		
        io.sockets.in(properName).emit('reAdjust', { value : value }); 
    }
}, 100);
