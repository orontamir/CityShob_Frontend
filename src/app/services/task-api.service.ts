import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TaskApiService {
  private apiUrl = 'http://localhost:3000/api/tasks';

  constructor(private http: HttpClient)
  {

  }

  getTasks(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl);
  }

  createTask(task: Partial<Todo>): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, task);
  }

  updateTask(taskId: string, task: Partial<Todo>): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/${taskId}`, task);
  }

  deleteTask(taskId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${taskId}`);
  }
}
