// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import {
//   FB_APIKEY,
//   FB_AUTH_DOMAIN,
//   FB_PROJECTID,
//   FB_STORAGE_BUCKET,
//   FB_MESSAGING_SENDERID,
//   FB_APPID,
//   FB_MEASUREMENTID,
// } from "../utils/constants.js";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: FB_APIKEY,
//   authDomain: FB_AUTH_DOMAIN,
//   projectId: FB_PROJECTID,
//   storageBucket: FB_STORAGE_BUCKET,
//   messagingSenderId: FB_MESSAGING_SENDERID,
//   appId: FB_APPID,
//   measurementId: FB_MEASUREMENTID,
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

import * as admin from "firebase-admin";
import * as path from "path";

// Initialize Firebase Admin SDK with the service account key
const serviceAccount = path.join(
  __dirname,
  "path-to-your-service-account-file.json"
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://<YOUR_PROJECT_ID>.firebaseio.com",
});
