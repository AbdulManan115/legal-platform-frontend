export type ConsultationMode = "online" | "in_person" | "phone";

export interface AdvocateProfile {
  _id: string;
  slug: string;
  headline?: string;
  bio?: string;
  city?: string;
  province?: string;
  address?: string;
  qualification?: string;
  experienceYears?: number;
  practiceAreas: string[];
  barCouncil?: string;
  licenseNumber?: string;
  consultationFee?: number;
  consultationModes?: ConsultationMode[];
  ratingAverage?: number;
  ratingCount?: number;
  isListed?: boolean;
  verification?: {
    status: "pending" | "verified" | "rejected";
  };
  user?: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface AdvocateSearchResponse {
  success: boolean;
  data: {
    advocates: AdvocateProfile[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
    };
  };
}

export interface AdvocateProfileResponse {
  success: boolean;
  data: AdvocateProfile;
}
