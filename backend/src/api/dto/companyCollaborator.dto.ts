export interface CompanyCollaboratorDto {
  id: string;
  companyId: string;
  userId: string;
  role: string;
  status: 'ATTIVO' | 'INATTIVO';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CompanyCollaboratorListResponse {
  content: CompanyCollaboratorDto[];
  page: number;
  size: number;
  total: number;
}
