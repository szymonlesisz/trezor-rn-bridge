import React from 'react';
import { connect } from 'react-redux';
import { Router, Stack, Scene, Drawer, Actions } from 'react-native-router-flux';
import { createReduxContainer } from 'react-navigation-redux-helpers';

import InitialRun from '../components/InitialRun';
import Dashboard from '../components/Dashboard';
import WalletHome from '../components/WalletHome';
import Account from '../components/Account';
import Transactions from '../components/account/Transactions';
import Receive from '../components/account/Receive';
import Send from '../components/account/Send';
import SignVerify from '../components/account/SignVerify';
import Onboarding from '../components/Onboarding';
import DeviceSelect from '../components/DeviceSelect';
import Page from '../components/Page';

import GeneralSettings from '../components/settings/GeneralSettings';
import DeviceSettings from '../components/settings/DeviceSettings';
import WalletSettings from '../components/settings/WalletSettings';


import AppDrawer from '../components/navigator/Drawer';
import AccountDrawer from '../components/navigator/AccountDrawer';
import SettingsDrawer from '../components/navigator/SettingsDrawer';
import CustomNavBar from '../components/navigator/NavBar';
import CustomTabs from '../components/navigator/Tabs';

// navBar={CustomNavBar}

export const Navigator = Actions.create(
    <Stack key='root' hideNavBar>
        <Scene initial key='/initial-run' component={InitialRun} />
        <Drawer key='/' contentComponent={AppDrawer}>
            <Scene component={Dashboard} title='Dashboard' />
        </Drawer>

        <Scene key='/device-select' modal component={DeviceSelect} />
        <Scene key='/onboarding' component={Onboarding} />
        <Scene key='/firmware' component={Page} />

        <Drawer key='/wallet' contentComponent={AccountDrawer}>
            <Scene tabs>
                <Scene initial key='/wallet/account' component={Transactions} title='Transactions' />
                <Scene key='/wallet/account/receive' component={Receive} title='Receive' />
                <Scene key='/wallet/account/send' component={Send} title='Send' />
                <Scene key='/wallet/account/sign-verify' component={SignVerify} title='Sign and verify' />
            </Scene>
        </Drawer>

        <Drawer key='/exchange' contentComponent={AppDrawer}>
            <Scene component={Page} title='Exchange' />
        </Drawer>

        <Drawer key='/passwords' contentComponent={AppDrawer}>
            <Scene component={Page} title='Passwords' />
        </Drawer>

        <Drawer key='/settings' contentComponent={SettingsDrawer}>
            <Scene tabs>
                <Scene initial key='/settings/general' component={GeneralSettings} title='General' />
                <Scene key='/settings/device' component={DeviceSettings} title='Device' />
                <Scene key='/settings/wallet' component={WalletSettings} title='Wallet' />
            </Scene>
        </Drawer>
    </Stack>
);

export const ReduxNavigator = createReduxContainer(Navigator);
const mapStateToProps = state => ({
    state: state.navigator,
});
const ReduxRouter = connect(mapStateToProps)(Router);

export default (props: any) => <ReduxRouter navigator={ReduxNavigator} {...props} />;
