package ds.mesh.project.home.view;

import android.content.Intent;
import android.support.v4.app.Fragment;
import android.content.Context;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.LayerDrawable;
import android.os.Bundle;

import android.support.v4.app.FragmentManager;
import android.util.Log;
import android.support.design.widget.NavigationView;
import android.support.v4.view.GravityCompat;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBarDrawerToggle;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.TextView;

import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallbackExtended;
import org.eclipse.paho.client.mqttv3.MqttMessage;

import java.util.Random;
import java.util.Timer;
import java.util.TimerTask;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


import android.net.Uri;

import ds.mesh.project.BadgeDrawable;
import ds.mesh.project.R;
//import ds.mesh.project.custom_view.GaugeView;
import ds.mesh.project.custom_view.Thermometer;
import ds.mesh.project.fragments.NodeOne;
import ds.mesh.project.fragments.NodeThree;
import ds.mesh.project.fragments.NodeTwo;
import ds.mesh.project.fragments.WeatherFragment;
import ds.mesh.project.mqtt.MqttHelper;
import me.itangqi.waveloadingview.WaveLoadingView;

public class HomeActivity extends AppCompatActivity
        implements NavigationView.OnNavigationItemSelectedListener,OnFragmentInteractionListener {



    //private GaugeView mGaugeView1;
    //private GaugeView mGaugeView2;
//    private Thermometer thermometer;
//    private TextView mTvDataTransferRate;
//    private WaveLoadingView mWaveLoadingView;
//    private TextView mTvHumidity;
//    private TextView mTvTemperature;

    private float temperature;
    private int gas;
    private int humidity;
    private int dataTransferRate;
    private Timer timer;
    private final Random RAND = new Random();

    MqttHelper mqttHelper;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(
                this, drawer, toolbar, R.string.navigation_drawer_open, R.string.navigation_drawer_close);
        drawer.addDrawerListener(toggle);
        toggle.syncState();

        NavigationView navigationView = (NavigationView) findViewById(R.id.nav_view);
        navigationView.setNavigationItemSelectedListener(this);

        // Set the home as default
        Fragment fragment = new NodeOne();
        FragmentManager fragmentManager = getSupportFragmentManager();
        fragmentManager.beginTransaction()
                .replace(R.id.frame, fragment)
                .commit();

//        setupViews();
//        //mGaugeView1.setTargetValue(0);
//
//        startMqtt();
    }

    @Override
    public void onFragmentInteraction(Uri uri) {

    }


    @Override
    public void onBackPressed() {
        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        if (drawer.isDrawerOpen(GravityCompat.START)) {
            drawer.closeDrawer(GravityCompat.START);
        } else {
            super.onBackPressed();
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.home, menu);

        MenuItem itemCart = menu.findItem(R.id.action_notification);
        LayerDrawable icon = (LayerDrawable) itemCart.getIcon();
        setBadgeCount(this, icon, "9");

        //return true;

        return super.onCreateOptionsMenu(menu);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_notification) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    @SuppressWarnings("StatementWithEmptyBody")
    @Override
    public boolean onNavigationItemSelected(MenuItem item) {
        // Handle navigation view item clicks here.
        int id = item.getItemId();

        Fragment fragment = null;

        if (id == R.id.nav_device1) {
            fragment =new NodeOne();

        } else if (id == R.id.nav_device2) {

            fragment =new NodeTwo();
        }
         else if (id == R.id.nav_device3) {
            fragment = new NodeThree();
        }
//
         else if (id == R.id.nav_weather) {
            fragment = new WeatherFragment();

        }
//
//        } else if (id == R.id.nav_share) {
//
//        } else if (id == R.id.nav_send) {
//
//        }

        if(fragment != null) {
            // Insert the fragment by replacing any existing fragment
            FragmentManager fragmentManager = getSupportFragmentManager();
            fragmentManager.beginTransaction()
                    .replace(R.id.frame, fragment)
                    .commit();
        }

        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        drawer.closeDrawer(GravityCompat.START);
        return true;
    }


    public static void setBadgeCount(Context context, LayerDrawable icon, String count) {

        BadgeDrawable badge;

        // Reuse drawable if possible
        Drawable reuse = icon.findDrawableByLayerId(R.id.ic_badge);
        if (reuse != null && reuse instanceof BadgeDrawable) {
            badge = (BadgeDrawable) reuse;
        } else {
            badge = new BadgeDrawable(context);
        }

        badge.setCount(count);
        icon.mutate();
        icon.setDrawableByLayerId(R.id.ic_badge, badge);
    }

    @Override
    protected void onResume() {
        super.onResume();
        //simulateDashboardValues();
    }

    @Override
    protected void onPause() {
        super.onPause();
        unregisterAll();
    }

    //--------------------------
    // functions
    //--------------------------

//    private void setupViews() {
//        //mGaugeView1 = (GaugeView) findViewById(R.id.gauge_view1);
//        //mGaugeView2 = (GaugeView) findViewById(R.id.gauge_view2);
//        thermometer = (Thermometer) findViewById(R.id.thermometer);
//        mTvDataTransferRate = (TextView) findViewById(R.id.tv_data_transfer);
//        mTvHumidity = (TextView) findViewById(R.id.tv_humidity);
//        mTvTemperature = (TextView) findViewById(R.id.tv_temp_value);
//        mWaveLoadingView = (WaveLoadingView) findViewById(R.id.waveLoadingView);
//        //mTimer.start();
//
//    }


//
//    private final CountDownTimer mTimer = new CountDownTimer(60000, 3000) {
//
//        @Override
//        public void onTick(final long millisUntilFinished) {
//            mGaugeView1.setTargetValue(RAND.nextInt(101));
//            mGaugeView2.setTargetValue(RAND.nextInt(101));
//        }
//
//        @Override
//        public void onFinish() {}
//    };

//    private void simulateDashboardValues() {
//        timer = new Timer();
//
//        timer.scheduleAtFixedRate(new TimerTask() {
//
//            @Override
//            public void run() {
//                //temperature =  13; //Utils.randInt(-10, 35);
//
//                int minTemp = 0;
//                int maxTemp = 60;
//
//                int minGas = 0;
//                int maxGas = 120;
//
//                int minHumidity = 0;
//                int maxHumidity = 100;
//
//                int minTransfer = 0;
//                int maxTransfer = 512;
//
//                Random r = new Random();
//                temperature = r.nextInt(maxTemp - minTemp + 1) + minTemp;
//                gas = r.nextInt(maxGas - minGas + 1) + minGas;
//                humidity = r.nextInt(maxHumidity - minHumidity + 1) + minHumidity;
//                dataTransferRate = r.nextInt(maxTransfer - minTransfer + 1) + minTransfer;
//
//                runOnUiThread(new Runnable() {
//                    @Override
//                    public void run() {
//                        thermometer.setCurrentTemp(temperature);
//                        mTvTemperature.setText(String.valueOf(Math.round(temperature)) + "°"+"c");
//                        mGaugeView1.setTargetValue(gas);
//                        mTvDataTransferRate.setText(String.valueOf(dataTransferRate) + " kb/s");
//                        mTvHumidity.setText(String.valueOf(humidity));
//                    }
//                });
//            }
//        }, 0, 3500);
//    }

    private void unregisterAll() {
        timer.cancel();
    }

//    private void startMqtt(){
//        mqttHelper = new MqttHelper(getApplicationContext());
//        mqttHelper.setCallback(new MqttCallbackExtended() {
//            @Override
//            public void connectComplete(boolean b, String s) {
//
//            }
//
//            @Override
//            public void connectionLost(Throwable throwable) {
//
//            }
//
//            @Override
//            public void messageArrived(String topic, MqttMessage mqttMessage) throws Exception {
//                Log.e("Mqtt_Debug",topic + ": "+mqttMessage.toString());
//                String meshMessage = mqttMessage.toString();
//                JSONObject meshMQTTobj = new JSONObject(meshMessage);
//
//                String deviceName = meshMQTTobj.getString("device");
//                //String nodeID = meshMQTTobj.getString("nodeID");
//                int Temperature = meshMQTTobj.getInt("temperature");
//                int  Moisture = meshMQTTobj.getInt("moisture");
//                int WaterLevel = meshMQTTobj.getInt("waterLevel");
//
//                Log.e("Device Debug",topic + ": "+deviceName);
//
//                //Log.w("viewValue", Temperature.toString());
//
//                //Integer gasReadingInt = Integer.parseInt(gasReading);
//                if(deviceName.equals("ls")) {
//                    thermometer.setCurrentTemp(Temperature);
//                    mTvTemperature.setText(Temperature + "°" + "c");
//                    mWaveLoadingView.setProgressValue(WaterLevel);
//                    mWaveLoadingView.setCenterTitle(String.valueOf(WaterLevel) + "mm");
//                    mTvHumidity.setText(String.valueOf(Moisture));
//                    //mGaugeView1.setTargetValue(gasReadingInt);
//                }
//
//            }
//
//            @Override
//            public void deliveryComplete(IMqttDeliveryToken iMqttDeliveryToken) {
//
//            }
//        });
//    }

}
