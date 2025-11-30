import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  // استخدام Logo Baytology
  logoUrl = '/Baytology_image.png'; 
  
  isLoggedIn = input<boolean>(false);
  userAvatar = input<string>('https://lh3.googleusercontent.com/aida-public/AB6AXuCdA1q0aXTGOCiuY4u5o6L3jjwuxlwbsVHPTTmTyS_TL8suHTWX6kW_-GPqmoHs8XEIm6xh4p9mwELrC7WyIB5iWQ_OalJB7muCRQTP09IMPLkEUdHjjSLmigwAXIYjy-c_PARIsfT9gMstiBuEyhNfTTTONZ0MqKhkzHBkFHOKVj3z-foxF1wUmDR4WMG5vQOte6KeZYNxwCMAmzPtvHFY1pXTHKWNMaGZ-uatk0atdGkL0XnvElL4QNRw--ZLxQCuCatZYufNVho');
}