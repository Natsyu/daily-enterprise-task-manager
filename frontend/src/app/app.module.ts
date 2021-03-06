import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { TagInputModule } from 'ngx-chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { AlertComponent } from './components/alert/alert.component';
import { TeamComponent } from './teams/team/team.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { TeamsComponent } from './teams/teams.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TeamsAdminComponent } from './teams-admin/teams-admin.component';
import { TeamAdminComponent } from './teams-admin/team-admin/team-admin.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { UsersComponent } from './users/users.component';
import { NgxTypeaheadModule } from "ngx-typeahead";
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import {WorkerTasksComponent} from "./worker-tasks/worker-tasks.component";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    AlertComponent,
    TeamComponent,
    BreadcrumbComponent,
    TeamsComponent,
    TeamsAdminComponent,
    TeamAdminComponent,
    UsersComponent,
    WorkerTasksComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    FontAwesomeModule,
    TagInputModule,
    BrowserAnimationsModule,
    DragDropModule,
    ScrollingModule,
    Ng2SearchPipeModule,
    NgxTypeaheadModule,
    NgbTypeaheadModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
