import { Injectable, signal } from '@angular/core';
import { Observable, of, delay, tap } from 'rxjs';

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage: string | null;
  userType: 'buyer' | 'agent';
  // Agent specific
  licenseNumber?: string;
  company?: string;
  experience?: string;
  specialization?: string;
  bio?: string;
}

// الصورة الافتراضية - أيقونة رمادية
export const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgMTIwIDEyMCI+CiAgPGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9IiNlNWU3ZWIiLz4KICA8Y2lyY2xlIGN4PSI2MCIgY3k9IjQ1IiByPSIyMCIgZmlsbD0iIzljYTNhZiIvPgogIDxwYXRoIGQ9Ik0yMCAxMDVjMC0yMiAxOC00MCA0MC00MHM0MCAxOCA0MCA0MCIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4=';

@Injectable({
  providedIn: 'root'
})
export class UserService {
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

  // تسجيل مستخدم جديد
  registerUser(data: Partial<UserData>): Observable<boolean> {
    return of(true).pipe(
      delay(1500), // محاكاة وقت الاتصال
      tap(() => {
        this.userData.update(current => ({
          ...current,
          ...data
        }));
        this.isLoggedIn.set(true);
      })
    );
  }

  // تحديث بيانات المستخدم
  updateUser(data: Partial<UserData>) {
    this.userData.update(current => ({
      ...current,
      ...data
    }));
  }

  // تحديث الصورة الشخصية
  updateProfileImage(image: string | null) {
    this.userData.update(current => ({
      ...current,
      profileImage: image
    }));
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
  }
}
