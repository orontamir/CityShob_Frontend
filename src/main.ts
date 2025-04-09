import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { TodoListComponent } from './app/components/todo-list/todo-list.component';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(TodoListComponent, {
  providers: [importProvidersFrom(HttpClientModule), provideAnimations()]
}).catch(err => console.error(err));
