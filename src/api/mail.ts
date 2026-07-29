import api from "./axios";

export interface Mail {
  id: string;
  toEmployeeId: string;
  subject: string;
  body: string;
  attachmentName?: string;
  sentAt: string;
}

export interface SendMailPayload {
  toEmployeeId: string;
  subject: string;
  body: string;
  attachmentName?: string;
}

export const getMailHistory = async (): Promise<Mail[]> => {
  try {
    const response = await api.get<Mail[]>(
      "" // <-- Add Get Mail History API Endpoint Here
    );

    return response.data;
  } catch (error) {
    console.error("Get Mail History Error:", error);
    throw error;
  }
};

export const sendMail = async (
  data: SendMailPayload
): Promise<Mail> => {
  try {
    const response = await api.post<Mail>(
      "", // <-- Add Send Mail API Endpoint Here
      data
    );

    return response.data;
  } catch (error) {
    console.error("Send Mail Error:", error);
    throw error;
  }
};