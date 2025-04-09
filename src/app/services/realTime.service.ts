import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

const SOCKET_ENDPOINT = 'http://localhost:3000';

@Injectable({
  providedIn: 'root'
})
export class RealTimeService {
  private socket: Socket;

  constructor() {
    this.socket = io(SOCKET_ENDPOINT);
  }

  // Listen for a 'taskCreated' event
  onTaskCreated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('taskCreated', (data) => {
        observer.next(data);
      });
    });
  }

  // Listen for a 'taskUpdated' event
  onTaskUpdated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('taskUpdated', (data) => {
        observer.next(data);
      });
    });
  }

  // Listen for a 'taskDeleted' event
  onTaskDeleted(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('taskDeleted', (data) => {
        observer.next(data);
      });
    });
  }

}
