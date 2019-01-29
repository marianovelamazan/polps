import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  //LatLng,
  CameraPosition,
  MarkerOptions,
  //HtmlInfoWindow,
  Marker
} from '@ionic-native/google-maps';
import { Component } from '@angular/core';
import { PolpDetailPage } from "../polp-detail/polp-detail";
//import { NavController, NavParams } from 'ionic-angular';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation';
import { Events, NavController, LoadingController, NavParams } from "ionic-angular";
import { AngularFireAuth } from "angularfire2/auth";
import { PolpDataProvider } from "../../providers/polp-data/polp-data";
import { HomePage } from "../home/home";
import { ProfilePage } from "../profile/profile";
//import { NgZone } from '@angular/core';
import { ProfileProvider } from "../../providers/profile/profile";

declare var google: any;

@Component({
  selector: 'page-explore',
  templateUrl: 'explore.html',
})

export class ExplorePage {
  user_points: any;
  user: any;
  new_PoLP_pos: Geoposition;
  new_polp: any;

  polp_detail_page = PolpDetailPage;
  options: GeolocationOptions;
  //PoLPpos: Geoposition;
  explorer_map: GoogleMap;

  public polps_list: Array<any>;
//private zone: NgZone, 
  constructor(public profileDP: ProfileProvider, public navCtrl: NavController, private googleMaps: GoogleMaps, private geolocation: Geolocation, public loadingCtrl: LoadingController, private afAuth: AngularFireAuth, private polpDP: PolpDataProvider, public event: Events, public navParams: NavParams) {
    this.new_polp = navParams.get('new_polp');
    console.log("this.new_polp "+this.new_polp);

    /*this.polp_id = navParams.get("polp_id");*/

    this.profileDP.getUserProfile().on('value', userProfileSnapshot => {
      this.user = userProfileSnapshot.val();
      this.user_points = userProfileSnapshot.val().points;
    });
  }
  ionViewDidEnter() {
    if (this.new_polp) {
      this.event.subscribe('uploaded_loc', (data) => {
        console.log("new polp location uploaded");
      });
    }   
    /*this.event.subscribe('profile_ready', (data) => {
      console.log("listened to profile ready");
      this.user_points = this.profileDP.get_points();
    }); */
    this.user_points = this.profileDP.get_points();
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ExplorePage');
    this.polpDP.get_all_polps_list().on('value', snapshot => {
      this.polps_list = [];
      snapshot.forEach(snap => {
        //console.log("this.polps_list: " + snap)
        this.polps_list.push({
          id: snap.key,
          polp_id: snap.val().id,
          author: snap.val().author,
          location: snap.val().location,
        });

        return false
      });
    });
    this.getUserPosition();
  }
  ngAfterViewInit() {
    //this.getUserPosition();
    //this.loadMap();
  }
  getUserPosition() {
    this.options = {
      enableHighAccuracy: true
    };
    var that = this;
    this.geolocation.getCurrentPosition(this.options).then((pos: Geoposition) => {

      that.new_PoLP_pos = pos;
      console.log("user position: " + that.new_PoLP_pos);
      this.loadMap(pos.coords.latitude, pos.coords.longitude);

    }, (err: PositionError) => {
      console.log("error en user position: " + err.message);
    });
  }
  loadMap(mylat, mylong) {
    // create a new map by passing HTMLElement
    let map_element: HTMLElement = document.getElementById('polp_explorer');

    this.explorer_map = this.googleMaps.create(map_element);
    // You must wait for this event to fire before adding something to the map or modifying it in anyway
    let position: CameraPosition = {
      target: {
        lat: mylat,
        lng: mylong
      },
      zoom: 13,
      tilt: 45
    };

    // listen to MAP_READY event
    // You must wait for this event to fire before adding something to the map or modifying it in anyway
    this.explorer_map.one(GoogleMapsEvent.MAP_READY).then(
      () => {
        this.polpDP.dismissLoading();
        console.log('Explore Map is ready!');
        // Now you can add elements to the map like the marker
        // move the map's camera to position
        this.explorer_map.moveCamera(position);
        this.explorer_map.setMapTypeId("MAP_TYPE_SATELLITE");
//marker,
        var  i;
        //var markers: Array<any> = new Array();
        for (i = 0; i < this.polps_list.length; i++) {
          let markerOptions: MarkerOptions = {
            position: {
              lat: this.polps_list[i].location.coords.latitude,
              lng: this.polps_list[i].location.coords.longitude
            },
            title: this.polps_list[i].author,
            snippet: this.polps_list[i].polp_id,
            //icon: this.polps_list[i].visual_problem
          };
          
          this.explorer_map.addMarker(markerOptions)
            .then((marker: Marker) => {
              //marker.showInfoWindow();
              marker.addEventListener(GoogleMapsEvent.INFO_CLICK).subscribe(
                (data) => {
                  this.navCtrl.setRoot(PolpDetailPage, { polp_id: marker.getSnippet(), author: marker.getTitle() });
                }
              );
            });
        }
        if(this.new_polp){
          this.add_new_polp(mylat, mylong);
        }
      });
      
  }
  add_new_polp(mlat, mlong){
    console.log("adding new polp to map here: "+mlat+", "+mlong);
    let markerOptions: MarkerOptions = {
      position: {
        lat:  mlat,
        lng:  mlong
      },
      title: 'new polp',
      snippet: 'click here to see the details',
      icon: 'http://maps.google.com/mapfiles/marker_yellow.png'
    };
    this.explorer_map.addMarker(markerOptions)
    .then((marker: Marker) => {
      marker.showInfoWindow();
      //this.addInfoWindow(marker, 'mycontent')
      marker.addEventListener(GoogleMapsEvent.INFO_CLICK).subscribe(
        (data) => {
          this.navCtrl.setRoot(PolpDetailPage, { polp_id: this.polpDP.get_id(), author: this.afAuth.auth.currentUser.uid, likes: 0 });
        }
      );

    });
    //upload location
    this.polpDP.upload_location(this.new_PoLP_pos, this.afAuth.auth.currentUser.uid);
    //add point
    this.polpDP.set_point();
    this.notify_classmates();
  }
  gotoProfilePage() {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    //this.nav.pop();
    this.navCtrl.push(ProfilePage);
  }
  notify_classmates(): any {
    console.log("notifying class mates");
    this.polpDP.publish_polp(true);
    return true;
  }
  close() {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    //this.zone.run(() => {
    //  this.navCtrl.pop();
    //  this.navCtrl.setRoot(HomePage);
    //});
  }
  create_polp() {
    //this.zone.run(() => {
      //this.navCtrl.popAll();
    this.navCtrl.setRoot(HomePage);
    //});
  }
  /*ngOnDestroy() {
    document.getElementsByClassName("app-root")[0].setAttribute("style", "opacity:0");
  }*/
  ionViewWillLeave() {
    this.clearMap(this.explorer_map);
  }

  clearMap(map) {
    map.clear();
  }

  ngOnDestroy() {
    this.explorer_map.remove();
    this.explorer_map = null;
  }

}
