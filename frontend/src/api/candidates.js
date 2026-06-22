import apiClient from "./client";

export const uploadResumes = async (jobId, files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await apiClient.post(
    `/resumes/upload/${jobId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};

export const extractCandidates = async (jobId) => {
  const response = await apiClient.post(`/processing/extract/${jobId}`);
  return response.data;
};

export const matchCandidates = async (jobId) => {
  const response = await apiClient.post(`/processing/match/${jobId}`);
  return response.data;
};

export const getRankedCandidates = async (jobId) => {
  const response = await apiClient.get(`/resumes/ranked/${jobId}`);
  return response.data;
};