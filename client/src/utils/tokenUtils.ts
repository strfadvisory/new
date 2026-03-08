export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const checkTokenExpiration = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return true;
  
  if (isTokenExpired(token)) {
    localStorage.removeItem('token');
    return true;
  }
  
  return false;
};