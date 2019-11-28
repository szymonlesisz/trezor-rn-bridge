package com.rnbridge;

import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.NativeMap;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;

import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.Arguments;

import java.util.Map;

import java.util.HashMap;
import java.util.List;

import com.rnbridge.USBBridge;
import com.rnbridge.USBBridge.TrezorDevice;

public class RNBridgeModule extends ReactContextBaseJavaModule {
    private static final String TAG = RNBridgeModule.class.getSimpleName();
    private static ReactApplicationContext reactContext;

    private static final String DURATION_SHORT_KEY = "SHORT";
    private static final String DURATION_LONG_KEY = "LONG";
    private static final String bridgeUrl = "http://10.36.0.113:21325/";
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
    public void enumerate(Promise promise) {
        // TODO:
        // first enumerate should store "trezorDeviceList" in array
        // then
        Log.i(TAG, "enumerate1");

        try {
            Log.i(TAG, "enumerate2-");
             List<TrezorDevice> trezorDeviceList = bridge.enumerate();
             Toast.makeText(getReactApplicationContext(), "enumerated: "+trezorDeviceList.toString(), Toast.LENGTH_SHORT).show();
             // trezorDeviceList.stream().map(d -> d.getDesctiptor())
            Log.i(TAG, "-enumerate2");
            // translate TrezorDevice object to react-native response
            WritableArray array = Arguments.createArray();
            for (TrezorDevice device : trezorDeviceList) {
                WritableMap d = Arguments.createMap();
                d.putString("path", device.getSerial()); // TODO: no serial (bootloader)
                d.putBoolean("debug", false); // debugLink, disabled for now
                array.pushMap(d);
            }
             promise.resolve(array);
        } catch (Exception e) {
            Log.i(TAG, "enumerate3");
             promise.reject("EUNSPECIFIED", e); // TODO: error to string
        }
    }

    @ReactMethod
    public void acquire(String path, Boolean debugLink, Promise promise) {
        Log.i(TAG, "acquire " + path + " ");
        promise.resolve(true);
//        try {
//            TrezorDevice device = bridge.getDeviceByPath(path); // TODO: debugLink interface
//            if (device != null) {
//                // TODO: open device to read
//            }
//        } catch (Exception e) {
//            promise.reject("EUNSPECIFIED", e);
//        }
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
    public void write(ReadableMap params, Promise promise) {

        Boolean debug = params.getBoolean("debug");
        ReadableMap map = params.getMap("data");
        ReadableMapKeySetIterator iterator = map.keySetIterator();
        Boolean has = iterator.hasNextKey();
        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            ReadableType type = map.getType(key);
            Log.i(TAG, "mapKtype " + type.toString());
        }

        Log.i(TAG, "map" + map.toString() + " has: " + has.toString());
        Log.i(TAG, "mapclass" + map.getClass());

        if (debug) {
            promise.resolve("emulated");
            return;
        }

        try {
            TrezorDevice device = bridge.getDeviceByPath(params.getString("path"));

            Log.i(TAG, params.getMap("data").toString());

            // String data1 = params.getString("data");
            String data = params.getString("dataHex");
            byte[] bytes = Utils.hexStringToByteArray(data);
            if (device != null && data != null) {
                device.rawCall(bytes);
                // String str = new String(result);
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
    public void read(ReadableMap params, Promise promise) {
        Toast.makeText(getReactApplicationContext(), "read", Toast.LENGTH_LONG).show();
        String[] arr = {
                "3f232300110000005ed801000a097472657a6f722e696f1002180120013218434534433739454645414239443038313246463834353631380040014a07656e67",
                "3f6c69736852025432e0010060016a083761663164353835800100880100980100a00103aa010154000000000000000000000000000000000000000000000000"
        };

        WritableMap map = Arguments.createMap();
//        map.putString("data", arr[this._step]);
//        this._step++;

        try {
            TrezorDevice device = bridge.getDeviceByPath(params.getString("path"));
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

//    @ReactMethod
//    public void call(ReadableMap params, Promise promise) {
//        Toast.makeText(
//                getReactApplicationContext(),
//                "call",
//                DURATION
//        ).show();
//
//        try {
////                TrezorDevice device = bridge.getDeviceByPath(params.getString("session"));
////                String payload = params.getString("payload");
////                if (device!=null && payload!=null) {
////                    byte[] result = device.rawCall(Utils.hexStringToByteArray(payload));
////                    String str = new String(result);
////                    promise.resolve(str);
////                } else {
////                    promise.reject("error device not found");
////                }
//
//        } catch (Exception e) {
//            promise.reject("error:" + e.toString());
//        }
//
//    }
//

}