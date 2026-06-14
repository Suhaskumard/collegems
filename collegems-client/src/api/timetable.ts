import axiosInstance from "./axios";

export const getRooms = async () => {
  const response = await axiosInstance.get("/timetable/rooms");
  return response.data;
};

export const getTimeSlots = async () => {
  const response = await axiosInstance.get("/timetable/timeslots");
  return response.data;
};

export const getRules = async () => {
  const response = await axiosInstance.get("/timetable/rules");
  return response.data;
};

export const generateTimetable = async (data: { name: string; department?: string; semester?: number }) => {
  const response = await axiosInstance.post("/timetable/generate", data);
  return response.data;
};

export const getTimetables = async () => {
  const response = await axiosInstance.get("/timetable");
  return response.data;
};

export const getTimetableStatus = async (id: string) => {
  const response = await axiosInstance.get(`/timetable/${id}`);
  return response.data;
};

export const getTimetableEntries = async (id: string) => {
  const response = await axiosInstance.get(`/timetable/${id}/entries`);
  return response.data;
};
