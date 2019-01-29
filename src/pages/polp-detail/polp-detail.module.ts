import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PolpDetailPage } from './polp-detail';

@NgModule({
  declarations: [
    PolpDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(PolpDetailPage),
  ],
  exports: [
    PolpDetailPage
  ]
})
export class PolpDetailPageModule {}
