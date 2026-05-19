export const WEMOVE_USER_STORAGE_KEY = "wemoveUser";

export const getStoredUser = () => {
  try {
    const savedUser = localStorage.getItem(WEMOVE_USER_STORAGE_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    localStorage.removeItem(WEMOVE_USER_STORAGE_KEY);
    return null;
  }
};

export const removeStoredUser = () => {
  localStorage.removeItem(WEMOVE_USER_STORAGE_KEY);
};
