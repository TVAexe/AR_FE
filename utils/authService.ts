import * as SecureStore from "expo-secure-store";

export const storeUser = async (authUser: any) => {
  await SecureStore.setItemAsync("authUser", JSON.stringify(authUser));
};

export const getUser = async () => {
  const stored = await SecureStore.getItemAsync("authUser");
  return stored ? JSON.parse(stored) : null;
};

export const getToken = async () => {
  const stored = await SecureStore.getItemAsync("authUser");
  if (!stored) return null;
  return JSON.parse(stored).token;
};

export const clearUser = async () => {
  await SecureStore.deleteItemAsync("authUser");
};

export const logout = async () => {
  await clearUser();
};
