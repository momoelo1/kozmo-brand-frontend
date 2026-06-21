import axiosInstance from "./axios";

const getOrderBySession = async (sessionId) => {
  const response = await axiosInstance.get(`/orders/session/${sessionId}`);
  return response.data;
};

export default { getOrderBySession };
