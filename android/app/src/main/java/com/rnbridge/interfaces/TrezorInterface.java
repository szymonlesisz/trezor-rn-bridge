package com.rnbridge.interfaces;

import android.content.Context;
import android.hardware.usb.UsbManager;

public interface TrezorInterface {
    public void rawPost(byte[] raw);
    public byte[] rawRead();
    public String getSerial();
    public void openConnection(Context context) throws IllegalStateException;
}
