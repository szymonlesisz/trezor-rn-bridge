package com.rnbridge;

import android.widget.Toast;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;

import java.util.Map;
import java.util.HashMap;
import java.util.List;

import com.rnbridge.USBBridge;
import com.rnbridge.USBBridge.TrezorDevice;

public class RNBridgeModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    private static final String DURATION_SHORT_KEY = "SHORT";
    private static final String DURATION_LONG_KEY = "LONG";
    private static final String bridgeUrl = "http://127.0.0.1:21325";
    private static final int DURATION = 5;
    private static USBBridge bridge;

    RNBridgeModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
        bridge = new USBBridge(context);
    }

    @Override
    public String getName() {
        return "RNBridge";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put(DURATION_SHORT_KEY, Toast.LENGTH_SHORT);
        constants.put(DURATION_LONG_KEY, Toast.LENGTH_LONG);
        return constants;
    }

    @ReactMethod
    public void enumerate(
        ReadableMap params,
        Promise promise
    ) {
        try {
            List<TrezorDevice> trezorDeviceList = bridge.enumerate();
            Toast.makeText(getReactApplicationContext(), "enumerated: "+trezorDeviceList.toString(), DURATION).show();
            promise.resolve("success");
        } catch (Exception e) {
            promise.reject("error");
        }
    }

    @ReactMethod
    public void listen(
        ReadableMap params,
        Promise promise
    ) {
        final String previous = params.getString("previous"); 
        try {
            Toast.makeText(getReactApplicationContext(), "listen" + ' ' + previous, DURATION).show();
            promise.resolve("success");
        } catch (Exception e) {
            promise.reject("error");
        }
    }

    @ReactMethod
    public void acquire(
        ReadableMap params,
        Promise promise
    ) {
        try {
            Toast.makeText(getReactApplicationContext(), "acquire", DURATION).show();
            promise.resolve("success");
        } catch (Exception e) {
            promise.reject("error");
        }
    }

    @ReactMethod
    public void release(
        ReadableMap params,
        Promise promise
    ) {
        try {
            Toast.makeText(getReactApplicationContext(), "release", DURATION).show();
            promise.resolve("success");
        } catch (Exception e) {
            promise.reject("error");
        }
    }

    @ReactMethod
    public void call(
        ReadableMap params,
        Promise promise
        ) {
            try {
                //TODO: put in data from request
                TrezorDevice device = bridge.getDeviceByPath("CA51AFE96DC33E395F8EE4F7");
                String payload = params.getString("payload");
                if (device!=null && payload!=null){
                    device.rawCall(Utils.hexStringToByteArray(payload));
                }
                Toast.makeText(
                    getReactApplicationContext(),
                    "call",
                    DURATION
                ).show();
                promise.resolve("success");
        } catch (Exception e) {
            promise.reject("error");
        }
        
    }
    
    @ReactMethod
    public void read(
        ReadableMap params,
        Promise promise
    ) {
        try {
            Toast.makeText(getReactApplicationContext(), "read", DURATION).show();
            promise.resolve("success");
        } catch (Exception e) {
            promise.reject("error");
        }
    }

    @ReactMethod
    public void post(
        ReadableMap params,
        Promise promise
    ) {
        try {
            Toast.makeText(
                getReactApplicationContext(),
                "post",
                DURATION
            ).show();
            promise.resolve("success");
        } catch (Exception e) {
            promise.reject("error");
        }
    }
}