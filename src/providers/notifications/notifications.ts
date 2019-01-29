import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { ProfileProvider } from "../profile/profile";
import { Firebase } from '@ionic-native/firebase';

// Angular
//import { Component } from '@angular/core';

// Ionic
import { AlertController } from 'ionic-angular';

@Injectable()
export class NotificationsProvider {
    public body: string;
    public title: string;
    public tap: boolean;
  private mytoken: string;
  constructor(public http: Http, private firebase: Firebase, public alertCtrl: AlertController, private profile_provider: ProfileProvider) {
    console.log('Hello NotificationsProvider Provider');
    
  }
ionViewDidLoad() {
    this.firebase_setup();
  }
  firebase_setup(): Promise<any> {
    return this.firebase.grantPermission()
      .catch(error => console.error('Error getting permission', error))
      .then(() => {
        this.firebase.getToken()
          .catch(error => console.error('Error getting token', error))
          .then(token => {

            console.log(`The token is ${token}`);
            this.mytoken = token;
            Promise.all([
              this.firebase.subscribe('firebase-app'),
              this.firebase.subscribe('ios'),
              this.firebase.subscribe('userid-2')
            ]).then((result) => {

              if (result[0]) console.log(`Subscribed to FirebaseDemo`);
              if (result[1]) console.log(`Subscribed to iOS`);
              if (result[2]) console.log(`Subscribed as User`);

              this.subscribeToPushNotificationEvents();
            });
          });
      })
  }
  private save_token(token: any): Promise<any> {
    // Send the token to the server
    console.log('Sending token to the server...');
    this.profile_provider.update_token(token);
    return Promise.resolve(true);
  }
  public save_new_token(): Promise<any> {
    // Send the token to the server
    console.log('Sending token to the server...',this.mytoken);
    this.profile_provider.update_token(this.mytoken);
    return Promise.resolve(true);
  }
  public get_token(){
      return this.mytoken;
  }
  private subscribeToPushNotificationEvents(): void {

        // Handle token refresh
        this.firebase.onTokenRefresh().subscribe(
            token => {
                console.log(`The new token is ${token}`);
                this.save_token(token);
            },
            error => {
                console.error('Error refreshing token', error);
            });

        // Handle incoming notifications
        this.firebase.onNotificationOpen().subscribe(
            (notification: any) => {

                !notification.tap
                    ? console.log('The user was using the app when the notification arrived...')
                    : console.log('The app was closed when the notification arrived...');

                let notificationAlert = this.alertCtrl.create({
                    title: notification.title,
                    message: notification.body,
                    buttons: ['Ok']
                });
                notificationAlert.present();
            },
            error => {
                console.error('Error getting the notification', error);
            });
    }
}
