import * as functions from 'firebase-functions'
const admin = require('firebase-admin')


// auth trigger (new user signup)
export const newUserCreated = functions.region('asia-south1').auth.user().onCreate(user => {
    return admin.firestore().collection('onUserCreate').doc(user.uid).set( {
        email: user.email,
        followers: [],
    })
  })