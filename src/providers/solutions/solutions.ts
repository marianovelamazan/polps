import { Injectable } from '@angular/core';
//import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { LoadingController, Events, ToastController } from 'ionic-angular';
import { FirebaseListObservable, AngularFireDatabase } from 'angularfire2/database';
import { ProfileProvider } from '../../providers/profile/profile';
import { AuthProvider } from '../../providers/auth/auth';
import 'rxjs/add/operator/map';
import * as firebase from 'firebase';

@Injectable()
export class SolutionsProvider {
  
  private polp_id: any;
  private solution_id: any;

  private userProfile: firebase.database.Reference;
  private currentUser: firebase.User;

  private my_original_img: any = "";
  private visual_problem: any = "";
  private visual_solution: any = "";
  private word_problem: string = "";
  private solution_text: string = "";

  //private likes: number = 0;
  //private points: number = 0;
  
  //private polp_author: any = "";
  private solution_author: any = "";
  //private published: boolean = false;

  private user_solutions: FirebaseListObservable<any[]>;
  private all_solutions: FirebaseListObservable<any[]>;

  //private img_src: string;
  private loader;

  constructor(private toastCtrl: ToastController, public _af: AngularFireDatabase, public loadingCtrl: LoadingController, public event: Events, public profileProvider: ProfileProvider, public authProvider: AuthProvider) {
    
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.currentUser = user;
        this.userProfile = firebase.database().ref(`/userProfile/${user.uid}`);
        this.user_solutions = this._af.list(`/userProfile/${user.uid}/solutions`);
        this.all_solutions = this._af.list(`/all_solutions`);
      }

    });
    console.log('Hello SolutionsProvider Provider');
  }
  public remove_solution() {
    this.user_solutions.remove(this.solution_id);
  }
  public get_all_solutions_list(): firebase.database.Reference {
    //let users_polps = firebase.database().ref(`/userProfile`);
    return firebase.database().ref('/all_solutions');
  }
  public get_solution_detail(solution_id: string, uid: string): firebase.database.Reference {
    let p = firebase.database().ref(`/userProfile/${uid}`).child('/solutions').child(solution_id);
    return p;
  }
  public get_user_solution(uid: string): firebase.database.Reference {
    let p = firebase.database().ref(`/userProfile/${uid}`).child('/solutions');
    return p;
  }
  public get_original_image_name(): string {
    //TODO: This is wrong, just dummy code
    return this.my_original_img;
  }

  public set_visual_solution(polp_vs) {
    this.visual_solution = polp_vs;
  }
  public set_word_problem(wp) {
    this.word_problem = wp;
  }
  public set_my_word_solution(st: string): any {
    this.solution_text = st;
  }
  /*public set_location(arg0: any): any {
    this.location = arg0;
  }*/
  public set_solution_author(au: string) {
    this.solution_author = au;
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
  /*public get_location(): string {
    //TODO: This is wrong, just dummy code
    return this.location;
  }*/
  public get_author(): string {
    return this.solution_author;
  }

  public get_polp_id(): string {
    return this.polp_id;
  }
  public get_solution_id(): string {
    return this.solution_id;
  }
  public list_solutions(): FirebaseListObservable<any[]> {
    return this._af.list('/solutions');
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
  public upload_visual_solution(image: string, userId: string, ws:string, polp_id: string): any {
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
        that.event.publish('uploaded_vs', ('visual_solution'));
        //this.polpDP.presentToast("Aaaand another point");
        return undefined;
      });
    this.set_visual_solution(image_name + ".jpg");
    
    this.user_solutions.push({ visual_solution: image_name, author: userId, word_solution:ws, polp_id: polp_id, likes: 0, published: true })
      .then((item) => { 
        this.solution_id = item.key;
        console.log("this.solution_id: " + this.solution_id);
        this.profileProvider.update_points(1);
        this.all_solutions.push({ id: this.solution_id, author: userId, polp_id: polp_id });
        this.presentToast("Awesome!, 1 more point for you");
        //this.presentLoading();
        //this.upload_solution_text(ws, userId);
       });
  }
/*
  public upload_solution_text(word_solution: string, userId: string) {
    // Implementation
    console.log("entering publishing word solution",word_solution, this.solution_id);
    this.set_my_word_solution(word_solution);
    this.user_solutions.update(this.solution_id, { word_solution: word_solution });
    //this.new_polp.visual_problem = image_name ; 
    this.event.publish('uploaded_st', ('ok'));
    console.log("publishing solution text");
  }
  */
  public getImage(userId: string, imageId: string): any {
    // Implementation
    let storageRef = firebase.storage().ref();
    let imageRef = storageRef.child(`${userId}/${imageId}`);
    return imageRef.getDownloadURL();
  }
  /*
  public publish_solution(arg0: any): any {
    this.published = true;
    this.user_solutions.update(this.solution_id, { likes: 0, published: this.published });
    this.all_solutions.push({ id: this.polp_id, author: this.solution_author, polp_id: this.polp_id });
    this.presentToast("Awesome!, 1 more point for you");
  }*/
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
