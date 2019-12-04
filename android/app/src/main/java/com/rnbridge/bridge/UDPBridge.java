package com.rnbridge.bridge;

import android.content.Context;

import com.rnbridge.interfaces.BridgeInterface;
import com.rnbridge.interfaces.TrezorInterface;

import java.util.List;

public class UDPBridge implements BridgeInterface {
    private static final String TAG = UDPBridge.class.getSimpleName();
    private static UDPBridge instance;

    private Context context;

    private List<TrezorInterface> trezorDeviceList;

    public UDPBridge(Context context){
        this.context = context;
    }

    public static UDPBridge getInstance(Context context){
        if (instance==null){
            instance = new UDPBridge(context);
        }
        return instance;
    }

    @Override
    public List<TrezorInterface> enumerate() {
        return null;
    }

    @Override
    public TrezorInterface getDeviceByPath(String path) {
        return null;
    }

    @Override
    public void checkInitial() {

    }

    public static class TrezorDevice implements TrezorInterface{

        @Override
        public void rawPost(byte[] raw) {

        }

        @Override
        public byte[] rawRead() {
            return new byte[0];
        }

        @Override
        public String getSerial() {
            return null;
        }

        @Override
        public void openConnection(Context context) throws IllegalStateException {

        }
    }
}
