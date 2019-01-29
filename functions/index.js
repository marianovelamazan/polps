
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

var functions = require('firebase-functions');
let admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.polp_published = functions.database.ref('/userProfile/{userId}/polps/{polpsId}').onUpdate(event => {
    let polpStateChanged = false;
    let polpCreated = false;
    let polp_data = event.data.val();
    var eventSnapshot = event.data;
    var polp_published = eventSnapshot.child('published');

    // Do things here if polp didn't exists before
    if (!event.data.previous.exists()) {
        polpCreated = true;
    }
    if (polp_published.val() == true) {
        polpStateChanged = true;
        console.log("polp published");
    }

    if (polpStateChanged) {
        msg = `This is the word problem: ${polp_data.word_problem}`;
        console.log("polp database changed");
        return loadUsers().then(users => {
            let tokens = [];
            // let emails = [];
            for (let user of users) {
                tokens.push(user.token);
                //emails.push(user.email);
            }
            let payload = {
                notification: {
                    title: 'New PoLP created!',
                    body: msg,
                    sound: 'default',
                    badge: '1'
                }
            };
            console.log("sending notification");
            return admin.messaging().sendToDevice(tokens, payload);
            //return admin.email.sendPush(tokens, payload);
        });
    }
});
exports.solution_published = functions.database.ref('/userProfile/{userId}/solutions/{solutionsId}').onCreate(event => {
    let solutionStateChanged = false;
    let solutionCreated = false;
    let solution_data = event.data.val();
    var eventSnapshot = event.data;
    var solution_published = eventSnapshot.child('published');

    // Do things here if polp didn't exists before
    if (!event.data.previous.exists()) {
        solutionCreated = true;
    }
    if (solution_published.val() == true) {
        solutionStateChanged = true;
        console.log("solution published");
    }

    if (solutionStateChanged) {
        msg = `This is the solution: ${solution_data.word_solution}`;
        console.log("solution database changed");
        return loadUsers().then(users => {
            let tokens = [];
            // let emails = [];
            for (let user of users) {
                tokens.push(user.token);
                //emails.push(user.email);
            }
            let payload = {
                notification: {
                    title: 'New Solution to PoLP!',
                    body: msg,
                    sound: 'default',
                    badge: '1'
                }
            };
            console.log("sending solution notification");
            return admin.messaging().sendToDevice(tokens, payload);
            //return admin.email.sendPush(tokens, payload);
        });
    }
});
function loadUsers() {
    let dbRef = admin.database().ref('/userProfile');
    let defer = new Promise((resolve, reject) => {
        dbRef.once('value', (snap) => {
            let data = snap.val();
            let users = [];
            for (var property in data) {
                users.push(data[property]);
            }
            resolve(users);
        }, (err) => {
            reject(err);
        });
    });
    return defer;
}