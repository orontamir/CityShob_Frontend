import { Component, HostListener  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    MatTableModule,
    HttpClientModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatListModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
  animations: [
    trigger('transitionMessages', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
      ])
    ])
  ]
})
export class TaskListComponent {
  tasks$: Observable<Task[]>;
  newTaskControl = new FormControl('');
  displayedColumns: string[] = ['id', 'title', 'completed', 'edit', 'delete'];
  dataSource: Task[];
  editingId: string | null = null;
  constructor(private taskService: TaskService) {
    this.tasks$ = this.taskService.tasks$;
    this.dataSource = [];

  }
  ngOnInit(): void {
    this.tasks$.subscribe((tasks: Task[]) => {
      tasks.map(task =>
        task._id === this.editingId ? { ...task, locked: false } : task
      )
      this.dataSource = tasks;
    });
  }

  addTask(): void {
    const title = this.newTaskControl.value?.trim();
    if (title) {
      this.taskService.addTask(title);
      this.newTaskControl.reset();
    }
  }

  enableEditing(task: Task): void {
    if (task.locked) {
      alert('Cannot edit a task that is being edited by another user.');
      return;
    }
    this.editingId = task._id;
    task.locked = true;
    this.taskService.updateTask(task, task.title);
  }

  updateTitle(event: any, task: Task): void {
    if (task.title !== event.target.value)
    {
      task.title = event.target.value;
      this.editingId = null;
      task.locked = false;
      this.taskService.updateTask(task, task.title);
    }
  }

  updatecompleted(task: Task): void{
    if (task.locked) {
      task.completed = !task.completed;
      alert('Cannot update completed task that is being edited by another user.');

      return;
    }
    this.taskService.updateTask(task, task.title);
  }

  deleteRow(task: Task): void {
    if (task.locked) {
      alert('Cannot delete a task that is being edited by another user.');
      return;
    }
    const index = this.dataSource.findIndex(element => element._id === task._id);
    if (index > -1) {
      this.dataSource.splice(index, 1);
      this.taskService.deleteTask(task);
      this.dataSource = [...this.dataSource];
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.editingId)
    {
      const task = this.dataSource.find(task => task._id === this.editingId);
      if (task) {
        task.locked = false;
        this.taskService.updateTask(task, task.title);
      }
    }
  }
}
