import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HomePage } from "../home/home";

/**
 * Generated class for the SendPolpPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-send-polp',
  templateUrl: 'send-polp.html',
})
export class SendPolpPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SendPolpPage');
  }
  gotoCreatePolp(){
    this.navCtrl.popAll();
    this.navCtrl.setRoot(HomePage);
  }
}
