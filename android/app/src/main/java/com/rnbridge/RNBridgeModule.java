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

public class RNBridgeModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    private static final String DURATION_SHORT_KEY = "SHORT";
    private static final String DURATION_LONG_KEY = "LONG";
    private static final String bridgeUrl = "http://10.0.2.2:21325";
    private static final int DURATION = 5;

    RNBridgeModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
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
            Toast.makeText(getReactApplicationContext(), "enumerate", DURATION).show();
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