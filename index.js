import { registerRootComponent } from 'expo';

import App from './App';

export const apiKey = '68dfee616b274304bdd123025252904'; 


export const weatherImages = {
    'Partly cloudy': require('./assets/images/partlycloudy.png'),
    'Moderate rain': require('./assets/images/moderaterain.png'),
    'Patchy rain possible': require('./assets/images/moderaterain.png'),
    'Sunny': require('./assets/images/sun.png'),
    'Clear': require('./assets/images/sun.png'),
    'Overcast': require('./assets/images/cloud.png'),
    'Cloudy': require('./assets/images/cloud.png'),
    'Light rain': require('./assets/images/moderaterain.png'),
    'Moderate rain at times': require('./assets/images/moderaterain.png'),
    'Heavy rain': require('./assets/images/heavyrain.png'),
    'Heavy rain at times': require('./assets/images/heavyrain.png'),
    'Moderate or heavy freezing rain': require('./assets/images/heavyrain.png'),
    'Moderate or heavy rain shower': require('./assets/images/heavyrain.png'),
    'Moderate or heavy rain with thunder': require('./assets/images/heavyrain.png'),
    'other': require('./assets/images/moderaterain.png')
  }
  
registerRootComponent(App);
