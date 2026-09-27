export interface ProductCategory {
  usertype: {
    usertype: string;
  };
  category: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  brand: string;
  category: ProductCategory;
}

export interface Brand {
  id: number;
  brand: string;
}

export interface ProductsApiResponse {
  responseCode: number;
  products?: Product[];
  message?: string;
}

export interface BrandsApiResponse {
  responseCode: number;
  brands?: Brand[];
  message?: string;
}

export interface UserDetail {
  id: number;
  name: string;
  email: string;
  title: string;
  birth_day: string;
  birth_month: string;
  birth_year: string;
  first_name: string;
  last_name: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
}

export interface UserDetailApiResponse {
  responseCode: number;
  user?: UserDetail;
  message?: string;
}

export interface GenericApiResponse {
  responseCode: number;
  message?: string;
}
