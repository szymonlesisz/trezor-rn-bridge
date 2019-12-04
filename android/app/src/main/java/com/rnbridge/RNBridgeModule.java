package com.rnbridge;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.Arguments;

import java.util.List;

import com.rnbridge.bridge.USBBridge;
import com.rnbridge.interfaces.BridgeInterface;
import com.rnbridge.interfaces.TrezorInterface;

public class RNBridgeModule extends ReactContextBaseJavaModule {
    private static final String TAG = RNBridgeModule.class.getSimpleName();
    private static ReactApplicationContext reactContext;
    private static BridgeInterface bridge;

    RNBridgeModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
        bridge = USBBridge.getInstance(context);
        // hackish way to get devices that were already connected
        bridge.checkInitial();
    }

    @Override
    public String getName() {
        return "RNBridge";
    }

    @ReactMethod
    public void enumerate(Promise promise) {
        try {
            List<TrezorInterface> trezorDeviceList = bridge.enumerate();

            // translate TrezorDevice object to react-native response
            WritableArray array = Arguments.createArray();
            for (TrezorInterface device : trezorDeviceList) {
                WritableMap d = Arguments.createMap();
                d.putString("path", device.getSerial()); // TODO: no serial (bootloader)
                d.putBoolean("debug", false); // debugLink, disabled for now
                array.pushMap(d);
            }
            promise.resolve(array);
        } catch (Exception e) {
            promise.reject("EUNSPECIFIED", e); // TODO: error to string
        }
    }

    @ReactMethod
    public void acquire(String path, Boolean debugLink, Promise promise) {
        Log.i(TAG, "acquire " + path + " ");
        try {
            TrezorInterface device = bridge.getDeviceByPath(path); // TODO: debugLink interface
            if (device != null) {
                Log.d(TAG, "Opening connection");
                device.openConnection(reactContext);
            }
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("EUNSPECIFIED", e);
        }
    }

    @ReactMethod
    public void release(String path, Boolean debugLink, Boolean shouldClose, Promise promise) {
        Log.i(TAG, "close device " + path + " ");
        promise.resolve(true);
//        try {
//            TrezorDevice device = bridge.getDeviceByPath(path); // TODO: debugLink interface
//            if (device != null) {
//                // TODO: close device interface
//            }
//        } catch (Exception e) {
//            promise.reject("EUNSPECIFIED", e);
//        }
    }

    @ReactMethod
    public void write(String path, Boolean debugLink, String data, Promise promise) {
        try {
            TrezorInterface device = bridge.getDeviceByPath(path);
            byte[] bytes = Utils.hexStringToByteArray(data);
            if (device != null) {
                device.rawPost(bytes);
                promise.resolve(Utils.byteArrayToHexString(bytes));
            } else {
                promise.reject("EUNSPECIFIED", "error device not found");
            }

            // TODO: return response from device

        } catch (Exception e) {
            promise.reject("EUNSPECIFIED", e.toString()); // TODO: error to string
        }
    }

    private int _step = 0;

    @ReactMethod
    public void read(String path, Boolean debugLink, Promise promise) {
        WritableMap map = Arguments.createMap();

        try {
            TrezorInterface device = bridge.getDeviceByPath(path);
            if (device != null) {
                byte[] bytes = device.rawRead();
                map.putString("data", Utils.byteArrayToHexString(bytes));
            }
        } catch (Exception e) {
            // promise.reject("error", e);
            map.putString("data-error", e.toString());
        }

        promise.resolve(map);
    }

}