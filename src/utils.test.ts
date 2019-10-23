import { parseBridgeRequest, stripDomainAndPort } from './utils';

const parseBridgeRequestFixtures = [{
    url: 'http://10.0.2.2:21325/enumerate',
    output: {
        method: 'enumerate',
        params: {},
        debug: false,
    }
}, {
    url: 'http://10.0.2.2:21325/listen',
    output: {
        method: 'listen',
        params: {},
        debug: false,
    }
}, {
    url: 'http://10.0.2.2:21325/acquire/1/null',
    output: {
        method: 'acquire',
        params: {
            path: '1',
            previous: 'null',
        },
        debug: false,
    }
}, {
    url: 'http://10.0.2.2:21325/release/2',
    output: {
        method: 'release',
        params: {
            session: '2',
        },
        debug: false,
    }
}, {
    url: 'http://10.0.2.2:21325/call/2',
    output: {
        method: 'call',
        params: {
            session: '2',
        },
        debug: false,
    }
}, {
    url: 'http://10.0.2.2:21325/post/2',
    output: {
        method: 'post',
        params: {
            session: '2',
        },
        debug: false,
    }
}, {
    url: 'http://10.0.2.2:21325/read/2',
    output: {
        method: 'read',
        params: {
            session: '2',
        },
        debug: false,
    }
}, {
    url: 'http://10.0.2.2:21325/debug/enumerate',
    output: {
        method: 'enumerate',
        params: {},
        debug: true,
    }
}, {
    url: 'http://10.0.2.2:21325/debug/listen',
    output: {
        method: 'listen',
        params: {},
        debug: true,
    }
}, {
    url: 'http://10.0.2.2:21325/debug/acquire/1/null',
    output: {
        method: 'acquire',
        params: {
            path: '1',
            previous: 'null',
        },
        debug: true,
    }
}, {
    url: 'http://10.0.2.2:21325/debug/release/2',
    output: {
        method: 'release',
        params: {
            session: '2',
        },
        debug: true,
    }
}, {
    url: 'http://10.0.2.2:21325/debug/call/2',
    output: {
        method: 'call',
        params: {
            session: '2',
        },
        debug: true,
    }
}, {
    url: 'http://10.0.2.2:21325/debug/post/2',
    output: {
        method: 'post',
        params: {
            session: '2',
        },
        debug: true,
    }
}, {
    url: 'http://10.0.2.2:21325/debug/read/2',
    output: {
        method: 'read',
        params: {
            session: '2',
        },
        debug: true,
    }
}];

describe('parseBridgeRequest', () => {
    parseBridgeRequestFixtures.forEach(f => {
        it (f.url, () => {
            expect(parseBridgeRequest(f.url, { headers: { Origin: 'https://node.trezor.io'}})).toEqual(f.output);
        })
    })    
})

const stripDomainAndPortFixtures = [{
    url: 'http://10.0.2.2:21325/debug/read/2',
    output: 'debug/read/2'
}, {
    url: 'https://10.0.2.2:21325/debug/read/2',
    output: 'debug/read/2'
}, {
    url: 'http://localhost:21325/debug/read/2',
    output: 'debug/read/2'
}, {
    url: 'https://localhost:21325/debug/read/2',
    output: 'debug/read/2'
}];

describe('stripDomainAndPort', () => {
    stripDomainAndPortFixtures.forEach(f => {
        it (f.url, () => {
            expect(stripDomainAndPort(f.url)).toEqual(f.output);
        })
    });
})