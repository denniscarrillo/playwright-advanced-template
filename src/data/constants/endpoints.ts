export const API_ENDPOINTS = {
  AUTH: {
    CREATE_ACCOUNT: '/api/createAccount',
    DELETE_ACCOUNT: '/api/deleteAccount',
    VERIFY_LOGIN: '/api/verifyLogin',
    USER_DETAIL_BY_EMAIL: '/api/getUserDetailByEmail',
  },
  PRODUCTS: {
    LIST: '/api/productsList',
    SEARCH: '/api/searchProduct',
  },
  BRANDS: {
    LIST: '/api/brandsList',
  },
} as const;
