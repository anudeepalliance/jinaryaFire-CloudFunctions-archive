import * as functions from 'firebase-functions'
const admin = require('firebase-admin')

// export function reportUser() 
  export const addTheNewCompliment = functions.region('asia-east2').https.onCall((complimentData, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated', 
        'only authenticated users can send feedback'
      )
    } 
    
  //random 11 digital Notification Doc Id
  const randomComplimentId = (Math.random() * 100000000000).toString()

    const complimentReceivedObject = {
        senderUserName:  complimentData.data().name,
        senderUid: complimentData.data().senderUid,
        content: complimentData.data().senderUid,
        receiverUid: complimentData.data().receiverUid,
        receiverUserName: complimentData.data().receiverUserName,
        receiverName: complimentData.data().receiverName,
        receivedTime: complimentData.data().receivedTime,
        noOfLikes: 0,
        noOfViews: 0,
        complimentId: randomComplimentId,
    }

     //A random id for the report document is generated here everytime a report is filed
     //instead of using a uid of the reporter or reportee so that if a user reports
     //multiple times then the previous report  document should not be distrubed
    return admin.firestore().collection('Users').doc(complimentReceivedObject.receiverUid).collection('complimentsReceived')
    .doc(randomComplimentId).set(complimentReceivedObject)

  })