import { Linking } from 'react-native';
import { Actions } from 'react-native-router-flux';
// import { ROUTER } from '@suite-actions/constants';

export const LOCATION_CHANGE = '@router-location-change';
export const UPDATE = 'goto';

interface LocationChange {
    type: typeof LOCATION_CHANGE;
    url: string;
}

export type RouterActions = LocationChange;

export const onLocationChange = (url: string) => {
    return {
        type: LOCATION_CHANGE,
        pathname: url,
    };
};

// links inside of application
export const goto = (url: string, _options?: any) => () => {
    console.log(url);
    // TODO: check if requested url != current url
    const [pathname, hash] = url.split('#');
    // console.log("ROUTE:", pathname, hash, Actions[pathname], Actions.prevScene, Object.keys(Actions));
    // Actions.push(pathname);
    try {
        // Actions[pathname].call(undefined, hash ? { hash } : undefined);
        // Actions[pathname].call(undefined);
        // Actions.execute('replace', pathname, hash ? { hash } : undefined);
        //Actions.jump(pathname, hash ? { hash } : undefined);
        // Actions.drawerClose();
        //Actions.replace(pathname, hash ? { hash } : undefined);
        // Actions.jump(pathname, hash ? { hash } : undefined);
        // Actions.jump(pathname, hash ? { hash } : undefined);
        // Actions.jump(pathname, hash ? { hash } : undefined);
        
        const action = Actions.currentScene === 'home' ? 'jump' : 'replace';

        // Actions.popAndPush(pathname, hash ? { hash } : undefined);
        // if (Actions.prevScene !== Actions.currentScene)
        //     Actions.execute('popTo', '/home');
        // Actions.execute('jump', pathname, hash ? { hash } : undefined);

        //Actions[pathname].call();
        // Actions.jump(pathname, hash ? { hash } : undefined);

        // if (Actions.currentScene === '/home') {
        //     Actions.jump(pathname, hash ? { hash } : undefined);
        // } else {
        //     Actions.replace(pathname, hash ? { hash } : undefined);
        // }
        // Actions.execute(action, pathname, hash ? { hash } : undefined);
        // Actions.reset(pathname);
        const parts = pathname.split('/');
        if (parts.length > 2) {
            Actions.jump(pathname, hash ? { hash } : undefined);
        } else {
            Actions.reset(pathname, hash ? { hash } : undefined);
        }
        // Actions.jump(pathname, hash ? { hash } : undefined);

        console.log("MAM MENI?", parts.length)
       
        // Actions.reset('root');
    } catch (error) {
        console.warn("E", error);
        // TODO: catch error
    }
};

// external links
export const gotoUrl = (url: string) => {
    Linking.openURL(url);
};

export const init = () => () => {};
export const initialRedirection = () => () => {};
