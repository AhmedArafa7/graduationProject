export interface Agent {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city?: string; // Added for location filtering
  profileImage: string;
  avatar?: string; // fallback or alias for profileImage
  userType: 'agent';
  agentProfile: {
    title: string;
    licenseNumber: string;
    company: string;
    experience: string;
    specialization: string;
    bio: string;
    rating: number;
    reviewsCount: number;
    activeProperties: number;
    verified: boolean;
    socialLinks: {
      facebook: string;
      linkedin: string;
      twitter: string;
    };
  };
  // Optional flat fields for UI/Mocking
  name?: string;
  title?: string;
  experience?: string;
  deals?: number;
  rating?: number;
}
