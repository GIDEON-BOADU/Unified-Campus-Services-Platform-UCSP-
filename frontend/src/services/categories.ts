import { apiClient, API_ENDPOINTS } from './api';
import { Category } from '../types';

export const getCategories = async (): Promise<Category[]> => {
  try {
    return await apiClient.get<Category[]>(API_ENDPOINTS.SERVICES.LIST);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
};

export const createCategory = async (data: Partial<Category>): Promise<Category> => {
  return apiClient.post<Category>(API_ENDPOINTS.SERVICES.CREATE, data);
};

export const updateCategory = async (id: number, data: Partial<Category>): Promise<Category> => {
  return apiClient.put<Category>(API_ENDPOINTS.SERVICES.UPDATE(id.toString()), data);
};

export const deleteCategory = async (id: number): Promise<void> => {
  return apiClient.delete<void>(API_ENDPOINTS.SERVICES.DELETE(id.toString()));
};