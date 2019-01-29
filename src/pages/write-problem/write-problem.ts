import { Component } from '@angular/core';
import { NavController, NavParams, Events, LoadingController } from 'ionic-angular';

//import { MapPage } from "../../pages/map/map";
import { AngularFireAuth } from "angularfire2/auth";
import { PolpDataProvider } from "../../providers/polp-data/polp-data";

@Component({
  selector: 'page-write-problem',
  templateUrl: 'write-problem.html',
})
export class WriteProblemPage {
  word_problem_text: String;
  visual_problem: any;

  constructor( public navCtrl: NavController, public navParams: NavParams, public loadingCtrl: LoadingController, private afAuth: AngularFireAuth, private polpDP: PolpDataProvider, public event: Events) {

  }
  ionViewDidEnter() {
    this.event.subscribe('uploaded_wp', (data) => {
      console.log("listened uploaded_wp");
      this.navigate_to_location(data);
    });
    
  }
  ionViewDidLoad() {
    /*console.log('ionViewDidLoad WriteProblemPage' + cordova.file.externalApplicationStorageDirectory);
    (<HTMLInputElement>document.getElementById('visual_problem')).src = cordova.file.externalApplicationStorageDirectory + 'newPoLP_edited.png';*/
    let promise = this.polpDP.getImage(this.afAuth.auth.currentUser.uid, this.polpDP.get_visual_problem());
    promise.then(url => (<HTMLInputElement>document.getElementById('visual_problem')).src = url);
    this.polpDP.dismissLoading();
  }
  showTextCard() {
    let word_problem_card = document.getElementById('word_problem_card');
    word_problem_card.style.visibility = "visible";
  }
  getText() {
    let word_problem = this.word_problem_text;
    console.log("accessing word problem text: " + word_problem);
    this.save_word_problem(word_problem)
  }
  save_word_problem(wp) {
    this.polpDP.upload_word_problem(wp, this.afAuth.auth.currentUser.uid);
  }
  navigate_to_location(w) {
    console.log("navigating from wp");
    //this.navCtrl.setRoot(MapPage);
  }
  close() {
    this.polpDP.remove_polp();
    this.navCtrl.pop();
  }
  /*drawText(wText:String) {
      let ctx = this.canvasElement.getContext('2d');
      ctx.font = "16px monospace";
  
      ctx.fillText(wText, 20,20);
      console.log("drawing text: "+wText);
  }*/
  ionViewWillLeave() {
    this.polpDP.dismissLoading();
    
  }
  ionViewDidLeave() {
    console.log("leaving word problem");
    this.event.unsubscribe('uploaded_wp');
  }
}
