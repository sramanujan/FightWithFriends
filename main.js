var cocos2dApp = cc.Application.extend({
    config:document['ccConfig'],
    ctor:function (scene) {
        this._super();
        this.startScene = scene;
        cc.COCOS2D_DEBUG = this.config['COCOS2D_DEBUG'];
        cc.initDebugSetting();
        cc.setup(this.config['tag']);
        cc.AppController.shareAppController().didFinishLaunchingWithOptions();
        GlobalGraphics.resize(canvasMain.width, canvasMain.height);
    },
    applicationDidFinishLaunching:function () {
        if(cc.RenderDoesnotSupport()){
            //show Information to user
            alert("Browser doesn't support WebGL");
            return false;
        }
        // initialize director
        var director = cc.Director.getInstance();

        // enable High Resource Mode(2x, such as iphone4) and maintains low resource on other devices.
        //director.enableRetinaDisplay(true);

        // turn on display FPS
        director.setDisplayStats(this.config['showFPS']);

        // set FPS. the default value is 1.0/60 if you don't call this
        director.setAnimationInterval(1.0 / this.config['frameRate']);

        //load resources
        cc.LoaderScene.preload(g_ressources, function () {
            director.replaceScene(new this.startScene());
        }, this);

        return true;
    }
});

if (navigator.userAgent.match(/iPad/)) {
    GLOBAL_PLATFORM = "ipad";
    SOCKETIO_HOST = '192.168.1.8';

    //document.addEventListener("deviceready", onDeviceReady, false);
} else if (navigator.userAgent.match(/Android/)) {
    GLOBAL_PLATFORM = "android";
    SOCKETIO_HOST = '192.168.1.8';
    //document.addEventListener("deviceready", onDeviceReady, false);
} else {
    GLOBAL_PLATFORM = "web";
    SOCKETIO_HOST = window.location.hostname;
    //onDeviceReady();
}


function onDeviceReady() {
    //navigator.notification.alert("Phonegap is working...");
}

login = "anonymous:" + Math.round(new Date().getTime()/1000).toString().slice(-5);
login_data = { id: login, username: login };
var numPlayersOnBoard   = 0;
var playersOnBoard  = {};
var battleMode = false;
var whoami = categories.Defender;
var listOfRooms;
var usableTowerCodes;
var usableUnitCodes;
var json_loaded = false;
var socket_loaded = false;
var myRoom = null;
var checkButtons = false;
var me = null;
var entities = new Array();
var numEntities = 0;
var projectiles = new Array();
var numInputs = 0;

if(typeof io == "undefined") {
    $.getScript('http://' + SOCKETIO_HOST + ':8028/socket.io/socket.io.js', function() {
        socket = io.connect('http://' + SOCKETIO_HOST + ':8028', { 'connect timeout': 10000 });
        socket_loaded = true;
        checkIfLoadComplete();
    });
}

$.getJSON('settings/items.json', function(data) {
    item_data = data;
    var jsonData = JSON.stringify(data);
    tower_data = filterData(data, "tower");
    unit_data = filterData(data,"unit");
    projectile_data = filterData(data, "projectile");
    json_loaded = true;
    checkIfLoadComplete();
});

function filterData(data, type) {
    var dest = {};
    for(key in data) {
        var obj = data[key];
        if(obj.type == type) {
            dest[key] = obj;
        }
    }
    return dest;
}

function checkIfLoadComplete() {
    if(json_loaded && socket_loaded) {
        makeEventListeners();
    }
}

function makeEventListeners() {
    socket.on('connect', function() {
        setClientDetails(login_data);
    });

    socket.on('disconnect', function() {
        //not sure if this is even required - might not even work...
        if(currentRoom != null) {
            leaveRoom();
        }
    });

    socket.on('iregistered', function(data) {
        console.log("i registered");
        //start own kingdom music.
        userDetails = data.userDetails;
        if (data.towers) {
            populateTowers(data.towers);
        }
        if (data.usableUnits && data.usableUnits.length > 0) {
            usableUnitCodes = data.usableUnits;
        }
        if (data.usableTowers && data.usableTowers.length > 0) {
            usableTowerCodes = data.usableTowers;
        }
        if (userDetails && userDetails.kingdom) {
            GlobalGraphics.loadKingdom(userDetails.kingdom);
        }
        myRoom = currentRoom = data.room;
        checkButtons = true;
    });

    socket.on('ijoined', function(data) {
        console.log("i joined " + data.room);
        currentRoom = data.room;
        if(data.numEntities >0 ) {
            for(var i =0 ; i<data.numEntities ; i++) {
                var entity = new Entity(data.entities[i].code,item_data,data.entities[i].owner, data.entities[i].isAIControlled,data.entities[i].isDefender, i);
                entity.updateTargetTile(data.entities[i].targetTilePosition);
                entity.updatePosition(data.entities[i].currentTilePosition);
                numEntities++;
                entities.push(entity);
            }

        }
        $.each(data.value, function(index, state) {
            if (state.id != me.id) {
                var opp = new Player(state.name, state.id, numPlayersOnBoard + 1);
                playersOnBoard[state.id] = opp;
                numPlayersOnBoard++;
            }
        });
        if (data.room == myRoom) {
            whoami          = categories.Defender;
            me.battle.whoami            = categories.Defender;
            me.battle.state             = "planning";
            endBattle();
        }
        else {
            whoami          = categories.Attacker;
            me.battle.whoami          = categories.Attacker;
            me.battle.state             = "inprogress";
            battleMode      = true;
            startBattle();
        }
        checkButtons = true;
        //GlobalGraphics.resumeRendering();
    });

    socket.on('roomUpdate', function (data) {
        var updateFrom = data.clientName;
        var updateFromId = data.clientId;
        var updateType = data.eventName;
        var value = data.value;
        if(updateType == 'join') {
            // this is called when an opponent joins
            // create an opponent player object
            var opp = new Player(updateFrom, updateFromId, numPlayersOnBoard+1);
            // add to the player list
            playersOnBoard[opp.id] = opp;
            numPlayersOnBoard++;
            
            // start battle if not already started
            if (!battleMode && whoami == categories.Defender) {
                battleMode = true;
                me.battle.state             = "inprogress";
            }
        } 
        else if(updateType == 'leave') {
            // first remove player from list
            if (playersOnBoard[updateFromId] != null) {
                playersOnBoard[updateFromId].leaveRoom();
                delete playersOnBoard[updateFromId];
                numPlayersOnBoard--;
            }
            // check if i am the last user, means all users left.. get out of battle mode
            if (numPlayersOnBoard <= 1) {
                if (whoami == categories.Defender) {
                    battleMode = false;
                }
                else {
                    // if iam attacking then leave room get home
                    returnToBase(myRoom);
                }
            }
        }
    });

    socket.on('updateRoomList', function (data) {
        if (battleMode == false) {
            listOfRooms = data.value.existingRooms;
        }
    });

    socket.on('parseInputs', function(data) {
        if(data.senderId == me.id) {
            return false;
        }
        var inputs = data.value;
        for(var key in inputs) {
            var input = inputs[key];
            var action = input.action;
            var params = input.params;
        //Will have to replace with anonymous function logic
            if(action == "addEntity" ) {
                var entity = new Entity(params.code,item_data,params.owner, params.isAIControlled,params.isDefender, numEntities);
                numEntities++ ;
                if(entities == null) {
                    entities = new Array();
                }
                entities[entity.index] = entity;
            }
            if(action == "updateTargetPosition") {
                var index = params.entityIndex;
                var position = new Position(params.x,params.y);
                entities[index].updateTargetTile(position);
            }
        }
    });
}

function setClientDetails(data) {
    me = new Player(data.username, data.id, numPlayersOnBoard+1);
    playersOnBoard[me.id] = me;
    numPlayersOnBoard++;
    $("#whoami").html(me.name);
    socket.emit('login', data);
}

function joinRoom(roomName) {
    //GlobalGraphics.pauseRendering();
    // leave the room you are in
    leaveRoom();    
    socket.emit('joinRoom', { room: roomName });
}

function leaveRoom() {
    battleMode = false;
    // reset the player units and towers before leaving
    removeAllPlayersExceptMe();
    
    //me.leaveRoom();
    socket.emit('leaveRoom', { room: currentRoom });
}

function returnToBase() {
    joinRoom(myRoom);
}

function removeAllPlayersExceptMe() {
    for (var key in playersOnBoard) {
        if (key != "undefined") {
            //playersOnBoard[key].leaveRoom();
            if (me.id != key && playersOnBoard[key] != null) {
                delete playersOnBoard[key];
                numPlayersOnBoard--;
            }
        }
    }
}

function populateTowers(listOfTowers) {
    console.log("populateTowers");
    for (var i = listOfTowers.length - 1; i >= 0; i--) {
        addTower(listOfTowers[i], me.id)
    }
}

function addTower(tower , owner) {
    var myTower = new Entity(tower.code,tower_data,owner, false, true, numEntities);
    numEntities++;
    entities.push(myTower);
    var params = {code: tower.code, owner: owner,isAIControlled: false, isDefender: true};
    var input = {action: "addEntity", params: params };
    globalInputs[numInputs] = input;
    numInputs++;
}

function addUnit(unit) {
    var entity = new Entity(unit.code,item_data, me.id, true, false, numEntities);
    numEntities++;
    entities.push(entity);
    var params = {code: entity.code, owner: me.id,isAIControlled: true, isDefender: false};
    var input = {action: "addEntity", params: params };
    globalInputs[numInputs] = input;
    numInputs++;
}

//var timer = setInterval( entityUpdate, 100);

function entityUpdate() {
    for(var i = 0 ;i <numEntities ; i++) {
        entities[i].update();
        if(entities[i].state == "alive") {
            entities[i].resolveBattle(entities);
        }
    }
    pushToServer();
}

function pushToServer() {
    if(numInputs != 0) {
        socket.emit('parseInputs',{senderId: me.id, inputs: globalInputs});
        numInputs = 0;
        globalInputs = {};
    }
}

function runUpdateLoop() {
    for(var i = 0 ;i <numEntities ; i++) {
        entities[i].updateDisplay();
    }
    for(var j = 0 ;j <projectiles.length ; j++) {
        if(projectiles[j].update(new Date().getTime()) == false) {
            projectiles.splice(j,1);
        }
    }
}

var mainApp = new cocos2dApp(MainScene);
