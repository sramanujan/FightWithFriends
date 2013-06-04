var couchbase = require("couchbase");
var fs = require('fs');
var configFilename = 'config.json';

this.bucket = null;

this.init = function() {
    if (fs.existsSync(configFilename)) {
        config = JSON.parse(fs.readFileSync(configFilename));
    } else {
        console.log(configFilename + " not found. Using default");
        config = { };
    }
    couchbase.connect(config, function(err, bucket) {
        if (err) {
            console.log("Came to error1");
            throw err;
        }
        this.bucket = bucket;
    });
}

this.playerTemplate = { 
    id: "",
    first_name: "",
    last_name: "",
    gender: "",
    timezone: 0,
    username: "",
    level: 1,
    defence_xp: 1,
    attack_xp: 1
};

this.isValidPlayerObject = function(playerObject) {
    return true;
}