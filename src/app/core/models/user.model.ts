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

export const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgMTIwIDEyMCI+CiAgPGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9IiNlNWU3ZWIiLz4KICA8Y2lyY2xlIGN4PSI2MCIgY3k9IjQ1IiByPSIyMCIgZmlsbD0iIzljYTNhZiIvPgogIDxwYXRoIGQ9Ik0yMCAxMDVjMC0yMiAxOC00MCA0MC00MHM0MCAxOCA0MCA0MCIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4=';
