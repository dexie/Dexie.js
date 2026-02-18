// main.ts - Application bootstrap (standalone)
import 'zone.js';  // Required for Angular change detection
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent).catch((err) => console.error(err));
