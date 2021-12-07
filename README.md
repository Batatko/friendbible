# FriendBible

FriendBible is a socail network app, one of my first learning projects in front end developing.  
It's written in JavaScript language with React framework, using Firebase as a cloud hosted-database and deployment server.

Installation:
1. Clone project with git.
3. Create Firebase account.
3. Create new project on Firebase along with its services (Auth, Firestore Database, Realtime Database, Storage).
4. Create Web app in project settings, copy/paste firebaseConfig in friendbible project "firebase_config.js" and export as default.

```javascript
 export default {
  apiKey: ...,
  authDomain: ...,
  databaseURL: ...,
  projectId: ...,
  storageBucket: ...,
  messagingSenderId: ...,
  appId: ...,
}
```

5. Install npm package dependencies.
6. Host app with:
```bash
npm start
```

The app is capable of basic social network features.  
Sign up with dummy email and password.  
Login into account.  

Available features:
* Post quotes
* Like, comment, share quotes
* Change profile picture on profile page.
* Search users through Header input bar.
* Follow/unfollow users.
* Chat with users in Messages.  

Enjoy.
