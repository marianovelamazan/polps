import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth";
import { PolpDataProvider } from "../../providers/polp-data/polp-data";
import { ExplorePage } from "../explore/explore";
import { ProfileProvider } from "../../providers/profile/profile";
import { SolvePage } from "../solve/solve";
import { SolutionsProvider } from '../../providers/solutions/solutions';

/**
 * Generated class for the PolpDetailPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-polp-detail',
  templateUrl: 'polp-detail.html',
})
export class PolpDetailPage {
  private user: any;

  //private img: any;
  private wp: string;
  private likes: number;
  //private author: string;
  //private id: any;
  /*polp: any
  polp_id: string;*/
  current_polp: any;
  private show_likes: boolean = false;
  //******************************************************CAMBIAR ESTO A FALSE!! */
  private show_solve_it: boolean = true;

  constructor(private profileDP: ProfileProvider, public navCtrl: NavController, public navParams: NavParams, private afAuth: AngularFireAuth, private polpDP: PolpDataProvider, private solutionsDP: SolutionsProvider, public event: Events) {
    /*this.polp = navParams.get("polp");
    this.polp_id = navParams.get("polp_id");*/
    this.profileDP.getUserProfile().on('value', userProfileSnapshot => {
      this.user = userProfileSnapshot.key;

      //this.user_points = userProfileSnapshot.val().points;
    });
    
  }

  ionViewDidLoad() {
    console.log("loading polp detail data ");
    /*console.log('ionViewDidLoad WriteProblemPage' + cordova.file.externalApplicationStorageDirectory);
    (<HTMLInputElement>document.getElementById('visual_problem')).src = cordova.file.externalApplicationStorageDirectory + 'newPoLP_edited.png';*/
    console.log(this.navParams.get('polp_id') + ", " + this.navParams.get('author'));

  }
  ionViewDidEnter() {
    this.polpDP.get_polp_detail(this.navParams.get('polp_id'), this.navParams.get('author'))
      .on('value', eventSnapshot => {
        this.current_polp = eventSnapshot.val();
        this.current_polp.visual_problem = eventSnapshot.val().visual_problem + '.jpg';
        this.current_polp.original_img = eventSnapshot.val().original_img + '.jpg';
        this.current_polp.word_problem = eventSnapshot.val().word_problem;
        this.current_polp.author = eventSnapshot.val().author;
        this.current_polp.id = eventSnapshot.key;
        this.current_polp.likes = eventSnapshot.val().likes;
        //console.log("this.current_polp.original_img: " + this.current_polp.original_img);
        console.log("user: " + this.user + "this.current_polp.author: " + this.current_polp.author);
        if (this.user != this.current_polp.author) {
          this.show_likes = true;
          console.log("this.show_likes=true; ", this.user, this.current_polp.author, this.show_likes);
        }
        //TODO

        //var solutionsRef = firebase.database().ref(`/userProfile/${this.user}`).child('/solutions')
        var solutionsRef = this.solutionsDP.get_user_solution(this.user);
        var that = this;
        solutionsRef.orderByChild("polp_id").equalTo(this.current_polp.id).on("child_added", function(data) {
          console.log("Equal to filter: " + data.val().polp_id);
          that.show_solve_it = false;
       });
        
        //END OF TODO
      });

    console.log("entering polp detail data ");
    this.wp = this.current_polp.word_problem;
    this.likes = this.current_polp.likes;
    let promise = this.polpDP.getImage(this.current_polp.author, this.current_polp.visual_problem);
    promise.then(url => {
      console.log(url);
      (<HTMLInputElement>document.getElementById('pd_visual_problem')).src = url;
    }
    );

  }
  load_polp_details(): any {
    this.wp = this.current_polp.word_problem;
    let promise = this.polpDP.getImage(this.afAuth.auth.currentUser.uid, this.current_polp.visual_problem);
    promise.then(url => (<HTMLInputElement>document.getElementById('pd_visual_problem')).src = url);
    this.likes = this.current_polp.likes;
    //throw new Error("Method not implemented.");
  }
  liked() {
    console.log("liked");
    this.polpDP.set_like();
    this.profileDP.update_likes(this.current_polp.id);
  }
  close() {
    //this.polpDP.remove_polp();
    //this.viewCtrl.dismiss();
    this.navCtrl.setRoot(ExplorePage);
    console.log("cerando");
    //this.navCtrl.pop();
  }
  public solve_it(){
    this.navCtrl.push(SolvePage,{polp_id: this.current_polp.id, author: this.current_polp.author});
  }
}
