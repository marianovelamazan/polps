import { Events } from 'ionic-angular';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
//import { File } from '@ionic-native/file';
import { Geolocation } from '@ionic-native/geolocation';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { DrawPage } from '../pages/draw/draw';
import { WriteProblemPage } from '../pages/write-problem/write-problem';
//import { MapPage } from '../pages/map/map';
import { SendPolpPage } from '../pages/send-polp/send-polp';
//import { CanvasDraw } from '../components/canvas-draw/canvas-draw';
import { ExplorePage } from '../pages/explore/explore';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { ProfilePage } from '../pages/profile/profile';
import { ResetPasswordPage} from '../pages/reset-password/reset-password';
import { PolpDetailPage } from '../pages/polp-detail/polp-detail';
import { SolvePage } from '../pages/solve/solve';

import { ToastController } from 'ionic-angular';
import { Autosize} from '../directives/autosize/autosize';
import { GoogleMaps } from '@ionic-native/google-maps';
import { PolpDataProvider } from '../providers/polp-data/polp-data';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AuthProvider } from '../providers/auth/auth';
import { ProfileProvider } from '../providers/profile/profile';
import { HttpModule } from "@angular/http";
import { Firebase } from '@ionic-native/firebase';
import { NotificationsProvider } from '../providers/notifications/notifications';
import { SolutionsProvider } from '../providers/solutions/solutions';
//import { Push } from '@ionic-native/push';

export const firebaseConfig = {
    apiKey: "AIzaSyB74WEU97oQRTfPpqEyUU06C5KkZ8043HM",
    authDomain: "polps-175008.firebaseapp.com",
    databaseURL: "https://polps-175008.firebaseio.com",
    projectId: "polps-175008",
    storageBucket: "polps-175008.appspot.com",
    messagingSenderId: "999032441750"
  };

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    DrawPage,
    WriteProblemPage,
    /*comment these lines for production*/
    //MapPage,
    SendPolpPage,
    //delete? CanvasDraw,
    ExplorePage,
    LoginPage,
    SignupPage,
    ResetPasswordPage,
    ProfilePage,
    PolpDetailPage,
    SolvePage,
    Autosize
  ],
  imports: [
    BrowserModule,
      HttpModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    DrawPage,
    WriteProblemPage,
    //MapPage,
    SendPolpPage,
    ExplorePage,
    LoginPage,
    SignupPage,
    ProfilePage,
    ResetPasswordPage,
    PolpDetailPage,
    SolvePage
  ],
  providers: [
    StatusBar,
    GoogleMaps,
    Geolocation,
    ToastController,
    //File,
    SplashScreen,
    Events,
    HttpModule,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    PolpDataProvider,
    AuthProvider,
    ProfileProvider,
    Firebase,
    NotificationsProvider,
    SolutionsProvider
    //Push
  ]
})
export class AppModule {}
