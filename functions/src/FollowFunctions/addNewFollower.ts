import * as functions from 'firebase-functions'
const admin = require('firebase-admin')

//When a user updates his userDoc like name or UserName then this updated info needs to be
//reflected in the user's followees' followers sub coll of all the other users that he is following
export const addTheNewFollower = functions.region('asia-east2').firestore.document
  ('Users/{followerUserId}/following/{followeeUserId}').onCreate((data, context) => {

  //get follower and followee Uids for identification
  const followeeUid = context.params.followeeUserId
  //for identification and notification payload data (Intent Extras for client)
  const followerUid = context.params.followerUserId

  //Get Follower user details that needs to be duplicated to the Followee's following Sub Coll
  //And also added to the notification Payload data
  admin.firestore().collection('Users').doc(followerUid).get().then((doc:{ exists: any; data: () => any }) => {

    //Extracting this separately as this need not be copied to the Followers sub-collection
    const followerImageUrl = doc.data().DOWNLOAD_URL

    //This data will be copied to the followers sub collection
    const followerData = {
      name:  doc.data().name,
      uid: followerUid,
      userName: doc.data().userName,
    }
    

  //get the notification token of the followee to identify & send notification to his device
  admin.firestore().collection('Users').doc(followeeUid).collection('notificationToken')
    .doc('theNotificationToken').get().then((notificationTokenDoc:{ exists: any; data: () => any }) => {

      const followeeNotificationToken = notificationTokenDoc.data().notificationToken

  //Create the Notification Payload content
  const notificationPayload = {
    notification: {
      title: 'You have a new follower!',
      body: `${followerData.userName}`,
      clickAction: ".People.PersonProfileActivity",
      image: `${followerImageUrl}`
    },
    data: {
      ACTIVITY_NAME: "PersonProfileActivity",
      PERSON_UID_INTENT_EXTRA: followerUid,
      //If the app is in the foreground then this channel will be used to trigger a notification and this channel has to
      //be created at the client else, this will fail
      CHANNEL_ID: "Follow Update ID"
    }
  }
        
    //Add the follower to the followee sub-collection
    admin.firestore().collection('Users').doc(followeeUid).collection('followers').doc(followerUid).set(followerData)

    //Send the notification to the user
    return admin.messaging().sendToDevice(followeeNotificationToken, notificationPayload).then(function(response: any) {
      console.log("Successfully sent message:", response);
      })
      .catch(function(error: any) {
      console.log("Error sending message:", error);

        
      })

    })

  })

})
