import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { TaskListComponent } from './app/components/task-list/task-list.component';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(TaskListComponent, {
  providers: [importProvidersFrom(HttpClientModule), provideAnimations()]
}).catch(err => console.error(err));
