import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Team } from '../models/team';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TeamsService {
  private _teams = new BehaviorSubject<Team[]>([]);
  private dataStore: { teams: Team[] } = { teams: [] };
  readonly teams = this._teams.asObservable();
  private _error = new BehaviorSubject<string>("");
  readonly error = this._error.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) { }

  loadAll(managerLogin?: string) {
    const token = this.authService.currentUserValue.token;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    if (managerLogin)
    {
      this.http.post<any>(`${environment.apiUrl}/teams/filter`, {field: "manager", value: managerLogin}, {headers: headers}).subscribe(
        data => {
          this.dataStore.teams = data.body.Items;
          this._teams.next(Object.assign({}, this.dataStore).teams);
      }, () => this._error.next("Cannot load teams"));
    } else {
      this.http.get<any>(`${environment.apiUrl}/teams/all`, {headers: headers}).subscribe(
        data => {
          this.dataStore.teams = data.body;
          this._teams.next(Object.assign({}, this.dataStore).teams);
      }, () => this._error.next("Cannot load teams"));
    }
  }

  load(name: string) {
    const token = this.authService.currentUserValue.token;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>(`${environment.apiUrl}/teams/${name}`, { headers: headers}).subscribe(data => {
      let notFound = true;
      let team: Team = data.body.Item;

      this.dataStore.teams.forEach((item, index) => {
        if (item.teamName === team.teamName) {
          this.dataStore.teams[index] = team;
          notFound = false;
        }
      });

      if (notFound) {
        this.dataStore.teams.push(team);
      }

      this._teams.next(Object.assign({}, this.dataStore).teams);
    }, error => this._error.next('Could not load team.'));
  }

  create(team: Team) {
    const token = this.authService.currentUserValue.token;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    let teamToUpdate = Team.prepareToUpdate(team);

    this.http.post<Team>(`${environment.apiUrl}/teams`, JSON.stringify(teamToUpdate), {headers: headers}).subscribe(data => {
      this.load(team.teamName);
    }, error => this._error.next('Could not create team.'));
  }

  update(team: Team) {
    const token = this.authService.currentUserValue.token;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    let teamToUpdate = Team.prepareToUpdate(team);
    this.http.post<Team>(`${environment.apiUrl}/teams/`, JSON.stringify(teamToUpdate), {headers: headers}).subscribe(() => {
      this.load(team.teamName);
    }, error => this._error.next('Could not update team.'));
  }

  getTeamsOf(managerLogin: string) {
      return this.dataStore.teams.filter(team => team.manager === managerLogin);
  }

  getTeam(teamName: string) {
      return this.dataStore.teams.filter(team => team.teamName === teamName)[0];
  }

  remove(teamName: string) {
    const token = this.authService.currentUserValue.token;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.http.delete(`${environment.apiUrl}/teams/${teamName}`, {headers: headers}).subscribe(response => {
      this.dataStore.teams.forEach((t, i) => {
        if (t.teamName === teamName) { this.dataStore.teams.splice(i, 1); }
      });

      this._teams.next(Object.assign({}, this.dataStore).teams);
    }, error => this._error.next('Could not delete team.'));
  }
}
