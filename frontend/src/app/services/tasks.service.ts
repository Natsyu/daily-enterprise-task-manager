import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {environment} from 'src/environments/environment';
import {Task} from '../models/task';
import {v4 as uuidv4} from 'uuid';
import {AuthService} from './auth.service';
import {Language} from '../models/language.enum';
import {User} from "../models/user";
import {Role} from "../models/role.enum";

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private _tasksByMembers = new BehaviorSubject<Map<string, Task[]>>(new Map());
  private _tasksByUser = new BehaviorSubject<Task[]>([]);
  private dataStore: { tasksByMembers: Map<string, Task[]> } = {tasksByMembers: new Map()};
  private userDataStore: { tasksByUser: Task[] } = {tasksByUser: new Array()};
  readonly tasksByMembers = this._tasksByMembers.asObservable();
  readonly tasksByUser = this._tasksByUser.asObservable();
  private _error = new BehaviorSubject<string>("");
  readonly error = this._error.asObservable();
  private sorter = (a: Task, b: Task) => a.priority - b.priority;

  constructor(private http: HttpClient, private authService: AuthService) {
  }

  loadAll(teamName: string, language: Language) {
    const token = this.authService.currentUserValue.token;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.http.post<any>(`${environment.apiUrl}/tasks/filter/`, {
        field: "teamName",
        value: teamName,
        language: `${language}`
      },
      {headers: headers}).subscribe(data => {
      let tasks = data.body.Items;
      this.dataStore.tasksByMembers = new Map<string, Task[]>();
      tasks.forEach(t => {
        let userLogin = t.userLogin ? t.userLogin : 'unassigned';
        if (this.dataStore.tasksByMembers.has(userLogin))
          this.dataStore.tasksByMembers.get(userLogin).push(t);
        else
          this.dataStore.tasksByMembers.set(userLogin, [t])
      });
      this.dataStore.tasksByMembers.forEach((val, key) => val.sort(this.sorter));
      this._tasksByMembers.next(Object.assign({}, this.dataStore).tasksByMembers);
    }, error => this._error.next('Could not load tasks.'));
  }

  loadForUser(login: string, language: Language) {
    const token = this.authService.currentUserValue.token;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.http.post<any>(`${environment.apiUrl}/tasks/filter/`, {
      field: "userLogin",
      value: login,
      language: `${language}`
    }, {headers: headers}).subscribe(data => {
      this.userDataStore.tasksByUser = data.body.Items;
      this._tasksByUser.next(Object.assign({}, this.userDataStore).tasksByUser);
    }, error => this._error.next('Could not load tasks.'));
  }

  create(task: Task, language: Language) {
    const token = this.authService.currentUserValue.token;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    let tasks = this.dataStore.tasksByMembers.get(task.userLogin ? task.userLogin : 'unassigned');

    task.id = uuidv4();
    task.priority = tasks.length == 0 ? 1 : tasks[tasks.length - 1].priority + 1;
    tasks.push(task);
    tasks.sort(this.sorter);

    this.http.post<Task>(`${environment.apiUrl}/tasks`, JSON.stringify(task), {headers: headers}).subscribe(data => {
      this.loadAll(task.teamName, language);
    }, error => this._error.next('Could not create task.'));
  }

  update(task: Task, language: Language) {
    const token = this.authService.currentUserValue.token;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    let taskToUpdate = Task.createToUpdate(task);

    this.http.post<Task>(`${environment.apiUrl}/tasks`, JSON.stringify(taskToUpdate), {headers: headers}).subscribe(data => {
      this.loadAll(task.teamName, language);
    }, error => this._error.next('Could not update task.'));
  }

  updatePriorities(userLogin: string) {
    const token = this.authService.currentUserValue.token;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.prepareTasksToUpdatePriority(userLogin)

    let tasks = this.dataStore.tasksByMembers.get(userLogin);
    if (tasks.length !== 0) {
      this.http.post<any>(`${environment.apiUrl}/tasks/updatepriority`, JSON.stringify(tasks), {headers: headers}).subscribe(data => {
      }, error => this._error.next('Could not update task.'));
    }
  }

  private prepareTasksToUpdatePriority(userLogin: string) {
    let tasks = this.dataStore.tasksByMembers.get(userLogin);
    tasks.forEach((val, idx) => val.priority = idx);
  }

  remove(task: Task) {
    const token = this.authService.currentUserValue.token;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    const user = this.authService.currentUserValue;


    this.http.delete(`${environment.apiUrl}/tasks/${task.id}`, {headers: headers}).subscribe(response => {
      // console.log(response)
      if (user.userRole == Role.Manager) {
        this.dataStore.tasksByMembers?.get(task.userLogin ? task.userLogin : 'unassigned').forEach((t, i) => {
          if (t.id === task.id) {
            this.dataStore.tasksByMembers.get(task.userLogin ? task.userLogin : 'unassigned').splice(i, 1);
          }
        });
        this._tasksByMembers.next(Object.assign({}, this.dataStore).tasksByMembers);
      } else if (user.userRole == Role.Worker) {
        this.userDataStore.tasksByUser?.forEach((t, i) => {
          if (t.id === task.id) {
            this.userDataStore.tasksByUser.splice(i, 1);
          }
        });
        this._tasksByUser.next(Object.assign({}, this.userDataStore).tasksByUser);
      }
    }, error => {
      console.log(error)
      this._error.next('Could not delete task.')
    });
  }

  notify(task: Task) {
    const token = this.authService.currentUserValue.token;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(`${environment.apiUrl}/tasks/remind`, {
      "message": `Kindly remind about your task to finish today. Task info:
    Title: ${task.title}, Task description: ${task.description}, Team: ${task.teamName}, Assigned: ${task.userLogin}`
    }, {headers: headers});
  }
}
