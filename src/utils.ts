
const expectedMethods = ['enumerate', 'listen', 'acquire', 'release', 'call', 'post', 'read'] as const;

type Response = {
    method: 'enumerate' | 'listen';
    params: {
        session?: string;
        path?: string
        previous?: string;
    }
    debug: boolean;
} | {
    method: 'acquire';
    params: {
        session?: string;
        path?: string
        previous?: string;
    }
    debug: boolean;
} | {
    method: 'release' | 'call' | 'post' | 'read';
    params: {
        session?: string;
        path?: string
        previous?: string;
    }
    debug: boolean;
} | null

export const stripDomainAndPort = (url: string) => {
    return url.replace(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i, '');
}

export const parseBridgeRequest = (url: string, options: any): Response => {
    if (!options.headers || options.headers.Origin !== 'https://node.trezor.io') {
        return null
    }
    let debug = false;

    const paramsArr = stripDomainAndPort(url).split('/');
    if (paramsArr[0] === 'debug') {
        debug = true;
        paramsArr.shift();
    }
    
    const method = expectedMethods.find(m => m === paramsArr[0]);
    
    if (!method) {
        return null;
    }
    // remove method from params array
    paramsArr.shift();

    switch (method) {
        case 'acquire':
            return { 
                method,
                params: {
                    path: paramsArr[0],
                    previous: paramsArr[1],
                },
                debug
            }
            break;
        case 'release':
        case 'call':
        case 'post':
        case 'read':
                return { 
                    method,
                    params: {
                        session: paramsArr[0],
                    },
                    debug
                }
            break;
    }

    return { method, params: {}, debug }
}