export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
}

export interface UserRegistrationData extends UserCredentials {
  title?: 'Mr' | 'Mrs';
  name: string;
  birthDay?: string;
  birthMonth?: string;
  birthYear?: string;
  newsletter?: boolean;
  specialOffers?: boolean;
  address: UserAddress;
}

export interface UserProfile extends UserCredentials {
  id?: string;
  name: string;
  role?: 'admin' | 'user' | 'guest';
}
