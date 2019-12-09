import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createNavigationReducer, createReactNavigationReduxMiddleware } from 'react-navigation-redux-helpers';

import { Navigator } from '../support/Router';

// import suiteMiddlewares from '@suite-middlewares/index';
// import walletMiddlewares from '@wallet-middlewares/index';

import suiteReducers from './suite';

const navigator = createNavigationReducer(Navigator);

const reducers = combineReducers({
    navigator,
    ...suiteReducers,
});

export type AppState = ReturnType<typeof reducers>;


const navMiddleware = createReactNavigationReduxMiddleware((state: AppState) => state.navigator);
const middlewares = [thunkMiddleware, navMiddleware];

const enhancers: any[] = [];

const composedEnhancers = compose(applyMiddleware(...middlewares), ...enhancers);

export const initStore = () => {
    return createStore(reducers, composedEnhancers);
};
