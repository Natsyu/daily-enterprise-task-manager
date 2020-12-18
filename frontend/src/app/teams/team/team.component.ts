import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from 'src/app/models/task';
import { Team } from 'src/app/models/team';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { TasksService } from 'src/app/services/tasks.service';
import { faTrash, faEdit, faBell } from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Language } from 'src/app/models/language.enum';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {
  
    @Input()
    team: Team;

    tasks: Observable<Task[]>;
    clickedTask: BehaviorSubject<Task> = new BehaviorSubject<Task>(null);
    
    wasTrashClicked = false;
    wasNotifyClicked = false;
    
    currentTaskForm: FormGroup;
    teamNameForm: FormGroup;
    teamDepartmentForm: FormGroup;
    teamLanguageControl: FormControl;

    tmpTags = [];
    submitted = false;
    loadingName = false;
    loadingDepartment = false;

    @ViewChild('modalCloseButton') modalCloseButton;

    // icons
    faTrash = faTrash;
    faEdit = faEdit;
    faBell = faBell;

    constructor(private authService: AuthService, private tasksService: TasksService, private fb: FormBuilder,) { }

    ngOnInit(): void {
        const manager = this.authService.currentUserValue;
        this.team = {name: "team1", department: "department1", manager: manager, members: [new User({login: "druciak"}),new User({login: "blablabla@bla.com"}),new User({login: "haluu@bla.com"}),
            new User({login: "kasia@bla.com"}), new User({login: "dobranoc@bla.com"})]};

        this.tasks = this.tasksService.tasks;
        this.tasksService.loadAll(this.team.name, manager.language);

        this.teamLanguageControl = new FormControl(manager.language);

        this.teamLanguageControl.valueChanges.subscribe((language: any) => {
            this.onLanguageChange(language);
        });

        this.teamNameForm = this.fb.group({
            teamName: [this.team.name, Validators.required]
        });

        this.teamDepartmentForm = this.fb.group({
            departmentName: [this.team.department, Validators.required]
        });
    }

    get f() { return this.currentTaskForm.controls; }

    addTask(userLogin?: string)
    {
        this.clickedTask.next(new Task({userLogin: userLogin}));
        this.setCurrentForm();
    }

    setCurrentForm()
    {
        const task = this.clickedTask.value;

        this.currentTaskForm = this.fb.group({
            title: [task.title ? task.title : '', Validators.required],
            description: [task.description ? task.description : ''], 
            user: [task.userLogin ? task.userLogin : 'unassigned'],
            duration: [task.duration ? task.duration : ''],
            status: [task.status]
        });

        this.tmpTags = [];
        
        task.tags.forEach(t => this.tmpTags.push({display: t, value: t}));
    }

    getTasksByMembers(userLogin?: string)
    {
        return this.tasksService.getTasksOf(userLogin);
    }

    onTrashClicked()
    {
        this.wasTrashClicked = true;
    }

    onTaskClicked(taskId: number)
    {
        this.tasks.subscribe(tasks => this.clickedTask.next(tasks.find(task => task.id === taskId)));
        this.setCurrentForm();
    }

    closeModal()
    {
        this.wasTrashClicked = false;
        this.wasNotifyClicked = false;
        this.clickedTask.next(null);
        this.submitted = false;
    }

    deleteClickedTask()
    {
        this.tasksService.remove(this.clickedTask.value.id);
        this.closeModal();
    }

    notifyClickedTask()
    {
        // TODO make notifying
    }

    outsideClicked()
    {
        this.wasTrashClicked = false;
        this.wasNotifyClicked = false;
    }

    onSave()
    {
        this.submitted = true;
        if (this.currentTaskForm.valid)
        {
            let task = this.clickedTask.value;
            if (task.id)
            {
                task.title = this.currentTaskForm.get('title').value;
                task.description = this.currentTaskForm.get('description').value;
                task.userLogin = this.currentTaskForm.get('user').value === "unassigned" ? null :
                    this.currentTaskForm.get('user').value;
                task.tags = [];
                this.tmpTags.forEach(t => task.tags.push(t.value));
                task.duration = this.currentTaskForm.get('duration').value;
                task.status = this.currentTaskForm.get('status').value;
                this.tasksService.update(task);
            } else {
                const nTask = new Task({
                    title: this.currentTaskForm.get('title').value, 
                    description: this.currentTaskForm.get('description').value, 
                    userLogin: this.currentTaskForm.get('user').value === "unassigned" ? null :
                        this.currentTaskForm.get('user').value, 
                    tags: [], 
                    duration: this.currentTaskForm.get('duration').value,
                    teamName: this.team.name,
                    status: this.currentTaskForm.get('status').value
                });
                this.tmpTags.forEach(t => nTask.tags.push(t.value));
                this.tasksService.create(nTask);
            }
            this.modalCloseButton.nativeElement.click();
        }
    }

    onLanguageChange(language: Language)
    {
        this.tasksService.loadAll(this.team.name, language);
    }

    onTeamNameChange()
    {
        // TODO
        this.loadingName = true;
        console.log(`Change team name to: ${this.teamNameForm.get('teamName').value}`);
        this.loadingName = false;
        // this.teamService.changeName(this.team.name, name);
    }

    onTeamDepartmentChange()
    {
        // TODO
        this.loadingDepartment = true;
        console.log(`Change team department to: ${this.teamDepartmentForm.get('departmentName').value}`);
        this.loadingDepartment = false;
        // this.teamService.changeDepartment(this.team.department, name);
    }

    onNotifyClicked()
    {
        this.wasNotifyClicked = true;
    }
}
