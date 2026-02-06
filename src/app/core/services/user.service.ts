import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserData {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage: string | null;
  userType: 'buyer' | 'agent' | 'admin';
  // Agent specific
  licenseNumber?: string;
  company?: string;
  experience?: string;
  specialization?: string;
  bio?: string;
  password?: string; // Only for registration
} 

// الصورة الافتراضية - أيقونة رمادية
export const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgMTIwIDEyMCI+CiAgPGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9IiNlNWU3ZWIiLz4KICA8Y2lyY2xlIGN4PSI2MCIgY3k9IjQ1IiByPSIyMCIgZmlsbD0iIzljYTNhZiIvPgogIDxwYXRoIGQ9Ik0yMCAxMDVjMC0yMiAxOC00MCA0MC00MHM0MCAxOCA0MCA0MCIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4=';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/users`;
  private authUrl = `${environment.apiUrl}/auth`;

  // حالة تسجيل الدخول
  isLoggedIn = signal(false);

  // بيانات المستخدم
  userData = signal<UserData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileImage: null,
    userType: 'buyer'
  });

  constructor() {
    this.checkSession();
  }

  // التحقق من الجلسة (لو مخزنة في localStorage)
  private checkSession() {
    if (typeof localStorage !== 'undefined') {
      const user = localStorage.getItem('user');
      if (user) {
        this.userData.set(JSON.parse(user));
        this.isLoggedIn.set(true);
      }
    }
  }

  // تسجيل مستخدم جديد
  registerUser(data: Partial<UserData>): Observable<any> {
    return this.http.post(`${this.authUrl}/register`, data).pipe(
      tap((response: any) => {
        this.setSession(response);
      })
    );
  }

  // تسجيل الدخول
  login(credentials: {email: string, password: string}): Observable<any> {
    return this.http.post(`${this.authUrl}/login`, credentials).pipe(
      tap((response: any) => {
        this.setSession(response);
      })
    );
  }

  // حفظ الجلسة
  private setSession(user: any) {
    // Map backend response to UserData interface if needed
    // Assuming backend returns matching fields
    const mappedUser: UserData = {
      firstName: user.firstName,
      lastName: user.lastName, 
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      userType: user.userType,
      _id: user._id, // Add _id to interface if needed
      ...user
    };

    this.userData.set(mappedUser);
    this.isLoggedIn.set(true);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(mappedUser));
    }
  }

  // تحديث بيانات المستخدم
  updateUser(id: string, data: Partial<UserData>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data).pipe(
      tap((updatedUser: any) => {
        this.userData.update(current => ({ ...current, ...updatedUser }));
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(this.userData()));
        }
      })
    );
  }

  // تحديث الصورة الشخصية
  updateProfileImage(id: string, image: string | null) {
    // This should ideally call an upload endpoint, but assuming base64 or url update
    return this.updateUser(id, { profileImage: image });
  }

  // الحصول على الصورة (الافتراضية إذا لم توجد)
  getProfileImage(): string {
    return this.userData().profileImage || DEFAULT_AVATAR;
  }

  // الحصول على الاسم الكامل
  getFullName(): string {
    const user = this.userData();
    return `${user.firstName} ${user.lastName}`.trim() || 'مستخدم جديد';
  }

  // تسجيل الخروج
  // الحصول على العقارات المفضلة (بيانات كاملة)
  getUserFavorites(): Observable<any[]> {
    const user = this.userData();
    if (!user._id) return new Observable(obs => obs.next([]));
    
    // If we have an ID, fetch from the dedicated endpoint
    return this.http.get<any[]>(`${this.apiUrl}/${user._id}/favorites`);
  }

  // محاكاة تسجيل الدخول الاجتماعي
  mockSocialLogin(provider: string) {
    const mockUser: UserData = {
      _id: 'mock-social-id',
      firstName: `${provider}`,
      lastName: 'User',
      email: `${provider.toLowerCase()}@example.com`,
      phone: '01000000000',
      profileImage: 'https://i.pravatar.cc/300?u=social',
      userType: 'buyer'
    };
    this.setSession(mockUser);
  }

  logout() {
    this.userData.set({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      profileImage: null,
      userType: 'buyer'
    });
    this.isLoggedIn.set(false);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('user');
    }
    this.router.navigate(['/auth/login']);
  }
}
