import { API_BASE_URL } from '../config';

export const getIconUrl = (iconPath: string): string => {
  if (iconPath.startsWith('/api/icons/')) {
    return `${API_BASE_URL.replace('/api', '')}/api/icons/${iconPath.split('/').pop()}`;
  }
  return iconPath;
};