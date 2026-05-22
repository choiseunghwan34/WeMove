import api from "./axiosInstance";

export const getMe = (memberId) =>
  api.get("/members/me", {
    params: { memberId },
  });

export const updateMe = (memberId, data, image) => {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );

  if (image) {
    formData.append("image", image);
  }

  return api.put("/members/me", formData, {
    params: { memberId },
  });
};

export const getMember = (id) => api.get("/members/" + id);
