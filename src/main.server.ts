import { ApplicationRef } from '@angular/core';
import {
  bootstrapApplication,
  BootstrapContext,
} from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

export function app(context: BootstrapContext): Promise<ApplicationRef> {
  return bootstrapApplication(AppComponent, appConfig, context);
}

export default app;

