import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../models/task.model';
import { TaskApiService } from './task-api.service';
import { RealTimeService } from './realTime.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  constructor(
    private taskApiService: TaskApiService,
    private realTimeService: RealTimeService
  ) {
    // Load initial data from the backend
    this.loadTasks();

    // Subscribe to socket events to keep the local task list in sync
    this.realTimeService.onTaskCreated().subscribe((newTask: Task) => {
      this.addLocalTask(newTask);
    });
    this.realTimeService.onTaskUpdated().subscribe((updatedTask: Task) => {
      this.updateLocalTask(updatedTask);
    });
    this.realTimeService.onTaskDeleted().subscribe((deletedTask: Task) => {
      this.removeLocalTask(deletedTask._id);
    });
  }

  private loadTasks(): void {
    this.taskApiService.getTasks().subscribe({
      next: (tasks) => {
        console.log('Data received:', tasks);
        this.tasksSubject.next(tasks);
      },
      error: (err) => {
        console.error('Error fetching tasks:', err);
      }
    });
  }


  // Add new task
  addTask(title: string, extras?: Partial<Task>): void {
    const newTask = {
      title,
      completed: false,
      locked: false
     } as Partial<Task>;
    this.taskApiService.createTask(newTask).subscribe(task => {
      this.addLocalTask(task);
    });
  }

  // Update a task
  updateTask(task: Task, updatedTitle: string): void {
    const updated = { title: updatedTitle, locked: task.locked, completed: task.completed};
    this.taskApiService.updateTask(task._id, updated).subscribe(task => {
      this.updateLocalTask(task);
    });
  }

  // Delete a task
  deleteTask(task: Task): void {
    this.taskApiService.deleteTask(task._id).subscribe(() => {
      this.removeLocalTask(task._id);
    });
  }

  private addLocalTask(task: Task): void {
    const tasks = this.tasksSubject.getValue();
    if (!tasks.some(t => t._id === task._id)) {
      this.tasksSubject.next([...tasks, task]);
    }
  }

  private updateLocalTask(task: Task): void {
    const tasks = this.tasksSubject.getValue();
    const updatedTasks = tasks.map(t => t._id === task._id ? task : t);
    this.tasksSubject.next(updatedTasks);
  }

  private removeLocalTask(taskId: string): void {
    const tasks = this.tasksSubject.getValue();
    const updatedTasks = tasks.filter(t => t._id !== taskId);
    this.tasksSubject.next(updatedTasks);
  }
}
