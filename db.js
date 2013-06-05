var couchbase = require("couchbase");
var fs = require('fs');

var configFilename = 'config.json';

db = {}; 

db.playerTemplate = { 
    id: "",
    first_name: "",
    last_name: "",
    gender: "",
    timezone: 0,
    username: "",
    level: 1,
    defence_xp: 1,
    attack_xp: 1,
    kingdom: {
        theme: {
            background: "assets/img/background_map.png"
        }
        buildings: []
    }
};

db.isValidPlayerObject = function(playerObject) {
    return true;
}

if (fs.existsSync(configFilename)) {
    config = JSON.parse(fs.readFileSync(configFilename));
} else {
    config = { };
}

couchbase.connect(config, function(err, bucket) {
    if (err) {
        throw err;
    }
    db.bucket = bucket;
});