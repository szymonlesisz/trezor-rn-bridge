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

import android.os.Build;
import android.util.Log;

import java.util.ArrayList;
import java.util.UUID;


public class USBBridge {
    private static final String TAG = USBBridge.class.getSimpleName();
    private static USBBridge instance;

    private final Context context;
    private final UsbManager usbManager;

    private List<TrezorDevice> trezorDeviceList;

    public USBBridge(Context context) {
        this.context = context.getApplicationContext();
        this.usbManager = (UsbManager)context.getSystemService(Context.USB_SERVICE);
    }

    public static USBBridge getInstance(Context context){
        if (instance == null){
            instance = new USBBridge(context);
        }
        return instance;
    }

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
        // We only check the usbManager device list if we don't already have it
        // otherwise we trust attached/detached receivers to do their job
        if (trezorDeviceList==null) {
            HashMap<String, UsbDevice> deviceList = usbManager.getDeviceList();
            trezorDeviceList = new ArrayList();
            for (final UsbDevice usbDevice : deviceList.values()) {
                // check if the device is Trezor
                Log.d(TAG, usbDevice.toString());
                if (!deviceIsTrezor(usbDevice))
                    continue;
                if (usbManager.hasPermission(usbDevice)) {
                    trezorDeviceList.add(new TrezorDevice(usbDevice));
                }
            }
        }

        return trezorDeviceList;
    }

    //Should be called from device attached receiver
    public void addDeviceToList(TrezorDevice device){
        if (trezorDeviceList!=null) {
            if (getDeviceByPath(device.serial)==null) {
                trezorDeviceList.add(device);
            } else {
                Log.d(TAG, String.format("device %s already in trezorDeviceList", device.getSerial()));
            }
        }else{
            trezorDeviceList = new ArrayList();
            trezorDeviceList.add(device);
        }
    }

    //should be called from device detached receiver
    public void removeDeviceFromList(TrezorDevice device){
        if (trezorDeviceList!=null) {
            if (trezorDeviceList.contains(device)) {
                trezorDeviceList.remove(device);
            } else {
                Log.d(TAG, String.format("device %s not found in trezorDeviceList", device.getSerial()));
            }
        }
    }

    public TrezorDevice getDeviceByPath(String path) { // TODO: throw exxception?
        if (trezorDeviceList!=null) {
            for (TrezorDevice td : trezorDeviceList) {
                if (td.serial.equalsIgnoreCase(path)) {
                    return td;
                }
            }
        }else{
            return null;
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
        private UsbDevice usbDevice;

        // next fields are only valid until calling close()
        private UsbDeviceConnection usbConnection;
        private UsbInterface usbInterface;
        private UsbEndpoint readEndpoint;
        private UsbEndpoint writeEndpoint;


        TrezorDevice(UsbDevice usbDevice){
            this.deviceName = usbDevice.getDeviceName();
            //TODO: usbDevice.getSerial is only available on 21+ (android 5), we can choose something different
            if (Build.VERSION.SDK_INT >= 21) {
                this.serial = usbDevice.getSerialNumber();
            }else{
                this.serial = UUID.randomUUID().toString();
            }
            this.usbConnection = null;
            this.usbInterface = null;
            this.readEndpoint = null;
            this.writeEndpoint = null;
            this.usbDevice = usbDevice;
        }

        public void openConnection(UsbManager usbManager) throws IllegalStateException{
            // use first interface
            usbInterface = usbDevice.getInterface(0);
            // try to find read/write endpoints
            readEndpoint = null;
            writeEndpoint = null;
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

            //TODO: error states
            if (readEndpoint == null) {
                throw new IllegalStateException("Could not find read endpoint");
            }
            if (writeEndpoint == null) {
                throw new IllegalStateException("Could not find write endpoint");
            }
            if (readEndpoint.getMaxPacketSize() != 64) {
                throw new IllegalStateException("Wrong packet size for read endpoint");
            }
            if (writeEndpoint.getMaxPacketSize() != 64) {
                throw new IllegalStateException("Wrong packet size for write endpoint");
            }

            Log.d(TAG, "opening connection");
            usbConnection = usbManager.openDevice(usbDevice);
            if (usbConnection == null) {
                throw new IllegalStateException("Could not open connection");
            } else {
                if (usbConnection.claimInterface(usbInterface, true)) {
                    Log.d(TAG, "Connection should be open now");
                }else{
                    throw new IllegalStateException("Could not claim interface");
                }
            }
        }

        @Override
        public String toString() { // TODO: remove this?
            return "{\"path\":\"" + this.serial + "\",\"session\": null}";
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

        public void rawPost(byte[] raw) {
            if (usbConnection == null)
                throw new IllegalStateException(TAG + ": sendMessage: usbConnection already closed, cannot send message");

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

            // read first 64bytes
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
                data.put(b, 1, b.length-1);
                break;
            }

            invalidChunksCounter = 0;

            // read the rest of the data
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
            int paddedLength = Utils.calculatePaddedLength(msg_size, 63);
            Log.d(TAG, String.format("data size %d value %s", paddedLength, Utils.byteArrayToHexString(data.array())));

            return Arrays.copyOfRange(data.array(), 0, paddedLength);
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
