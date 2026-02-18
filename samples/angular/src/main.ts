// main.ts - Application bootstrap (standalone, zoneless)
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

// Angular 21+ uses zoneless change detection by default
// Change detection is triggered by signals, template events, and Angular APIs
bootstrapApplication(AppComponent).catch((err) => console.error(err));
