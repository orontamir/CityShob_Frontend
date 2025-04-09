import { Component, HostListener  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { Todo } from '../../models/todo.model';
import { TodoService } from '../../services/todo.service';
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
  selector: 'app-todo-list',
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
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
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
export class TodoListComponent {
  todos$: Observable<Todo[]>;
  newTodoControl = new FormControl('');
  displayedColumns: string[] = ['id', 'title', 'completed', 'edit', 'delete'];
  dataSource: Todo[];
  editingId: string | null = null;
  constructor(private todoService: TodoService) {
    this.todos$ = this.todoService.todos$;
    this.dataSource = [];

  }
  ngOnInit(): void {
    this.todos$.subscribe((todos: Todo[]) => {
      todos.map(todo =>
        todo._id === this.editingId ? { ...todo, locked: false } : todo
      )
      this.dataSource = todos;
    });
  }

  addTodo(): void {
    const title = this.newTodoControl.value?.trim();
    if (title) {
      this.todoService.addTodo(title);
      this.newTodoControl.reset();
    }
  }

  enableEditing(todo: Todo): void {
    if (todo.locked) {
      alert('Cannot edit a task that is being edited by another user.');
      return;
    }
    this.editingId = todo._id;
    todo.locked = true;
    this.todoService.updateTodo(todo, todo.title);
  }

  updateTitle(event: any, todo: Todo): void {
    if (todo.title !== event.target.value)
    {
      todo.title = event.target.value;
      this.editingId = null;
      todo.locked = false;
      this.todoService.updateTodo(todo, todo.title);
    }
  }

  updatecompleted(todo:Todo): void{
    if (todo.locked) {
      todo.completed = !todo.completed;
      alert('Cannot update completed task that is being edited by another user.');

      return;
    }
    this.todoService.updateTodo(todo, todo.title);
  }

  deleteRow(todo: Todo): void {
    if (todo.locked) {
      alert('Cannot delete a task that is being edited by another user.');
      return;
    }
    const index = this.dataSource.findIndex(element => element._id === todo._id);
    if (index > -1) {
      this.dataSource.splice(index, 1);
      this.todoService.deleteTodo(todo);
      this.dataSource = [...this.dataSource];
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.editingId)
    {
      const todo = this.dataSource.find(todo => todo._id === this.editingId);
      if (todo) {
        todo.locked = false;
        this.todoService.updateTodo(todo, todo.title);
      }
    }
  }
}
