import { Component, Renderer } from '@angular/core';
import { Platform } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { NavController, ViewController, Events, NavParams } from 'ionic-angular';
//import { HomePage } from "../../pages/home/home";
//import { WriteProblemPage } from '../../pages/write-problem/write-problem';
import { PolpDataProvider } from "../../providers/polp-data/polp-data";
//import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireAuth } from 'angularfire2/auth';
//import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import 'fabric';
import { ExplorePage } from "../explore/explore";
import { ProfileProvider } from "../../providers/profile/profile";
import { SolutionsProvider } from "../../providers/solutions/solutions";

declare let fabric: any;
declare var window: any; // global variable for paths
//declare var cordova: any; // global variable for paths
@Component({
  selector: 'page-solve',
  templateUrl: 'solve.html',
})
export class SolvePage {
  show_likes: boolean;
  user: any;
  current_polp: any;
  canvas: any;
  //private original_image: any;
  //private brushcolor: string;
  //@ViewChild('my_canvas') canvas: any;
  private currentColour: string = '#000000';
  private availableColours: any;
  private size: number = 5;

  private f_canvas;
  //private square;
  private circle;
  //private triangle;
  private line;
  //private text;

  private wp:any ="";
  private wpo: fabric.IText;

  private tool_selected = "";
  private started = false;
  private x = 0;
  private y = 0;

  constructor(private navCtrl: NavController, 
    public viewCtrl: ViewController, 
    public platform: Platform, 
    public renderer: Renderer, 
    public loadingCtrl: LoadingController, 
    private afAuth: AngularFireAuth, 
    private polpDP: PolpDataProvider, 
    public event: Events,
    private navParams: NavParams,
    private profileDP: ProfileProvider,
    private solutionProvider: SolutionsProvider) {
      this.availableColours = [
        '#dd0000',
        '#000000',
        '#00dd00',
        '#ffdd00'
    ];
    this.profileDP.getUserProfile().on('value', userProfileSnapshot => {
      this.user = userProfileSnapshot.key;
    });
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
        /*if (this.user != this.current_polp.author) {
          this.show_likes = true;
          console.log("this.show_likes=true; ", this.user, this.current_polp.author, this.show_likes);
        }*/
      });

    console.log("entering solving data ");
    this.wp = this.current_polp.word_problem;

    //this.likes = this.current_polp.likes;
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
    //this.likes = this.current_polp.likes;
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad SolvePage');
    this.f_canvas = new fabric.Canvas('my_canvas');
    this.f_canvas.setHeight(2000);
    this.f_canvas.setWidth(window.innerWidth);
    this.f_canvas.width = window.innerWidth;
    this.f_canvas.height = 1000;
    this.f_canvas.selection = true;
    
    this.f_canvas.freeDrawingBrush.width = 4; // size of the drawing brush
    this.currentColour = this.availableColours[1];
    this.event.subscribe('uploaded_vs', (data) => {
        console.log("listened uploaded_vs");
        this.navigateToExplorePage(data);
    });
    this.f_canvas.on('path:created', function(e) {  
        //var mouse = that.f_canvas.getPointer(options.e);          
        var p = e.path;
        p.originX = 'left';
        p.originY = 'top';
        p.fill = this.currentColour;
        p.opacity = .6;
      });
      this.loadBackground();
    //this.polpDP.presentToast("draw something that makes the problem clearer or cooler");
    this.draw_text();
    var that = this;
    this.f_canvas.isDrawingMode = false;
    this.f_canvas.on('mouse:down', function (o) { that.mousedown(o); });
    this.f_canvas.on('mouse:move', function (e) { that.mousemove(e); });
    this.f_canvas.on('mouse:up', function (e) { that.mouseup(e); });
  }
  mousedown(ob) {
    console.log("mousedown");
    var mouse = this.f_canvas.getPointer(ob.e);
    this.started = true;
    this.x = mouse.x;
    this.y = mouse.y;
    switch(this.tool_selected){
        case "square":
            var square = new fabric.Rect({ 
                width: 0, 
                height: 0, 
                left: this.x, 
                top: this.y, 
                fill: this.currentColour,
                opacity: .6,
                selectable: true
            });
            this.f_canvas.add(square);
            this.f_canvas.renderAll();
            this.f_canvas.setActiveObject(square);
            break;
        case "triangle":
            var triangle = new fabric.Triangle({ 
                width: 0, 
                height: 0, 
                left: this.x, 
                top: this.y, 
                fill: this.currentColour,
                opacity: .6,
                selectable: true
            });
            this.f_canvas.add(triangle);
            this.f_canvas.renderAll();
            this.f_canvas.setActiveObject(triangle);
            break;
        case "circle":
            var circle = new fabric.Circle({ 
                width: 0, 
                height: 0, 
                left: this.x, 
                top: this.y,
                radius: 0, 
                fill: this.currentColour,
                opacity: .6,
                selectable: true
            });
            this.f_canvas.add(circle);
            this.f_canvas.renderAll();
            this.f_canvas.setActiveObject(circle);
            break;
        case "line":
            var line = new fabric.Line({ 
                width: 0, 
                height: 0, 
                left: this.x, 
                top: this.y, 
                fill: this.currentColour,
                opacity: .6,
                selectable: true
            });
            this.f_canvas.add(line);
            this.f_canvas.renderAll();
            this.f_canvas.setActiveObject(line);
            break;
        }

    
    //this.f_canvas.setActiveObject(square); 
}
/* Mousemove */
mousemove(ob) {

if(!this.started) {
    return false;
}

var mouse = this.f_canvas.getPointer(ob.e);

var w = Math.abs(mouse.x - this.x),
h = Math.abs(mouse.y - this.y);

if (!w || !h) {
    return false;
}
switch(this.tool_selected){
    case "square":
        var square = this.f_canvas.getActiveObject(); 
        square.set('width', w).set('height', h);
        break;
    case "circle":
        var circle = this.f_canvas.getActiveObject(); 
        //circle.set('width', w).set('height', h);
        circle.set('radius', w/2)
        break;
    case "triangle":
        var triangle = this.f_canvas.getActiveObject(); 
        triangle.set('width', w).set('height', h);
        break;
    case "line":
        var line = this.f_canvas.getActiveObject(); 
        line.set('width', w).set('height', h);
        break;
}

this.f_canvas.renderAll();

}

/* Mouseup */
mouseup(e) {

    if(this.started) {
        this.started = false;
    }
switch (this.tool_selected){
    case "square":
        var square = this.f_canvas.getActiveObject();
        //this.f_canvas.add(square); 
        
        break;
    case "circle":
        var circle = this.f_canvas.getActiveObject();
        //this.f_canvas.add(circle); 
        
        break;
    case "triangle":
        var triangle = this.f_canvas.getActiveObject();
        //this.f_canvas.add(triangle); 
        
        break;
    case "line":
        var line = this.f_canvas.getActiveObject();
        //this.f_canvas.add(line); 
        
        break;
    }
    this.f_canvas.renderAll();
 }
  loadBackground() {
    //let ctx = this.f_canvas.getContext('2d');
        this.f_canvas.setBackgroundImage("assets/images/grid_paper.jpg", this.f_canvas.renderAll.bind(this.f_canvas), {
            height: window.innerHeight,
            width: window.innerWidth
        });         
}

changeColour(colour) {
    this.currentColour = colour;
}

changeSize(size) {
    this.size = size;
}
draw_rect() {
    this.f_canvas.isDrawingMode = false;
    this.tool_selected = "square";
}
draw_triangle() {
    this.f_canvas.isDrawingMode = false;
    this.tool_selected = "triangle";
}
draw_circle() {
    this.f_canvas.isDrawingMode = false;
    this.tool_selected = "circle";
}
draw_line() {
    this.f_canvas.isDrawingMode = false;
    this.tool_selected = "line";
}
draw() {
    this.tool_selected = "hand_drawing";
    this.f_canvas.freeDrawingBrush.color = this.currentColour; // set brushcolor to black to begin
    this.f_canvas.isDrawingMode = true;
}
draw_text() {
    this.f_canvas.isDrawingMode = false;
    //TODO: Include "data" section for the problem?
    /* var datos_title = new fabric.Text('Datos:', { left: 30, top: 50 });
    this.f_canvas.add(datos_title); */
    this.wpo = new fabric.IText('Click here and \nwrite your solution \n;-)', {
        fontFamily: 'monospace',
        fontSize: 18,
        left: 30,
        top: 100,
        width: 350,
        textBackgroundColor: 'rgba(250,250,250, .7)',
        lineHeight: 1
    });
    this.f_canvas.add(this.wpo);
}
select(){
    this.tool_selected = "selection_tool";
    this.f_canvas.isDrawingMode = false;
}
remove_object() {
    var delete_this = this.f_canvas.getActiveObject();
    this.f_canvas.remove(delete_this);
}
undo_last_object = function () {
    var canvas_objects = this.f_canvas._objects;
    var last = canvas_objects[canvas_objects.length - 1];
    this.f_canvas.remove(last);
    this.f_canvas.renderAll();
}
save_solution_to_problem() {
    let saved_picture = this.f_canvas.toDataURL();
    console.log("saving edited picture..." + saved_picture);
    //Get the word prolem if it existes
    if (this.wpo){
        this.f_canvas.setActiveObject(this.wpo);
        var txt = this.f_canvas.getActiveObject();
        this.wp = txt.text;
    }
    // To define the type of the Blob
    //var contentType = "image/png";
    // Split the base64 string in data and contentType
    //var block = saved_picture.split(";");
    // Get the content type
    //var dataType = block[0].split(":")[1];// In this case "image/png"
    // get the real base64 content of the file
    //var realData = block[1].split(",")[1];// In this case "iVBORw0KGg...."
    //let base64Image = dataType + realData;
    //upload image
    console.log("solving current polp id", this.current_polp.id);
    this.solutionProvider.upload_visual_solution(saved_picture, this.afAuth.auth.currentUser.uid, this.wp, this.current_polp.id)
    //.then(function() { 
        //upload word problem as text
        //this.solutionProvider.upload_solution_text(this.wp, this.afAuth.auth.currentUser.uid);
    //});
        
}

close() {
    this.polpDP.remove_polp();
    this.viewCtrl.dismiss();
    this.navCtrl.setRoot(ExplorePage);
}

public navigateToExplorePage(w) {
    console.log("navigating from canvas solution draw");
    this.navCtrl.setRoot(ExplorePage, { new_polp_solution: true, polp_id: this.polpDP.get_id(), author: this.afAuth.auth.currentUser.uid });
}
ionViewWillLeave() {
    this.polpDP.dismissLoading();
}
ionViewDidLeave() {
    console.log("leaving solving");
    this.event.unsubscribe('uploaded_solution');
}
}
