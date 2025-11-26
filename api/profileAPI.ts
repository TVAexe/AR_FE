import axios from "@/utils/Axios";
import { getToken } from "@/utils/authService";

export interface updatePasswordData {
  oldPassword: string;
  newPassword: string;
}

export const deleteUser = async (id: string) => {
  const accessToken = await getToken();

  if (!accessToken) {
    throw new Error("User not logged in");
  }

  await axios.delete(`/api/v1/users/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const updatePassword = async (
  params: updatePasswordData
) => {
  const accessToken = await getToken();

  if (!accessToken) {
    throw new Error("User not logged in");
  }

  const response = await axios.put(
    `/api/v1/users/password`,
    params,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};
