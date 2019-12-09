import React from 'react';
// import { BackHandler } from 'react-native';
// import { createStackNavigator } from 'react-navigation';
import 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { initStore } from './reducers/store';
import Router from './support/Router';


const App = (_props: any) => {
    const store = initStore();
    const onRouteChanged = (_prevState: any, _newState: any, action: any) => {
        const { params, routeName } = action;
        console.log('onRouteChanged', action);
        // _newState.routes.forEach(r => {
        //     console.log('R', r);
        // })
        // if (routeName) {
        //     const pathname = params && params.hash ? `${routeName}#${params.hash}` : routeName;
        //     onLocationChange(pathname);
        // }

        // Actions.drawerClose();
    };

    const onBack = () => {
        // console.log('back', Actions.prevState);
        // TODO: handle back button
        // Actions.pop();
        // Actions.reset('/');
        return true;
    };

    return (
        <Provider store={store}>
            <Router onStateChange={onRouteChanged} backAndroidHandler={null} />
        </Provider>
    );
};

export default App;
