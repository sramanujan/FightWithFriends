var SERVER = true;
require('./db.js');
// db={enabled:false};
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


unit_data = JSON.parse(fs.readFileSync("settings/units.json"));
tower_data = JSON.parse(fs.readFileSync("settings/towers.json"));

io.sockets.on('connection', function (socket) {

    socket[data_namespace] = {};
    console.log("Connection initiated.....");
    socket.roomUpdate = function(eventType) {
		if (socket[data_namespace].player) {
			room = socket[data_namespace].currentRoom;
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
			console.log("sending event " + eventType + " to room " + room + " for user " + clientName);
			socket.broadcast.to(room).emit('roomUpdate', { clientName: clientName, clientId: clientId, eventName: eventType, value: value});
		}
        //io.sockets.in(room).emit('roomUpdate', { clientName: clientName, eventName: eventType, value: value});
    }

    socket.sendUserDetails = function(userDetails) {
        var data = { userDetails: userDetails };
        data.room = socket[data_namespace].player.name;
        //TODO: Based on user's level and xp and all that, populate this list
        data.usableUnits = new Array();
        data.usableTowers = new Array();
        for (var code in unit_data) {
            for (var requirement in unit_data[code].requirements) {
                if (unit_data[code].requirements[requirement] >= data.userDetails[requirement]) {
                    data.usableUnits.push(code);
                }
            }
        }
        for (var code in tower_data) {
            for (var requirement in tower_data[code].requirements) {
                if (tower_data[code].requirements[requirement] >= data.userDetails[requirement]) {
                    data.usableTowers.push(code);
                }
            }
        }
        socket.join(socket[data_namespace].player.name);
		socket[data_namespace].myRoom = socket[data_namespace].currentRoom = socket[data_namespace].player.name;
        socket.emit('iregistered', data);
    }

    socket.on('login', function (data) {
        console.log("login name and id [" + data.username + ":" + data.id +"]");
        if(data.id.split(':')[0] == "anonymous") {
            socket[data_namespace].db_bucket = db.anonymousBucket;  
        } else {
            socket[data_namespace].db_bucket = db.bucket;
        }
        var data2 = {};
        socket[data_namespace].player = new Player(data.username, data.id, true, 0);
        if(db.enabled) {
            socket[data_namespace].db_bucket.get(socket[data_namespace].player.id, function (err, doc, meta) {
                if(!doc || err || !db.isValidPlayerObject(doc)) {
                    doc = db.playerTemplate;
                    doc.id = data.id;
                    doc.username = data.username;
                    socket[data_namespace].db_bucket.set(socket[data_namespace].player.id, doc, function(err, meta) {
                        if(err) {
                            console.log("GOT AN ERROR WHILE SETTING TO COUCHBASE");
                            return;
                        } else {
                            socket.sendUserDetails(doc);
                        }
                    });  
                } else {
                    socket.sendUserDetails(doc);
                }
            });
        } else {
            console.log("COUCHBASE GLOBAL BUCKET NOT AVAILABLE!!");
			//socket.sendUserDetails( { id: data.id, username: data.username, level: 1, kingdom: { theme: {background: "assets/img/background_map_3.png"}}});
        }
    });
    

    socket.on('saveTowers', function (update) {
        console.log("Saving towers...");
        console.log(update);
		if (null != socket[data_namespace].player) {
			socket[data_namespace].player.updatePosition(update.states);
            if(db.enabled) {
                socket[data_namespace].db_bucket.get(socket[data_namespace].player.id, function (err, doc, meta) {
                    if(!doc || err || !db.isValidPlayerObject(doc)) {
                        console.log("SOME ERROR FETCHING BLOB!!");
                    } else {
                        var towers = new Array();
                        for (var key in update.states.towers) {
                            towers.push({code: update.states.towers[key].code, position: update.states.towers[key].position});
                        }
                        doc.towers = towers;
                        socket[data_namespace].db_bucket.set(socket[data_namespace].player.id, doc, function(err, meta) {
                            if(err) {
                                console.log("GOT AN ERROR WHILE SETTING TO COUCHBASE");
                            }
                        });
                    }
                });    
            }
		}
    });
	
	// this is called when 'I' join a room
    socket.on('joinRoom', function (data) {
        socket.join(data.room);
        socket[data_namespace].currentRoom = data.room;
		if (socket[data_namespace].myRoom == socket[data_namespace].currentRoom) {
			socket[data_namespace].player.battle.state = "planning";
			socket[data_namespace].player.battle.whoami = categories.Defender;
			socket[data_namespace].player.units = {};
		}
		else {
			socket[data_namespace].player.battle.state = "inprogress";
			socket[data_namespace].player.battle.whoami = categories.Attacker;
		}
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
        socket[data_namespace].currentRoom = null;
    });

    socket.on('updateState', function (update) {
		if (null != socket[data_namespace].player) {
			socket[data_namespace].player.updatePosition(update.states);
            if(socket[data_namespace].player.unitsOnBoard() > 0) {
                // console.log("Message from attacker");
            }
            else if(socket[data_namespace].player.towersOnBoard() > 0) {
                // console.log("Message from defencer");
            }
			//socket.roomUpdate('update');
		}
    });

    socket.on('disconnect', function () {
		if (null != socket[data_namespace].player) {
			console.log("disconnect... " + socket[data_namespace].player.name);
			socket.roomUpdate('leave');
			socket.leave(socket[data_namespace].currentRoom);
			socket[data_namespace].currentRoom = null;
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
        var battleOver = false;
        var value = new Array();
		var states = new Array();
        for (var i = 0; i < clientList.length; i++) {
            value.push( clientList[i][data_namespace].player.getState() );
            if(clientList[i][data_namespace].player.battle.state == "over") {
                // battleOver = true;
				console.log("and we have a winner");
				value = { battleOver: true, victor : clientList[i][data_namespace].player.battle.victor };
                break;
            }
        }
		// if(battleOver) {
            // value = { battleOver: true };
            // for (var i = 0; i < clientList.length; i++) {
                //clientList[i][data_namespace].player.performAfterEffectsAndReset();
            // } 
        // }
        io.sockets.in(properName).emit('reAdjust', { value : value, room : properName }); 
    }
	
}, 100);

// update room once in 10 secs
setInterval(function() {
	data = {}
	data.existingRooms = io.sockets.manager.rooms;
	io.sockets.emit('updateRoomList', { value : data});
}, 10000);
