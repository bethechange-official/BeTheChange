const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const nativeFetch = globalThis.fetch.bind(globalThis);

interface AdminAuthData {
  admin: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  accessToken: string;
}

type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  category: string;
  collection?: string;
  skinConcern?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  size?: string;
  isFeatured: boolean;
  isActive: boolean;
  images: string[];
};

type CouponListItem = {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscountAmount?: number;
  startDate: string;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
};

type CouponDetail = CouponListItem & {
  description?: string;
  maximumDiscountAmount?: number;
};

type CategoryListItem = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  productsCount: number;
};

type CollectionListItem = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  productsCount: number;
};

type CustomerListItem = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'Active' | 'Inactive';
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
};

type CustomerDetail = CustomerListItem & {
  addresses: Array<{
    id: string;
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }>;
  orders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    orderStatus: string;
    paymentStatus: string;
    createdAt: string;
  }>;
};

type OrderListItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
};

type OrderDetail = OrderListItem & {
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressName: string;
  addressPhone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  couponId?: string;
  couponCode?: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  coupon?: {
    code: string;
    discountType: 'PERCENTAGE' | 'FLAT';
    discountValue: number;
  };
  createdAt: string;
  updatedAt: string;
};

type DashboardData = {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    orderStatus: string;
    paymentStatus: string;
    createdAt: string;
  }>;
  salesByPeriod: Array<{ month: string; sales: number; orders: number }>;
};

type SettingsData = {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  shippingFee: number;
  freeShippingThreshold: number;
  lowStockAlertThreshold: number;
  currency: string;
};

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  errors?: Array<{ field: string; message: string }>;
}

let accessToken: string | null = null;

const fetch = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
  const url = String(input);
  let response = await nativeFetch(input, { ...init, credentials: 'include' });
  const isAuthRequest = url.includes('/admin/auth/login') || url.includes('/admin/auth/refresh');
  if (response.status !== 401 || isAuthRequest) return response;

  const refresh = await nativeFetch(`${API_BASE_URL}/admin/auth/refresh`, { method: 'POST', credentials: 'include' });
  if (!refresh.ok) return response;
  const payload = await refresh.json();
  const nextToken = payload.data?.accessToken;
  if (!nextToken) return response;
  setAccessToken(nextToken);
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${nextToken}`);
  response = await nativeFetch(input, { ...init, headers, credentials: 'include' });
  return response;
};

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

const getAuthHeader = () => {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('btc_admin_auth');
      window.location.href = '/admin/login';
    }
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const adminApi = {
  async login(email: string, password: string): Promise<ApiResponse<AdminAuthData>> {
    const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse<ApiResponse<AdminAuthData>>(response);
    if (data.success && data.data?.accessToken) {
      setAccessToken(data.data.accessToken);
    }
    return data;
  },

  async logout(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    const data = await handleResponse<ApiResponse>(response);
    if (data.success) {
      setAccessToken(null);
    }
    return data;
  },

  async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
    const response = await fetch(`${API_BASE_URL}/admin/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const data = await handleResponse<ApiResponse<{ accessToken: string }>>(response);
    if (data.success && data.data?.accessToken) {
      setAccessToken(data.data.accessToken);
    }
    return data;
  },

  async getProfile(): Promise<ApiResponse<AdminAuthData['admin']>> {
    const response = await fetch(`${API_BASE_URL}/admin/auth/me`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse<ApiResponse<AdminAuthData['admin']>>(response);
  },

  async getDashboard(): Promise<ApiResponse<{
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    pendingOrders: number;
    lowStockProducts: number;
    recentOrders: Array<{
      id: string;
      orderNumber: string;
      customerName: string;
      customerEmail: string;
      totalAmount: number;
      orderStatus: string;
      paymentStatus: string;
      createdAt: string;
    }>;
    salesByPeriod: Array<{ month: string; sales: number; orders: number }>;
  }>> {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(response);
  },

  async getProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    collection?: string;
    isActive?: boolean;
    stockStatus?: 'IN' | 'LOW' | 'OUT';
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<ApiResponse<Array<ProductListItem>>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const query = searchParams.toString();
    const response = await fetch(`${API_BASE_URL}/admin/products${query ? `?${query}` : ''}`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(response);
  },

  async getProductById(id: string): Promise<ApiResponse<{
    id: string;
    name: string;
    slug: string;
    category: string;
    collection?: string;
    skinConcern?: string;
    price: number;
    originalPrice?: number;
    stock: number;
    size?: string;
    shortDescription?: string;
    description?: string;
    ingredients?: string;
    benefits?: string;
    usageInstructions?: string;
    isFeatured: boolean;
    isActive: boolean;
    images: string[];
  }>> {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(response);
  },

  async createProduct(data: {
    name: string;
    slug: string;
    category: string;
    collection?: string;
    skinConcern?: string;
    price: number;
    originalPrice?: number;
    stock: number;
    size?: string;
    shortDescription?: string;
    description?: string;
    ingredients?: string;
    benefits?: string;
    usageInstructions?: string;
    isFeatured?: boolean;
    isActive?: boolean;
    images?: string[];
  }): Promise<ApiResponse<{ id: string }>> {
    const response = await fetch(`${API_BASE_URL}/admin/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateProduct(id: string, data: Partial<{
    name: string;
    slug: string;
    category: string;
    collection?: string;
    skinConcern?: string;
    price: number;
    originalPrice?: number;
    stock: number;
    size?: string;
    shortDescription?: string;
    description?: string;
    ingredients?: string;
    benefits?: string;
    usageInstructions?: string;
    isFeatured?: boolean;
    isActive?: boolean;
    images?: string[];
  }>): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteProduct(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(response);
  },

  async getCategories(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    isActive: boolean;
    productsCount: number;
  }>>> {
    const response = await fetch(`${API_BASE_URL}/admin/categories`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(response);
  },

  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{ id: string }>> {
    const response = await fetch(`${API_BASE_URL}/admin/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateCategory(id: string, data: {
    name?: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
  }): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteCategory(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(response);
  },

  async getCollections(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    isActive: boolean;
    productsCount: number;
  }>>> {
    const response = await fetch(`${API_BASE_URL}/admin/collections`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(response);
  },

  async createCollection(data: {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{ id: string }>> {
    const response = await fetch(`${API_BASE_URL}/admin/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateCollection(id: string, data: {
    name?: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
  }): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/collections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteCollection(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/collections/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(response);
  },

  async getCoupons(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'Active' | 'Inactive';
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<ApiResponse<Array<CouponListItem>>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const query = searchParams.toString();
    const response = await fetch(`${API_BASE_URL}/admin/coupons${query ? `?${query}` : ''}`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(response);
  },

  async getCouponById(id: string): Promise<ApiResponse<{
    id: string;
    code: string;
    description?: string;
    discountType: 'PERCENTAGE' | 'FLAT';
    discountValue: number;
    minimumOrderAmount: number;
    maximumDiscountAmount?: number;
    startDate: string;
    expiryDate: string;
    usageLimit: number;
    usedCount: number;
    isActive: boolean;
  }>> {
    const response = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(response);
  },

  async createCoupon(data: {
    code: string;
    description?: string;
    discountType: 'PERCENTAGE' | 'FLAT';
    discountValue: number;
    minimumOrderAmount?: number;
    maximumDiscountAmount?: number;
    startDate: string;
    expiryDate: string;
    usageLimit: number;
    isActive?: boolean;
  }): Promise<ApiResponse<{ id: string }>> {
    const response = await fetch(`${API_BASE_URL}/admin/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateCoupon(id: string, data: {
    code?: string;
    description?: string;
    discountType?: 'PERCENTAGE' | 'FLAT';
    discountValue?: number;
    minimumOrderAmount?: number;
    maximumDiscountAmount?: number;
    startDate?: string;
    expiryDate?: string;
    usageLimit?: number;
    isActive?: boolean;
  }): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async toggleCouponStatus(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/coupons/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(response);
  },

  async deleteCoupon(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(response);
  },

  async getCustomers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'Active' | 'Inactive';
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<ApiResponse<Array<CustomerListItem>>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const query = searchParams.toString();
    const response = await fetch(`${API_BASE_URL}/admin/customers${query ? `?${query}` : ''}`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(response);
  },

  async getCustomerById(id: string): Promise<ApiResponse<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    status: 'Active' | 'Inactive';
    totalOrders: number;
    totalSpent: number;
    joinedDate: string;
    addresses: Array<{
      id: string;
      name: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      pincode: string;
      isDefault: boolean;
    }>;
    orders: Array<{
      id: string;
      orderNumber: string;
      totalAmount: number;
      orderStatus: string;
      paymentStatus: string;
      createdAt: string;
    }>;
  }>> {
    const response = await fetch(`${API_BASE_URL}/admin/customers/${id}`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(response);
  },

  async updateCustomerStatus(id: string, isActive: boolean): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/customers/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ isActive }),
    });
    return handleResponse(response);
  },

  async getOrders(params: {
    page?: number;
    limit?: number;
    search?: string;
    orderStatus?: string;
    paymentStatus?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<ApiResponse<Array<OrderListItem>>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const query = searchParams.toString();
    const response = await fetch(`${API_BASE_URL}/admin/orders${query ? `?${query}` : ''}`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(response);
  },

  async getOrderById(id: string): Promise<ApiResponse<{
    id: string;
    orderNumber: string;
    userId?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    addressName: string;
    addressPhone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    subtotal: number;
    discountAmount: number;
    shippingFee: number;
    totalAmount: number;
    couponId?: string;
    couponCode?: string;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    items: Array<{
      id: string;
      productId: string;
      productName: string;
      price: number;
      quantity: number;
      image?: string;
    }>;
    coupon?: {
      code: string;
      discountType: 'PERCENTAGE' | 'FLAT';
      discountValue: number;
    };
    createdAt: string;
    updatedAt: string;
  }>> {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${id}`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(response);
  },

  async updateOrderStatus(id: string, data: {
    orderStatus?: string;
    paymentStatus?: string;
  }): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async getSettings(): Promise<ApiResponse<{
    storeName: string;
    storeEmail: string;
    storePhone: string;
    storeAddress: string;
    shippingFee: number;
    freeShippingThreshold: number;
    lowStockAlertThreshold: number;
    currency: string;
  }>> {
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(response);
  },

  async updateSettings(data: {
    storeName?: string;
    storeEmail?: string;
    storePhone?: string;
    storeAddress?: string;
    shippingFee?: number;
    freeShippingThreshold?: number;
    lowStockAlertThreshold?: number;
    currency?: string;
  }): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async uploadImages(files: File[]): Promise<ApiResponse<{ images: Array<{ filename: string; url: string }> }>> {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    const response = await fetch(`${API_BASE_URL}/admin/upload`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    });
    return handleResponse(response);
  },
};

export const handleApiError = (error: unknown): { message: string; errors?: Array<{ field: string; message: string }> } => {
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: 'An unexpected error occurred' };
};
