audio_files = [
{
    name: "battle_music",
    source: "assets/sound/battle_music.mp3"
},
{
    name: "big_fire_sound",
    source: "assets/sound/big_fire_sound.mp3"
},
{
    name: "bullet_sound",
    source: "assets/sound/bullet_sound.mp3"
},
{
    name: "defeat_sound",
    source: "assets/sound/defeat_sound.mp3"
},
{
    name: "own_kingdom_music",
    source: "assets/sound/own_kingdom_music.mp3"
},
{
    name: "victory_sound",
    source: "assets/sound/victory_sound.mp3"
}
];


GlobalAudio = {};
GlobalAudio.addNewAudio = function(audioData) {
    var audio = document.createElement("audio");
    audio.src = audioData.source;
    GlobalAudio.list[audioData.name] = audio;
};
GlobalAudio.init = function() {
    GlobalAudio.list = new Array();
    for( var i = audio_files.length -1; i >=0; i--) {
        GlobalAudio.addNewAudio(audio_files[i]);
    }
};
GlobalAudio.pauseAll = function() {
    for( var key in GlobalAudio.list) {
        GlobalAudio.list[key].pause();
    }
};
GlobalAudio.stopAll = GlobalAudio.resetAll = function() {
    for( var key in GlobalAudio.list) {
        GlobalAudio.list[key].pause();
        GlobalAudio.list[key].currentTime = 0;
    }
};
GlobalAudio.play = function(name) {
    GlobalAudio.list[name].currentTime = 0;
    GlobalAudio.list[name].play();
}
GlobalAudio.resume = function(name) {
    GlobalAudio.list[name].play();
}
GlobalAudio.pause = function(name) {
    GlobalAudio.list[name].pause();
}
GlobalAudio.stop = function(name) {
    GlobalAudio.list[name].pause();
    GlobalAudio.list[name].currentTime = 0;
}