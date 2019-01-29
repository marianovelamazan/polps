import { Injectable } from '@angular/core';
import { LoadingController, Events, ToastController } from 'ionic-angular';
//import { Http } from '@angular/http';
//import { AngularFireModule } from 'angularfire2';
//import { AngularFireDatabaseModule } from 'angularfire2/database';
//import { AngularFireAuthModule } from 'angularfire2/auth';
//import { AngularFireAuth } from 'angularfire2/auth';
//FirebaseObjectObservable, 
import { FirebaseListObservable, AngularFireDatabase } from 'angularfire2/database';
import { ProfileProvider } from '../../providers/profile/profile';
import { AuthProvider } from '../../providers/auth/auth';
import 'rxjs/add/operator/map';
import * as firebase from 'firebase';

@Injectable()
export class PolpDataProvider {

  public polp_id: any;
  public userProfile: firebase.database.Reference;
  public currentUser: firebase.User;

  public my_original_img: any = "";
  public visual_problem: any = "";
  public word_problem: string = "";
  public location: any = "";
  public likes: number = 0;
  public points: number = 0;

  public author: any = "";
  public published: boolean = false;

  PoLPs: FirebaseListObservable<any[]>;
  all_PoLPs: FirebaseListObservable<any[]>;
  //public new_polp;
  public img_src: string;
  public loader;
  constructor(private toastCtrl: ToastController, public _af: AngularFireDatabase, public loadingCtrl: LoadingController, public event: Events, public profileProvider: ProfileProvider, public authProvider: AuthProvider) {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.currentUser = user;
        this.userProfile = firebase.database().ref(`/userProfile/${user.uid}`);
        this.PoLPs = this._af.list(`/userProfile/${user.uid}/polps`);
        this.all_PoLPs = this._af.list(`/all_polps`);
      }

    });
    console.log('Hello PolpDataProvider Provider');
  }
  ionViewDidEnter() {

    }
  public clean_polp() {
    this.polp_id = "";
    this.my_original_img = "";
    this.visual_problem = "";
    this.word_problem = "";
    this.location = "";
    this.likes = 0;
    this.published = false;
    this.author = "";
  }
  public remove_polp() {
    this.PoLPs.remove(this.polp_id);
  }
  public create_polp(): firebase.Promise<any> {

    let new_polp = this.PoLPs.push({
      original_img: this.my_original_img,
      visual_problem: this.visual_problem,
      word_problem: this.word_problem,
      location: this.location,
      author: this.author,
      likes: this.likes,
      published: false
    }).then((item) => { this.polp_id = item.key });
    console.log("this.polp_id " + this.polp_id);
    return new_polp;
  }
  get_all_polps_list(): firebase.database.Reference {
    //let users_polps = firebase.database().ref(`/userProfile`);
    return firebase.database().ref('/all_polps');
}
  public get_polp_detail(polpId: string, uid: string): firebase.database.Reference {
    let p = firebase.database().ref(`/userProfile/${uid}`).child('/polps').child(polpId);
    return p;
  }
  public get_original_image_name(): string {
    //TODO: This is wrong, just dummy code
    return this.my_original_img;
  }
  public set_original_image(o_img) {
    this.my_original_img = o_img;
  }
  public set_visual_problem(polp_vp) {
    this.visual_problem = polp_vp;
  }
  public set_word_problem(wp) {
    this.word_problem = wp;
  }
  public set_location(arg0: any): any {
    this.location = arg0;
  }
  public set_author(au: string) {
    this.author = au;
  }
  public set_like() {
    this.likes++;
    this.PoLPs.update(this.polp_id, { likes: this.likes });
    this.profileProvider.update_points(1);
  }
  public set_point() {
    //this.likes++;
    this.profileProvider.update_points(1);
  }
  public get_visual_problem(): string {
    //TODO: This is wrong, just dummy code
    return this.visual_problem;
  }
  public get_word_problem(): string {
    //TODO: This is wrong, just dummy code
    return this.word_problem;
  }
  public get_location(): string {
    //TODO: This is wrong, just dummy code
    return this.location;
  }
  public get_author(): string {
    return this.author;
  }
  public get_likes(): number {
    return this.likes;
  }

  public get_id(): string {
    return this.polp_id;
  }
  public list_polps(): FirebaseListObservable<any[]> {
    return this._af.list('/polps');
  }
  presentToast(msg: string) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'middle'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
  
    toast.present();
  }
  public upload_polp_original_img(image: string, userId: string):any {
    this.presentLoading();
    // Implementation
    let storage_ref = firebase.storage().ref();
    let image_name = this.generateUUID();
    let image_ref = storage_ref.child(`${userId}/${image_name}.jpg`);
    let img_url = image_ref.putString(image, 'data_url');
    var that = this;
    img_url.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      function (snapshot) {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        switch (snapshot) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      }, function (error) {
        console.log(error);
      }, function () {
        // Upload completed successfully, now we can get the download URL
        this.img_src = img_url.snapshot.downloadURL;
        //that.loader.dismiss();
        that.event.publish('uploaded', ('drawPage'));
        console.log("publishing drawpage");
        
        return this.img_src;
      });
    this.set_original_image(image_name + ".jpg");
    
    //this.PoLPs.update(this.polp_id, { original_img: image_name });
    this.PoLPs.push({ original_img: image_name, author: "", visual_problem:"", word_problem:"", likes: 0, published: false }).then((item) => { this.polp_id = item.key });
    //this.new_polp.original_img = image_name ;
    console.log("original image updated to database " + this.polp_id);
    
    return  this.img_src;
  }
  public upload_visual_problem(image: string, userId: string) {
    // Implementation
    let storage_ref = firebase.storage().ref();
    let image_name = this.generateUUID();
    let image_ref = storage_ref.child(`${userId}/${image_name}.jpg`);

    let img_url = image_ref.putString(image, 'data_url');
    var that = this;
    img_url.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      function (snapshot) {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        switch (snapshot) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      }, function (error) {
        console.log(error);
      }, function () {
        // Upload completed successfully, now we can get the download URL
        this.img_src = img_url.snapshot.downloadURL;
        //that.loader.dismiss();
        that.event.publish('uploaded_vp', ('write_problem'));
        //this.polpDP.presentToast("Aaaand another point");
        return undefined;
      });
    this.set_visual_problem(image_name + ".jpg");
    console.log("this.polp_id: " + this.polp_id);
    this.PoLPs.update(this.polp_id, { visual_problem: image_name });
    //this.new_polp.visual_problem = image_name ; 
    this.presentLoading();
  }
  public upload_word_problem(word_problem: string, userId: string) {
    // Implementation
    this.set_word_problem(word_problem);
    this.PoLPs.update(this.polp_id, { word_problem: word_problem });
    //this.new_polp.visual_problem = image_name ; 
    this.event.publish('uploaded_wp', ('map_page'));
    console.log("publishing writeProblem");
  }
  public upload_location(polp_pos: any, uid: any): any {
    console.log("uploading location "+polp_pos);
    this.set_location(polp_pos);
    this.location = polp_pos;
    
    this.set_author(uid);
    this.PoLPs.update(this.polp_id, { location: polp_pos, author: uid });
    //this.new_polp.visual_problem = image_name ; 
    this.event.publish('uploaded_loc', ('finnish'));
    //
  }
  public getImage(userId: string, imageId: string): any {
    // Implementation
    let storageRef = firebase.storage().ref();
    let imageRef = storageRef.child(`${userId}/${imageId}`);
    return imageRef.getDownloadURL();
  }
  
  public publish_polp(arg0: any): any {
    this.published = true;
    this.PoLPs.update(this.polp_id, { likes: 0, published: true });
    this.all_PoLPs.push({ id: this.polp_id, author: this.author, location: this.location });
    this.presentToast("Awesome!, 1 more point for you");
  }
  public get_published(): any {
    return this.published;
  }
  public presentLoading() {
    this.loader = this.loadingCtrl.create({
      content: "Uploading stuff...",
      //duration: 1000
    });
    this.loader.present();
  }
  public dismissLoading() {
    if (this.loader) {
      this.loader.dismiss();
      this.loader = null;
    }
  }
  
  private generateUUID(): string {
    // Implementation
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }
}
