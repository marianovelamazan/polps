import { Component, NgZone } from "@angular/core";
import { Events } from 'ionic-angular';
import { NavController, ModalController, NavParams } from 'ionic-angular';
import { PolpDataProvider } from "../../providers/polp-data/polp-data";
//import { AngularFireDatabase } from 'angularfire2/database';
import { DrawPage } from '../draw/draw';
//import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireAuth } from 'angularfire2/auth';
import { ExplorePage } from "../explore/explore";
import { ProfilePage } from "../profile/profile";
import { ProfileProvider } from "../../providers/profile/profile";
//import { CameraPreview} from '@ionic-native/camera-preview';
declare var CameraPreview: any;
//declare var cordova: any; // global variable for paths
//declare var AngularFireAuth: any;
//declare var Diagnostic:any

declare var window: any; // global variable for paths

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})

export class HomePage {
    private user: any;
    private is_new_user: boolean = false;

    public getWidth: number;
    public getHeight: number;
    public calcWidth: number;
    public imageSrcData: String;
    public original_image: String;
    myDrawPage = DrawPage;
    public user_points: number;

    constructor( private profileDP: ProfileProvider, public navParams: NavParams, private nav: NavController, public modalCtrl: ModalController, private zone: NgZone, private afAuth: AngularFireAuth, private polpDP: PolpDataProvider, public event: Events) {
        /*let data = localStorage.getItem('original_images');
        if(data)
            this.PoLPs = JSON.parse(data);*/

        this.is_new_user = navParams.get('first_time');

        console.log("new user? " + this.is_new_user, this.user);
        this.zone.run(() => {
            this.getWidth = window.innerWidth;
            this.getHeight = window.innerHeight;
        });
        console.log(" home constructor");
        this.changeEffect();
    }
    /*ionViewCanEnter(): boolean{
        // here we can either return true or false
        // depending on if we want to leave this view
        if(this.is_new_user){
           return true;
         } else {
           return false;
         }
       }*/
    ionViewDidEnter() {
        this.startCamera();
        this.changeEffect();
        if (this.is_new_user) {
            //DOING NEW USER STUFF
            console.log("new user!");
            this.welcome_user();
        }
        this.profileDP.getUserProfile().on('value', userProfileSnapshot => {
            this.user = userProfileSnapshot.val();
            this.user_points = userProfileSnapshot.val().points;
        });
       // this.user_points = this.profileDP.get_points();
    }
 
    ionViewDidLoad() {

        this.changeEffect();
        this.event.subscribe('uploaded', (data) => {
            console.log("listened uploaded");
            this.navigateToDrawPage(data);
        });

    }
    welcome_user() {
        console.log("welcome user");
        //TO DO
        this.event.subscribe('uploaded', (data) => {
            console.log("listened uploaded");
            this.navigateToDrawPage(data);
        });
    }
    startCamera() {
        this.changeEffect();
        CameraPreview.startCamera({ x: 0, y: 0, width: this.getWidth, height: this.getHeight, camera: 'rear', toBack: true, previewDrag: false, tapPhoto: false });
    }

    stopCamera() {
        CameraPreview.stopCamera();
    }

    takePicture() {
        var that = this;
        CameraPreview.takePicture({ width: 600, height: 800, quality: 85 }, function (imageData) {
            that.savePic(imageData);
        });
    }

    savePic(d) {
        console.log("saving picture");
        let base64Image = 'data:image/jpg;base64,' + d;
        //this.polpDP.create_polp();
        return this.polpDP.upload_polp_original_img(base64Image, this.afAuth.auth.currentUser.uid);
    }
    navigateToDrawPage(where) {
        this.nav.setRoot(DrawPage);
    }

    SwitchCamera() {
        CameraPreview.switchCamera();
    }
    showCamera() {
        CameraPreview.show();
    }
    hideCamera() {
        CameraPreview.hide();
    }
    changeEffect() {
        // Create an array with 5 effects
        //let effect = e;
        CameraPreview.setColorEffect('mono');
    }
    refresh() {
        window['location'].reload();
    }
    gotoExplorePage() {
        //this.nav.pop();
        this.nav.push(ExplorePage);
    }
    gotoProfilePage() {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.push(ProfilePage);
    }
    ionViewWillLeave() {
        //this.polpDP.dismissLoading();
        this.event.unsubscribe('uploaded');
    }
    /*ionViewCanLeave(): boolean{
        // here we can either return true or false
        // depending on if we want to leave this view
        if(this.is_new_user){
           return true;
         } else {
           return false;
         }
       }*/
    ionViewDidLeave() {
        //if (this.is_new_user){
        console.log("leaving home");
        if (this.is_new_user == false) {
            //console.log("and unsubscribing");
            this.event.unsubscribe('uploaded');
        } else {

        }
        //}
    }
}