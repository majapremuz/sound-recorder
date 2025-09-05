
export const environment = {
  production: false,
  cache: true,
  client_id: "HRPetrijanec",
  client_password: "HRPetrijanecPristup",
  rest_server: {
    protokol: 'https://',
    host: 'rest-api.mkovacic-dev.com', // dev server company: 2
    functions: {
        api: '/api/',
        token: '/token.php'
    },
    multimedia: '/Assets/multimedia'
  },
  google_map_api: '',
  cache_key: 'cache-key-',
  def_image: 'assets/imgs/no-image-icon-23485.png',
  company_id: 2,
  show_id: true,
  version: '02122023',
  db_version: '1.0.3',

  firebase: {
  apiKey: "AIzaSyCVs8zmwT8YMlg3hvGoRWCxgJmPgrmE6OM",
  authDomain: "sound-recorder-93263.firebaseapp.com",
  projectId: "sound-recorder-93263",
  storageBucket: "sound-recorder-93263.firebasestorage.app",
  messagingSenderId: "499813238505",
  appId: "1:499813238505:web:7a61fd126115a41d465278",
  measurementId: "G-KH84EJ6BQT"
  }
};
