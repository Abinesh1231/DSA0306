import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});


export const registerUser = async (userData) => {
  const response = await API.post(
    "/auth/register",
    userData
  );

  return response.data;
};


export const loginUser = async (credentials) => {
  const response = await API.post(
    "/auth/login",
    credentials
  );

  return response.data;
};


export const uploadCommunications = async (file) => {

  const formData = new FormData();

  formData.append("file", file);

  const response = await API.post(
    "/communications/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};


export const getCommunications = async () => {

  const response = await API.get(
    "/communications/"
  );

  return response.data;
};


export const analyzeAllCommunications = async () => {

  const response = await API.post(
    "/threat/analyze-all"
  );

  return response.data;
};

export const getDashboardStats = async () => {
  const response = await API.get(
    "/dashboard/stats"
  );

  return response.data;
};

export const getThreatDetails = async (
  communicationId
) => {

  const response = await API.get(
    `/threat/${communicationId}`
  );

  return response.data;
};

export const getAlerts = async () => {

  const response = await API.get(
    "/alerts/"
  );

  return response.data;
};


export const getAlertSummary = async () => {

  const response = await API.get(
    "/alerts/summary"
  );

  return response.data;
};

export const getAnalytics = async () => {

  const response = await API.get(
    "/analytics/"
  );

  return response.data;
};

export default API;