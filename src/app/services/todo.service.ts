import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Todo } from '../models/todo.model';
import { TaskApiService } from './task-api.service';
import { RealTimeService } from './realTime.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private todosSubject = new BehaviorSubject<Todo[]>([]);
  todos$ = this.todosSubject.asObservable();

  constructor(
    private taskApiService: TaskApiService,
    private realTimeService: RealTimeService
  ) {
    // Load initial data from the backend
    this.loadTasks();

    // Subscribe to socket events to keep the local task list in sync
    this.realTimeService.onTaskCreated().subscribe((newTask: Todo) => {
      this.addLocalTask(newTask);
    });
    this.realTimeService.onTaskUpdated().subscribe((updatedTask: Todo) => {
      this.updateLocalTask(updatedTask);
    });
    this.realTimeService.onTaskDeleted().subscribe((deletedTask: Todo) => {
      this.removeLocalTask(deletedTask._id);
    });
  }

  private loadTasks(): void {
    this.taskApiService.getTasks().subscribe({
      next: (tasks) => {
        console.log('Data received:', tasks);
        this.todosSubject.next(tasks);
      },
      error: (err) => {
        console.error('Error fetching tasks:', err);
      }
    });
  }


  // Add new task
  addTodo(title: string, extras?: Partial<Todo>): void {
    const newTask = {
      title,
      completed: false,
      locked: false
     } as Partial<Todo>;
    this.taskApiService.createTask(newTask).subscribe(task => {
      this.addLocalTask(task);
    });
  }

  // Update a task
  updateTodo(todo: Todo, updatedTitle: string): void {
    const updated = { title: updatedTitle, locked: todo.locked, completed: todo.completed};
    this.taskApiService.updateTask(todo._id, updated).subscribe(task => {
      this.updateLocalTask(task);
    });
  }

  // Delete a task
  deleteTodo(todo: Todo): void {
    this.taskApiService.deleteTask(todo._id).subscribe(() => {
      this.removeLocalTask(todo._id);
    });
  }

  private addLocalTask(task: Todo): void {
    const tasks = this.todosSubject.getValue();
    if (!tasks.some(t => t._id === task._id)) {
      this.todosSubject.next([...tasks, task]);
    }
  }

  private updateLocalTask(task: Todo): void {
    const tasks = this.todosSubject.getValue();
    const updatedTasks = tasks.map(t => t._id === task._id ? task : t);
    this.todosSubject.next(updatedTasks);
  }

  private removeLocalTask(taskId: string): void {
    const tasks = this.todosSubject.getValue();
    const updatedTasks = tasks.filter(t => t._id !== taskId);
    this.todosSubject.next(updatedTasks);
  }
}
