import axiosInstance from "./axios";

const create = async (data) => (await axiosInstance.post("/products", data)).data;
const update = async (id, data) => (await axiosInstance.patch(`/products/${id}`, data)).data;
const changePrice = async (id, priceEuros) =>
  (await axiosInstance.post(`/products/${id}/price`, { priceEuros })).data;
const archive = async (id) => (await axiosInstance.delete(`/products/${id}`)).data;
const uploadImage = async (file) => {
  const form = new FormData();
  form.append("image", file);
  const res = await axiosInstance.post("/products/upload-image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.url;
};

export default { create, update, changePrice, archive, uploadImage };
