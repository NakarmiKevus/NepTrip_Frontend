import { registerRootComponent } from 'expo';

import App from './App';

export const apiKey = '95f6d9d0ec40425a81235358252502';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
