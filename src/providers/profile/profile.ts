import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import firebase from 'firebase';
import { Events } from "ionic-angular";
/*
  Generated class for the ProfileProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class ProfileProvider {
  //public token: any;
  public userProfile: firebase.database.Reference;
  public currentUser: firebase.User;
  public points;
  public likes: number;

  constructor(public http: Http, private event: Events, ) {
    console.log('Hello ProfileProvider Provider');
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.currentUser = user;
        this.userProfile = firebase.database().ref(`/userProfile/${user.uid}`);
        this.getUserProfile().on('value', userProfileSnapshot => {
          //this.token = userProfileSnapshot.val().token;
          this.points = userProfileSnapshot.val().points;
          
        });
      }
    });
  }
 /* wakeup() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.currentUser = user;
        this.userProfile = firebase.database().ref(`/userProfile/${user.uid}`);
        this.userProfile.on('value', userProfileSnapshot => {
          this.userProfile = userProfileSnapshot.val();
          //this.token = userProfileSnapshot.val().token;
          this.points = userProfileSnapshot.val().points;
        });
      }
    });
  }*/
  ionViewDidEnter() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.currentUser = user;
        this.userProfile = firebase.database().ref(`/userProfile/${user.uid}`);
        this.getUserProfile().on('value', userProfileSnapshot => {
          //this.token = userProfileSnapshot.val().token;
          this.points = userProfileSnapshot.val().points;
          this.event.publish('profile_ready', (this.points));
        });
      }
    });
  }

  getUserProfile(): firebase.database.Reference {
    return this.userProfile;
  }
  get_user() {
    this.currentUser;
  }
  public get_points() {
    console.log("this.points; "+this.points);
    return this.points;
  }
  public update_points(add_pt: number) {
    this.points = this.points + add_pt;
    this.userProfile.update({ points: this.points });
    console.log("point added");
  }
  updateName(firstName: string, lastName: string): firebase.Promise<void> {
    return this.userProfile.update({
      firstName: firstName,
      lastName: lastName,
    });
  }
  updateDOB(birthDate: string): firebase.Promise<any> {
    return this.userProfile.update({
      birthDate: birthDate,
    });
  }
  updateEmail(newEmail: string, password: string): firebase.Promise<any> {
    const credential = firebase.auth.EmailAuthProvider
      .credential(this.currentUser.email, password);

    return this.currentUser.reauthenticateWithCredential(credential)
      .then(user => {
        this.currentUser.updateEmail(newEmail).then(user => {
          this.userProfile.update({ email: newEmail });
        });
      });
  }
  updatePassword(newPassword: string, oldPassword: string):
    firebase.Promise<any> {
    const credential = firebase.auth.EmailAuthProvider
      .credential(this.currentUser.email, oldPassword);

    return this.currentUser.reauthenticateWithCredential(credential)
      .then(user => {
        this.currentUser.updatePassword(newPassword).then(user => {
          console.log("Password Changed");
        }, error => {
          console.log(error);
        });
      });
  }
  update_token(t: string) {
    this.userProfile.update({ token: t });
  }
  update_likes(l: any): any {
    this.userProfile.update({ likes: l });
  }
}
