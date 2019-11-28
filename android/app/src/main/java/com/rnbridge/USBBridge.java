package com.rnbridge;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbEndpoint;
import android.hardware.usb.UsbInterface;
import android.hardware.usb.UsbManager;
import android.hardware.usb.UsbRequest;
import java.nio.ByteBuffer;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import android.util.Log;

import java.util.ArrayList;


public class USBBridge {
    private static final String TAG = USBBridge.class.getSimpleName();

    private final Context context;
    private final UsbManager usbManager;

    private TrezorDevice device;

    public USBBridge(Context context) {
        this.context = context.getApplicationContext();
        this.usbManager = (UsbManager)context.getSystemService(Context.USB_SERVICE);
    }

    public synchronized void closeDeviceConnection() {
        if (device != null) {
            Log.d(TAG, "closeDeviceConnection: closing");
            device.close();
            device = null;
        }
        else
            Log.d(TAG, "closeDeviceConnection: no device connected now");
    }

    //
    // PRIVATE
    //

    static boolean deviceIsTrezor(UsbDevice usbDevice) {
        // no usable interfaces
        if (usbDevice.getInterfaceCount() <= 0) {
            return false;
        }
        // Trezor v1
        if (usbDevice.getVendorId() == 0x534c) {
            return usbDevice.getProductId() == 0x0001;
        }
        // Trezor v2
        if (usbDevice.getVendorId() == 0x1209) {
            return usbDevice.getProductId() == 0x53c0 || usbDevice.getProductId() == 0x53c1;
        }
        return false;
    }


    public List<TrezorDevice> enumerate() {
        HashMap<String, UsbDevice> deviceList = usbManager.getDeviceList();
        List<TrezorDevice> returnList = new ArrayList();
        for (final UsbDevice usbDevice : deviceList.values()) {
            // check if the device is Trezor
            Log.d(TAG, usbDevice.toString());
            if (!deviceIsTrezor(usbDevice))
                continue;

            //TODO: handle permissions better
            try {
                Thread t = new Thread(new Runnable() {
                    @Override
                    public void run() {
                        usbManager.requestPermission(usbDevice, PendingIntent.getBroadcast(context, 0, new Intent(UsbPermissionReceiver.ACTION), 0));
                    }
                });

                t.start(); // spawn thread

                t.join();  // wait for thread to finish
            }catch (InterruptedException e) {
                e.printStackTrace();
            }


            // UsbInterface iface = usbDevice.getConfiguration(0).getInterface(1);
            // if (iface.getInterfaceClass() == 255 && iface.getEndpoint(0).getEndpointNumber() == 2)

            Log.i(TAG, "adding devices");
            // use first interface
            UsbInterface usbInterface = usbDevice.getInterface(0);
            // try to find read/write endpoints
            UsbEndpoint readEndpoint = null, writeEndpoint = null;
            for (int i = 0; i < usbInterface.getEndpointCount(); i++) {
                UsbEndpoint ep = usbInterface.getEndpoint(i);
                if (readEndpoint == null && ep.getType() == UsbConstants.USB_ENDPOINT_XFER_INT && ep.getAddress() == 0x81) { // number = 1 ; dir = USB_DIR_IN
                    readEndpoint = ep;
                    continue;
                }
                if (writeEndpoint == null && ep.getType() == UsbConstants.USB_ENDPOINT_XFER_INT && (ep.getAddress() == 0x01 || ep.getAddress() == 0x02)) { // number = 1 ; dir = USB_DIR_OUT
                    writeEndpoint = ep;
                }
            }
            if (readEndpoint == null) {
                Log.e(TAG, "tryGetDevice: Could not find read endpoint");
                continue;
            }
            if (writeEndpoint == null) {
                Log.e(TAG, "tryGetDevice: Could not find write endpoint");
                continue;
            }
            if (readEndpoint.getMaxPacketSize() != 64) {
                Log.e(TAG, "tryGetDevice: Wrong packet size for read endpoint");
                continue;
            }
            if (writeEndpoint.getMaxPacketSize() != 64) {
                Log.e(TAG, "tryGetDevice: Wrong packet size for write endpoint");
                continue;
            }

            Log.d(TAG, "opening connection");
            UsbDeviceConnection conn = usbManager.openDevice(usbDevice);
            if (conn == null) {
                Log.e(TAG, "tryGetDevice: could not open connection");
            } else {
                if (!conn.claimInterface(usbInterface, true)) {
                    Log.e(TAG, "tryGetDevice: could not claim interface");
                } else {
                    device = new TrezorDevice(usbDevice.getDeviceName(), conn.getSerial(), conn, usbInterface, readEndpoint, writeEndpoint);
                    returnList.add(device);
                    // conn.releaseInterface(usbInterface); // should it be released?
                    break;
                }
            }
            // conn.close(); // should it close?
        }
        return returnList;
    }

    public TrezorDevice getDeviceByPath(String path) { // TODO: throw exxception?
        List<TrezorDevice> deviceList = enumerate();
        for (TrezorDevice td : deviceList) {
            if (td.serial.toUpperCase().equals(path.toUpperCase())){
                return td;
            }
        }
        return null;
    }

    //
    // INNER CLASSES
    //

    public static class TrezorDevice {
        private static final String TAG = TrezorDevice.class.getSimpleName();

        private final String deviceName;
        private final String serial;

        // next fields are only valid until calling close()
        private UsbDeviceConnection usbConnection;
        private UsbInterface usbInterface;
        private UsbEndpoint readEndpoint;
        private UsbEndpoint writeEndpoint;

        TrezorDevice(String deviceName,
                     String serial,
                     UsbDeviceConnection usbConnection,
                     UsbInterface usbInterface,
                     UsbEndpoint readEndpoint,
                     UsbEndpoint writeEndpoint) {
            this.deviceName = deviceName;
            this.serial = serial;
            this.usbConnection = usbConnection;
            this.usbInterface = usbInterface;
            this.readEndpoint = readEndpoint;
            this.writeEndpoint = writeEndpoint;
        }

        @Override
        public String toString() { // TODO: remove this?
//            return new StringBuilder()
//                    .append("path:" + this.serial)
//                    .append("debug:false")
//                    .toString();
            return "{\"path\":\"" + this.serial + "\",\"session\": null}";
        }

        void rawCall(byte[] msg) {
            if (usbConnection == null)
                throw new IllegalStateException(TAG + ": sendMessage: usbConnection already closed, cannot send message");

            rawPost(msg);
            // return rawRead();
        }

        void close() {
            if (this.usbConnection != null) {
                try {
                    usbConnection.releaseInterface(usbInterface);
                }
                catch (Exception ex) {}
                try {
                    usbConnection.close();
                }
                catch (Exception ex) {}

                usbConnection = null;
                usbInterface = null;
                readEndpoint = null;
                writeEndpoint = null;
            }
        }

        String getSerial() {
            // return this.usbConnection.getSerial();
            return this.serial;
        }

        //
        // PRIVATE
        //

        private void rawPost(byte[] raw) {
            ByteBuffer data = ByteBuffer.allocate(raw.length + 1024); // 32768);
            data.put(raw);

            while (data.position() % 63 > 0) {
                data.put((byte) 0);
            }
            UsbRequest request = new UsbRequest();
            request.initialize(usbConnection, writeEndpoint);
            int chunks = data.position() / 63;
            Log.i(TAG, String.format("messageWrite: Writing %d chunks", chunks));
            data.rewind();
            for (int i = 0; i < chunks; i++) {
                byte[] buffer = new byte[64];
                buffer[0] = (byte) '?';
                data.get(buffer, 1, 63);
                request.queue(ByteBuffer.wrap(buffer), 64);
                usbConnection.requestWait();
            }
            Log.i(TAG,"Writing done");
        }

        public byte[] rawRead() {
            ByteBuffer data = null;//ByteBuffer.allocate(32768);
            ByteBuffer buffer = ByteBuffer.allocate(64);
            UsbRequest request = new UsbRequest();
            request.initialize(usbConnection, readEndpoint);
            int msg_size;
            int invalidChunksCounter = 0;

            for (; ; ) {
                request.queue(buffer, 64);
                usbConnection.requestWait();
                byte[] b = buffer.array();
                Log.i(TAG, String.format("messageRead: Read chunk: %d bytes", b.length));

                if (b.length < 9 || b[0] != (byte) '?' || b[1] != (byte) '#' || b[2] != (byte) '#') {
                    if (invalidChunksCounter++ > 5)
                        Log.e(TAG,"THROW EXCEPTION");
                    continue;
                }
                if (b[0] != (byte) '?' || b[1] != (byte) '#' || b[2] != (byte) '#')
                    continue;

                msg_size = (((int)b[5] & 0xFF) << 24)
                        + (((int)b[6] & 0xFF) << 16)
                        + (((int)b[7] & 0xFF) << 8)
                        + ((int)b[8] & 0xFF);
                data = ByteBuffer.allocate(msg_size + 1024);
                data.put(b, 9, b.length - 9);
                break;
            }

            invalidChunksCounter = 0;

            while (data.position() < msg_size) {
                request.queue(buffer, 64);
                usbConnection.requestWait();
                byte[] b = buffer.array();
                Log.i(TAG, String.format("messageRead: Read chunk (cont): %d bytes", b.length));
                if (b[0] != (byte) '?') {
                    if (invalidChunksCounter++ > 5)
                        Log.e(TAG,"THROW EXCEPTION");
                    continue;
                }
                data.put(b, 1, b.length - 1);
            }

            return Arrays.copyOfRange(data.array(), 0, msg_size);
        }
    }


    public static abstract class UsbPermissionReceiver extends BaseBroadcastReceivers.BaseGlobalReceiver {
        public static final String ACTION = UsbPermissionReceiver.class.getName() + ".ACTION";

        public UsbPermissionReceiver() {
            super(ACTION);
        }

        @Override
        protected final void onReceiveRegistered(Context context, Intent intent) {
            boolean granted = intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false);
            onUsbPermissionResult(granted);
        }

        public abstract void onUsbPermissionResult(boolean granted);
    }
}
