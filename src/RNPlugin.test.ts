import RNPlugin from './RNPlugin';

type NativeFixture = {
    type: 'enumerate' | 'open';
    payload: any;
};

let nativeFixtures: NativeFixture[] | undefined;

jest.mock('react-native', () => {
    
    return {
        __esModule: true, // this property makes it work
        NativeModules: {
            RNBridge: {
                enumerate: () => {
                    if (nativeFixtures) {
                        const index = nativeFixtures.findIndex(f => f.type === 'enumerate');
                        if (index >= 0) {
                            const { payload } = nativeFixtures[index];
                            nativeFixtures.splice(index, 1);
                            if (typeof payload === 'string') {
                                throw new Error(payload);
                            }
                            return payload;
                        }
                    }
                    return [];
                },
                open: (_serialNumber: string) => {
                    if (nativeFixtures) {
                        const index = nativeFixtures.findIndex(f => f.type === 'open');
                        if (index >= 0) {
                            const { payload } = nativeFixtures[index];
                            nativeFixtures.splice(index, 1);
                            if (typeof payload === 'string') {
                                throw new Error(payload);
                            }
                            return payload;
                        }
                    }
                    return true;
                },
                close: (_serialNumber: string) => {

                },
                write: (_serialNumber: string, _data: Uint8Array) => {

                },
                read: (_serialNumber: string) => {

                },
            },
        },
    };
});

const fixtures = {
    enumerate: [
        {
            description: '0 device connected',
            native: [],
            result: [],
        },
        {
            description: '1 device connected',
            native: [{ vendorId: 0x1209, productId: 0x53c1, serialNumber: 'abcd' }],
            result: [{ debug: false, path: 'abcd' }],
        },
        {
            description: '1 device connected (bootloader, no serialNumber)',
            native: [{ vendorId: 0x1209, productId: 0x53c1 }],
            result: [{ debug: false, path: 'bootloader-1' }],
        },
        {
            description: '1 device connected (bootloader, serialNumber is empty)',
            native: [{ vendorId: 0x1209, productId: 0x53c1, serialNumber: '' }],
            result: [{ debug: false, path: 'bootloader-1' }],
        },
        {
            description: '3 devices connected but only one is Trezor',
            native: [
                { vendorId: 0x1209, productId: 0x53c1, serialNumber: 'abcd' },
                { vendorId: 2, productId: 0x53c1, serialNumber: '' },
                { vendorId: 0x1209, productId: 2, serialNumber: '' },
            ],
            result: [{ debug: false, path: 'abcd' }],
        },
    ],
    connect: [
        {
            description: 'Success',
            native: undefined,
            result: undefined,
        },
        {
            description: 'Failed to open device in 5 tries',
            native: [
                {
                    type: 'open',
                    payload: 'Native open error',
                },
                {
                    type: 'open',
                    payload: 'Native open error',
                },
                {
                    type: 'open',
                    payload: 'Native open error',
                },
                {
                    type: 'open',
                    payload: 'Native open error',
                },
                {
                    type: 'open',
                    payload: 'Native open error',
                },
            ],
            result: new Error('Native open error'),
        },
        {
            description: 'Success in 4th try',
            native: [
                {
                    type: 'open',
                    payload: 'Native open error',
                },
                {
                    type: 'open',
                    payload: 'Native open error',
                },
                {
                    type: 'open',
                    payload: 'Native open error',
                },
            ],
            result: undefined,
        },
    ]
} as const;

describe('RNPlugin.enumerate', () => {
    fixtures.enumerate.forEach(f => {
        it(f.description, async () => {
            nativeFixtures = [{ type: 'enumerate', payload: f.native }];
            const plugin = new RNPlugin();
            plugin.init();
            const result = await plugin.enumerate();
            expect(result).toEqual(f.result);
        });
    });
});

describe('RNPlugin.connect', () => {
    fixtures.connect.forEach(f => {
        it(f.description, async () => {
            nativeFixtures = f.native;
            const plugin = new RNPlugin();
            try {
                const result = await plugin.connect('abcd', false, true);
                expect(result).toEqual(f.result);
            } catch (error) {
                expect(error).toEqual(f.result);
            }
        });
    });
});