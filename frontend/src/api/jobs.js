import apiClient from "./client";

export const createJob = async (jobData) => {
  const response = await apiClient.post("/jobs/", jobData);
  return response.data;
};

export const getAllJobs = async () => {
  const response = await apiClient.get("/jobs/");
  return response.data;
};

export const getJobById = async (jobId) => {
  const response = await apiClient.get(`/jobs/${jobId}`);
  return response.data;
};