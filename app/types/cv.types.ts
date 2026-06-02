export interface CvData {
  nom: string;
  email: string;
  telephone: string;
  poste: string;
  skills: string[];
  experience: string;
  education: string;
  interests: string[];
  projects: string[];
  certificat: string;
}

export interface CvUploadResponse {
  message: string;
  cv_data: CvData;
  cv_path: string;
}

export interface CvValidateResponse {
  message: string;
  cv_data: CvData;
}