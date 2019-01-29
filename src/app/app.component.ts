import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
//import { NavController, Nav, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireAuth } from 'angularfire2/auth';
import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';

//import { AuthProvider } from "../providers/auth/auth";

//declare var StatusBar:any;
//declare var SplashScreen:any;

@Component({
  //templateUrl: 'app.html'
  template: '<ion-nav #myNav [root]="rootPage"></ion-nav>'
})
export class MyApp {

  //@ViewChild(Nav) nav: Nav;
  //platform: any;
  rootPage: any = LoginPage;
  pages: Array<{ title: string, component: any, icon: string }>;
  constructor( platform: Platform, private afAuth: AngularFireAuth, private statusBar: StatusBar, private splashscreen: SplashScreen) {
    platform.ready().then(() => {
      //this.platform = platform;
      this.afAuth.authState.subscribe(auth => {
        if (!auth)
          this.rootPage = LoginPage;
        else
          this.rootPage = HomePage;
      });
      statusBar.styleDefault();
      splashscreen.hide();
    })
  }
}
