import 'dotenv/config';

export default {
  expo: {
    name: 'TravelTales',
    slug: 'traveltales',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    ios: {
      bundleIdentifier: 'com.sezinyilmaz.traveltales',
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      },
      supportsTablet: true
    },
    android: {
      package: 'com.sezinyilmaz.traveltales',
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      },
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      }
    },
    web: {
      favicon: './assets/favicon.png'
    },
    extra: {
      eas: {
        projectId: 'd81f417b-2cf5-4288-aa80-58f72fd55ab9'
      }
    },
    owner: 'sezinyilmaz'
  }
};
