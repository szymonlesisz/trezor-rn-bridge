package com.rnbridge.interfaces;

import android.content.Context;

import com.rnbridge.TrezorException;

public interface TrezorInterface {
    public void rawPost(byte[] raw);
    public byte[] rawRead();
    public void openConnection(Context context) throws TrezorException;
    public void closeConnection();
    public String getSerial();
}
