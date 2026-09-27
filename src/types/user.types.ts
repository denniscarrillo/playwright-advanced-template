export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserProfile extends UserCredentials {
  id?: string;
  name: string;
  role?: 'admin' | 'user' | 'guest';
}
