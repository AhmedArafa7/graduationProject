export interface Report {
  _id?: string;
  reporter: string; // User ID
  property: string; // Property ID
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt?: string;
  // Populated fields
  reporterName?: string;
  propertyTitle?: string;
}
