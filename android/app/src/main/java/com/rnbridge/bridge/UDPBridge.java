package com.rnbridge.bridge;

import android.content.Context;
import android.util.Log;

import com.rnbridge.TrezorException;
import com.rnbridge.Utils;
import com.rnbridge.interfaces.BridgeInterface;
import com.rnbridge.interfaces.TrezorInterface;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.nio.ByteBuffer;
import java.nio.channels.DatagramChannel;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class UDPBridge implements BridgeInterface {
    private static final String TAG = UDPBridge.class.getSimpleName();
    private static final String EMULATOR_UDP_HOST = "10.0.2.2";
    private static final int EMULATOR_UDP_PORT = 21324;
    private final byte[] PING = "PINGPING".getBytes();
    private final String PONG = "PONGPONG";
    private static UDPBridge instance;

    private Context context;

    private List<TrezorInterface> trezorDeviceList = new ArrayList<>();

    public UDPBridge(Context context){
        this.context = context;
    }

    public static UDPBridge getInstance(Context context){
        if (instance == null){
            instance = new UDPBridge(context);
        }
        return instance;
    }

    @Override
    public List<TrezorInterface> enumerate() {
        if (trezorDeviceList.size() == 0) {
            if (checkDevice()){
                trezorDeviceList.add(new TrezorDevice("udp-emulator"));
            }
        } else {
            if (!checkDevice()) {
                trezorDeviceList = new ArrayList<>();
            }
        }

        return trezorDeviceList;
    }

    @Override
    public TrezorInterface getDeviceByPath(String path) {
        if (trezorDeviceList.size() > 0){
            return trezorDeviceList.get(0);
        }else{
            return enumerate().get(0);
        }
    }

    @Override
    public void findAlreadyConnectedDevices() {
    }

    private boolean checkDevice(){
        try {
            InetAddress address = InetAddress.getByName(EMULATOR_UDP_HOST);
            DatagramSocket socket = new DatagramSocket();
            socket.setSoTimeout(500);
            DatagramPacket pingPacket = new DatagramPacket(PING, PING.length, address, EMULATOR_UDP_PORT);
            socket.send(pingPacket);

            byte[] pong = new byte[8];
            DatagramPacket pongPacket = new DatagramPacket(pong, pong.length, address, EMULATOR_UDP_PORT);
            socket.receive(pongPacket);
            socket.close();

            Log.d(TAG,"Check device success");
            return new String(pong).equals(PONG);
        } catch (IOException e) {
            Log.d(TAG,"Check device fail");
            return false;
        }
    }

    public static class TrezorDevice implements TrezorInterface{
        private static final String TAG = "UDP"+ UDPBridge.TrezorDevice.class.getSimpleName();

        private String path;
        private DatagramChannel channel;
        private InetSocketAddress socketAddress;

        public TrezorDevice(String path){
            this.path = path;
        }

        @Override
        public void rawPost(byte[] raw) {
            try {
                ByteBuffer data = ByteBuffer.allocate(raw.length); // 32768);
                data.put(raw);
                while (data.position() % 63 > 0) {
                    data.put((byte) 0);
                }
                int chunks = data.position() / 63;
                Log.i(TAG, String.format("messageWrite: Writing %d chunks", chunks));
                data.rewind();

                for (int i = 0; i < chunks; i++) {
                    byte[] buffer = new byte[64];
                    buffer[0] = (byte) '?';
                    data.get(buffer, 1, 63);

                    channel.send(ByteBuffer.wrap(buffer), socketAddress);
                }

            } catch (IOException e) {
                Log.d(TAG, e.getMessage());
                e.printStackTrace();
            }

        }

        @Override
        public byte[] rawRead() {
            ByteBuffer data = null;//ByteBuffer.allocate(32768);
            ByteBuffer chunk = ByteBuffer.allocate(64);
            int msg_size;
            int invalidChunksCounter = 0;

            // read first 64bytes
            for (; ; ) {
                try {
                    channel.receive(chunk);
                } catch (IOException e) {
                    Log.e(TAG, "messageRead: read from socket failed");
                    e.printStackTrace();
                }

                Log.i(TAG, String.format("messageRead: Read chunk: %d bytes", chunk.position()));

                if (chunk.position() < 9 || chunk.get(0) != (byte) '?' || chunk.get(1) != (byte) '#' || chunk.get(2) != (byte) '#') {
                    if (invalidChunksCounter++ > 5)
                        Log.e(TAG,"THROW EXCEPTION");
                    continue;
                }
                if (chunk.get(0) != (byte) '?' || chunk.get(1) != (byte) '#' || chunk.get(2) != (byte) '#')
                    continue;

                msg_size = ((chunk.get(5) & 0xFF) << 24)
                        + ((chunk.get(6) & 0xFF) << 16)
                        + ((chunk.get(7) & 0xFF) << 8)
                        + (chunk.get(8) & 0xFF);

                data = ByteBuffer.allocate(msg_size + 1024);
                data.put(chunk.array(), 1, 63);
                break;
            }

            invalidChunksCounter = 0;

            // read the rest of the data
            while (data.position() < msg_size) {
                chunk.clear();
                try {
                    channel.receive(chunk);
                } catch (IOException e) {
                    e.printStackTrace();
                }

                Log.i(TAG, String.format("messageRead: Read chunk (cont): %d bytes", chunk.position()));
                if (chunk.get(0) != (byte) '?') {
                    if (invalidChunksCounter++ > 5)
                        Log.e(TAG,"THROW EXCEPTION");
                    continue;
                }

                data.put(chunk.array(), 1, 63);
            }
            int paddedLength = Utils.calculatePaddedLength(msg_size, 63);
            Log.d(TAG, String.format("data size %d value %s", paddedLength, Utils.byteArrayToHexString(data.array())));

            return Arrays.copyOfRange(data.array(), 0, paddedLength);
        }

        @Override
        public void openConnection(Context context) throws TrezorException {
            try {
                InetAddress address = InetAddress.getByName(EMULATOR_UDP_HOST);
                if (channel == null || !channel.isOpen() || !channel.isConnected()) {
                    channel = DatagramChannel.open();
                    socketAddress = new InetSocketAddress(address, EMULATOR_UDP_PORT);
                    channel.connect(socketAddress);
                }
            } catch (SocketException e) {
                e.printStackTrace();
                throw new TrezorException("Socket exception", e);
            } catch (UnknownHostException e) {
                e.printStackTrace();
                throw new TrezorException("Unknown exception", e);
            } catch (IOException e) {
                e.printStackTrace();
                throw new TrezorException("Socket IO exception", e);
            }
        }

        @Override
        public void closeConnection(){
            try {
                channel.disconnect();
                channel.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        @Override
        public String toString() {
            return "{\"path\":\"" + this.path + "\",\"session\": null}";
        }

        @Override
        public String getSerial() {
            return this.path;
        }

    }
}
