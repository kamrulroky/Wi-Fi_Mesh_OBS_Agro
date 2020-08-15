package ds.mesh.project.fragments;

import android.support.v4.app.Fragment;
import android.content.Context;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallbackExtended;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.json.JSONObject;

import ds.mesh.project.R;
import ds.mesh.project.custom_view.Thermometer;
import ds.mesh.project.home.view.OnFragmentInteractionListener;
import ds.mesh.project.mqtt.MqttHelper;
import me.itangqi.waveloadingview.WaveLoadingView;

/**
 * Created by kamru on 2/8/2018.
 */

public class NodeThree extends Fragment {
    // TODO: Rename parameter arguments, choose names that match
    // the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
    private static final String ARG_PARAM1 = "param1";
    private static final String ARG_PARAM2 = "param2";

    // TODO: Rename and change types of parameters
    private String mParam1;
    private String mParam2;

    private OnFragmentInteractionListener mListener;

    private Thermometer thermometer;
    private TextView mTvDataTransferRate;
    private WaveLoadingView mWaveLoadingView;
    private TextView mTvHumidity;
    private TextView mTvTemperature;
    private  TextView mTvNode;
    MqttHelper mqttHelper;

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @param param1 Parameter 1.
     * @param param2 Parameter 2.
     * @return A new instance of fragment HomeFragment.
     */
    // TODO: Rename and change types and number of parameters
    public static NodeThree newInstance(String param1, String param2) {
        NodeThree fragment = new NodeThree();
        Bundle args = new Bundle();
        args.putString(ARG_PARAM1, param1);
        args.putString(ARG_PARAM2, param2);
        fragment.setArguments(args);
        return fragment;
    }

    public NodeThree() {
        // Required empty public constructor
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            mParam1 = getArguments().getString(ARG_PARAM1);
            mParam2 = getArguments().getString(ARG_PARAM2);
        }
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.node_details, container, false);
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        setupViews();
        startMqtt();
    }

    // TODO: Rename method, update argument and hook method into UI event
    // TODO: Rename method, update argument and hook method into UI event
    public void onButtonPressed(Uri uri) {
        if (mListener != null) {
            mListener.onFragmentInteraction(uri);
        }
    }

    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        try {
            mListener = (OnFragmentInteractionListener) context;
        } catch (ClassCastException e) {
            throw new ClassCastException(context.toString()
                    + " must implement OnFragmentInteractionListener");
        }
    }

    @Override
    public void onDetach() {
        super.onDetach();
        mListener = null;
    }

    private void setupViews() {
        //mGaugeView1 = (GaugeView) findViewById(R.id.gauge_view1);
        //mGaugeView2 = (GaugeView) findViewById(R.id.gauge_view2);
        thermometer = (Thermometer) getView().findViewById(R.id.thermometer);
        mTvDataTransferRate = (TextView) getView().findViewById(R.id.tv_data_transfer);
        mTvHumidity = (TextView) getView().findViewById(R.id.tv_humidity);
        mTvTemperature = (TextView) getView().findViewById(R.id.tv_temp_value);
        mWaveLoadingView = (WaveLoadingView) getView().findViewById(R.id.waveLoadingView);
        mTvNode = (TextView) getView().findViewById(R.id.tv_node);
        //mTimer.start();

    }
    private void startMqtt(){
        mqttHelper = new MqttHelper(getActivity().getApplicationContext());
        mqttHelper.setCallback(new MqttCallbackExtended() {
            @Override
            public void connectComplete(boolean b, String s) {

            }

            @Override
            public void connectionLost(Throwable throwable) {

            }

            @Override
            public void messageArrived(String topic, MqttMessage mqttMessage) throws Exception {
                Log.e("Mqtt_Debug",topic + ": "+mqttMessage.toString());
                String meshMessage = mqttMessage.toString();
                JSONObject meshMQTTobj = new JSONObject(meshMessage);

                String deviceName = meshMQTTobj.getString("device");
                //String nodeID = meshMQTTobj.getString("nodeID");
                int Temperature = meshMQTTobj.getInt("temperature");
                int  Moisture = meshMQTTobj.getInt("moisture");
                int WaterLevel = meshMQTTobj.getInt("waterLevel");

                Log.e("Device Debug",topic + ": "+deviceName);

                //Log.w("viewValue", Temperature.toString());

                //Integer gasReadingInt = Integer.parseInt(gasReading);
                if(deviceName.equals("lc2")) {
                    thermometer.setCurrentTemp(Temperature);
                    mTvTemperature.setText(Temperature + "°" + "c");
                    mWaveLoadingView.setProgressValue(WaterLevel);
                    mWaveLoadingView.setCenterTitle(String.valueOf(WaterLevel) + "mm");
                    mTvHumidity.setText(String.valueOf(Moisture));
                    mTvNode.setText("3");
                    //mGaugeView1.setTargetValue(gasReadingInt);
                }

            }

            @Override
            public void deliveryComplete(IMqttDeliveryToken iMqttDeliveryToken) {

            }
        });
    }

}
