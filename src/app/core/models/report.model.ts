export interface Report {
  _id?: string;
  reporter: string | any; // User ID or populated User object
  property: string | any; // Property ID or populated Property object
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt?: string;
  // Populated fields
  reporterName?: string;
  propertyTitle?: string;
}
