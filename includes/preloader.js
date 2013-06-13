unit_data = {};
unit_data_loaded = false;
projectile_data = {};
projectile_data_loaded = false;
preload_callback = null;

function preload(callback) {
    preload_callback = callback;
    $.getJSON('settings/units.json', function(data) {
        unit_data = data;
        unit_data_loaded = true;
        checkIfPreloadComplete();
    });
    $.getJSON('settings/projectiles.json', function(data) {
        projectile_data = data;
        projectile_data_loaded = true;
        checkIfPreloadComplete();
    });
}

function checkIfPreloadComplete() {
    if( unit_data_loaded &&
        projectile_data_loaded
        ) {
        onPreloadComplete();
    }
}

function onPreloadComplete() {
    preload_callback();
}