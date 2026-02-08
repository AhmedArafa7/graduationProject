import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mortgage-info',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mortgage-info.component.html',
  styles: []
})
export class MortgageInfoComponent {}
