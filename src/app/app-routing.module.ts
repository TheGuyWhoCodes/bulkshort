import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DisplayComponent } from './pages/display/display.component';

const routes: Routes = [
  {
    path:'',
    component: HomeComponent
  },
  {
    path:':id',
    component: DisplayComponent
  }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
