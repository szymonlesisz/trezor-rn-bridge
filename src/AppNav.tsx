import React from 'react';
import { BackHandler } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';
import { Scene, Actions, Router } from 'react-native-router-flux';
import { createReduxContainer, createReactNavigationReduxMiddleware, createNavigationReducer } from 'react-navigation-redux-helpers';
import Home from './components/Home';

const reducer = (state = {}, action: any) => {
    return state;
}

const AppNavigator = Actions.create(
    <Scene key="root" hideNavBar>
        <Scene key="home" component={Home} />
        <Scene key="page" component={Home} />
    </Scene>,
);

// default nav reducer
const initialState = AppNavigator.router.getStateForAction(AppNavigator.router.getActionForPathAndParams('home'));
const navReducer = (state = initialState, action) => {
    const nextState = AppNavigator.router.getStateForAction(action, state);
    // Simply return the original `state` if `nextState` is null or undefined.
    console.log('nextState : ', nextState);
    return nextState || state;
};

// const navReducer = createNavigationReducer(AppNavigator);
const appReducer = combineReducers({
    nav: navReducer,
    reducer,
});
const navMiddleware = createReactNavigationReduxMiddleware('root', state => state.nav);

const ReduxNavigator = createReduxContainer(AppNavigator, 'root');
const mapStateToProps = state => ({
    state: state.nav,
});
const ReduxRouter = connect(mapStateToProps)(Router);
const store = createStore(appReducer, applyMiddleware(navMiddleware));

const App = (_props: any) => {
    // const [state, setState] = useState(initialState);
    
    // useEffect(() => {
    //     init()
    //     .then(transport => {
    //         console.log("INFO", transport);
    //         setState(state => ({
    //             ...state,
    //             ready: true,
    //             transport,
    //         }));
    //     })
    //     .catch(error => {
    //         console.log("INIT ERROR", error);
    //     });

    //     return () => {
    //         // TrezorConnect.dispose();
    //     }
    // }, []);

    return (
        <Provider store={store}>
            <AppNavigator />
            {/* <ReduxRouter navigator={ReduxNavigator} /> */}
        </Provider>
    );
};

export default App;
