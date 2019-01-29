import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SendPolpPage } from './send-polp';

@NgModule({
  declarations: [
    SendPolpPage,
  ],
  imports: [
    IonicPageModule.forChild(SendPolpPage),
  ],
  exports: [
    SendPolpPage
  ]
})
export class SendPolpPageModule {}
