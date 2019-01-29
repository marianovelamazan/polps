import { Injectable } from '@angular/core';
//import { HttpModule } from '@angular/http';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import firebase from 'firebase';
import { NotificationsProvider } from "../notifications/notifications";
import { Firebase } from "@ionic-native/firebase";

@Injectable()
export class AuthProvider {
  user_token: string;
  public fireAuth:firebase.auth.Auth; 
  public userProfileRef:firebase.database.Reference; 
  //
  //
  constructor(public http: Http, private my_firebase: Firebase, private notification_provider: NotificationsProvider) {
    console.log('Hello AuthProvider Provider');
    this.fireAuth = firebase.auth(); 
    this.userProfileRef = firebase.database().ref('/userProfile'); 
  }
  loginUser(email: string, password: string): firebase.Promise<any> {
    /*this.notification_provider.save_new_token().then(t=>{
      console.log("token saved", t);
    });*/
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }
  signupUser(email: string, password: string): firebase.Promise<any> {

    return firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(newUser => {

        firebase.database().ref('/userProfile').child(newUser.uid)
          .set({ email: email, points: 0, likes:"", token: "" });
        let t = this.my_firebase.getToken()
          .then(token => {
            console.log(`The token is ${token}`);
            var t = token;
            //console.log("getting token: " + t);
            firebase.database().ref('/userProfile').child(newUser.uid)
              .update({ token: t });
          });
        }) 
  }
  resetPassword(email: string): firebase.Promise<void> {
    return firebase.auth().sendPasswordResetEmail(email);
  }
  logoutUser(): firebase.Promise<void> {
    firebase.database().ref('/userProfile')
      .child(firebase.auth().currentUser.uid).off();

    return firebase.auth().signOut();
  }

  /*upload_token(t: string) {
    firebase.database().ref('/userProfile')
      .child(firebase.auth().currentUser.uid)
      .update({ token: t });
  }*/
}
