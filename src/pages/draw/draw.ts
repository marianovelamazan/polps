import { Component, Renderer } from '@angular/core';
import { Platform } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { NavController, ViewController,  Events } from 'ionic-angular';
//import { HomePage } from "../../pages/home/home";
//import { WriteProblemPage } from '../../pages/write-problem/write-problem';
import { PolpDataProvider } from "../../providers/polp-data/polp-data";
//import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireAuth } from 'angularfire2/auth';
//import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import 'fabric';
import { ExplorePage } from "../explore/explore";

declare let fabric: any;
declare var window: any; // global variable for paths
//declare var cordova: any; // global variable for paths

@Component({
    selector: 'page-draw',
    templateUrl: 'draw.html',
})
export class DrawPage {
    canvas: any;
    //private original_image: any;
    //private brushcolor: string;

    //@ViewChild('my_canvas') canvas: any;
    private currentColour: string = '#000000';
    private availableColours: any;
    private size: number = 5;

    //private offset:number = 20;
    //private original_image_path: any;
    //private visual_problem: String;

    private f_canvas;
    private tool_selected = "";
    //private boundBox;
    //private square;
    private circle;
    //private triangle;
    private line;
    //private text;

    private wp:any ="";
    private wpo: fabric.IText;

    private started = false;
    private x = 0;
    private y = 0;

    constructor(private navCtrl: NavController, public viewCtrl: ViewController, public platform: Platform, public renderer: Renderer, public loadingCtrl: LoadingController, private afAuth: AngularFireAuth, private polpDP: PolpDataProvider, public event: Events) {
        console.log('Hello CanvasDraw page');

        this.availableColours = [
            '#dd0000',
            '#000000',
            '#00dd00',
            '#ffdd00'
        ];
    }
    ionViewDidEnter() {

    }

    ionViewDidLoad() {

        this.f_canvas = new fabric.Canvas('my_canvas');
        this.f_canvas.setHeight(window.innerHeight);
        this.f_canvas.setWidth(window.innerWidth);
        this.f_canvas.width = window.innerWidth;
        this.f_canvas.height = window.innerHeight;
        this.f_canvas.selection = true;
        
        this.f_canvas.freeDrawingBrush.width = 4; // size of the drawing brush
        this.currentColour = this.availableColours[1];
        this.event.subscribe('uploaded_vp', (data) => {
            console.log("listened uploaded_vp");
            this.navigateToWriteProblem(data);
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
    loadBackground() {
        //let ctx = this.f_canvas.getContext('2d');
        this.polpDP.dismissLoading();
        let promise = this.polpDP.getImage(this.afAuth.auth.currentUser.uid, this.polpDP.get_original_image_name());
        promise.then(url => {
            this.f_canvas.setBackgroundImage(url, this.f_canvas.renderAll.bind(this.f_canvas), {
                height: window.innerHeight,
                width: window.innerWidth
            });            
        });
        
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
        this.wpo = new fabric.IText('Click here and \nwrite a \ndifficult problem \nhere \n;-)', {
            fontFamily: 'monospace',
            fontSize: 18,
            left: 20,
            top: 60,
            width: 350,
            textBackgroundColor: 'rgba(250,250,250, .7)',
            lineHeight: 1
        });
        this.f_canvas.add(this.wpo);
    }
    select(){
        this.tool_selected = "selection_tool"
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
    save_visual_problem() {
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
        this.polpDP.upload_visual_problem(saved_picture, this.afAuth.auth.currentUser.uid);
        //upload word problem as text
        this.polpDP.upload_word_problem(this.wp, this.afAuth.auth.currentUser.uid);
        
    }

    close() {
        this.polpDP.remove_polp();
        this.viewCtrl.dismiss();
        this.navCtrl.pop();
    }

    public navigateToWriteProblem(w) {
        console.log("navigating from canvas draw");
        this.navCtrl.setRoot(ExplorePage, { new_polp: true, polp_id: this.polpDP.get_id(), author: this.afAuth.auth.currentUser.uid });
    }
    ionViewWillLeave() {
        this.polpDP.dismissLoading();
    }
    ionViewDidLeave() {
        console.log("leaving drawing");
        this.event.unsubscribe('uploaded_vp');
    }
}
