package com.fwf.fightwithfriends;

import org.apache.cordova.DroidGap;

import android.os.Bundle;
import android.view.Menu;

public class FirstActivity extends DroidGap {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //setContentView(R.layout.activity_first);
        super.loadUrl("file:///android_asset/www/index.html");
    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.first, menu);
        return true;
    }
    
}
