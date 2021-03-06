import {Component, Injectable, OnInit} from '@angular/core';
import {UserService} from '../services/user.service';
import {Role} from '../models/role.enum';
import {Language} from '../models/language.enum';
import {User} from '../models/user';
import {AuthService} from '../services/auth.service';
import {UsersService} from '../services/users.service';
import {AlertService} from '../services/alert.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  newUser: User = new User();
  changedUser: User = new User();
  users: User[];
  searchText = '';
  isLoading = true;

  constructor(private usersService: UsersService, private userService: UserService, private alertService: AlertService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.usersService.users.subscribe(
      data => {
        this.users = data;
        this.isLoading = false;
      }
    );

    this.usersService.error.subscribe(error => {
      if (error !== "") {
        this.alertService.error(error);
        this.isLoading = false;
      }
    });
    this.isLoading = true;
    this.usersService.loadAll();
  }

  onDeleteUserClicked(userToDelete: User) {
    this.usersService.remove(userToDelete.login);
  }

  getRoleName(role: Role): string {
    var userRole = role.toString();
    if (userRole === '0') {
      return 'Admin';
    } else if (userRole === '1') {
      return 'Manager';
    } else if (userRole === '2') {
      return 'Worker';
    }
  }

  setUserRole(role: Role, user: User): void {
    user.userRole = role;
  }

  copyDataFromUser(user: User) {
    this.changedUser = user;
  }

  editUser() {
    this.usersService.update(this.changedUser);
  }

  addNewUser() {
    this.newUser.userLanguage = Language.ENG;
    this.usersService.create(this.newUser);
    this.newUser = new User();
  }
}
