export type UserRole = 'ADMIN' | 'GURU' | 'MURID';

export interface User {
  id: string;
  name: string;
  username: string;
  passwordHash: string; // Stored hash or credentials
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  avatar: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  
  // Specific profile refs
  grade?: number; // For Murid (e.g., 4, 5, 6)
  studentNumber?: string; // Absen
  nip?: string; // For Guru
  schoolName?: string; // Nama Sekolah
  teachingClass?: string; // Kelas yang Diampu
  subjectsHandled?: string[]; // Subject IDs
  classesHandled?: string[]; // Class IDs
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
