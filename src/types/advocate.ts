export type ConsultationMode = "online" | "in_person" | "phone";

export interface AdvocateProfile {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  slug: string;
  headline?: string;
  bio?: string;
  city?: string;
  province?: string;
  qualification?: string;
  experienceYears?: number;
  practiceAreas: string[];
  barCouncil?: string;
  consultationFee?: number;
  consultationModes?: ConsultationMode[];
  ratingAverage?: number;
  ratingCount?: number;
  isListed?: boolean;
  verification?: {
    status: "pending" | "verified" | "rejected";
  };
}

export interface AdvocateSearchResponse {
  success: boolean;
  data: AdvocateProfile[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
