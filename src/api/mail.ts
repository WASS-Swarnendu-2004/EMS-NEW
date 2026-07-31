import api from "./axios";

export interface MailHistory {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  subject: string;
  message: string;
  attachment: string;
  sentAt: string;
}

// Send Mail
export const sendMail = async ({
  employee,
  subject,
  message,
}: {
  employee: string;
  subject: string;
  message: string;
}) => {
  try {
    const response = await api.post("/admin/mail", {
      employee,
      subject,
      message,
    });

    return response.data;
  } catch (error) {
    console.error("Send Mail Error:", error);
    throw error;
  }
};

// Get Mail History
export const getMailHistory = async (): Promise<MailHistory[]> => {
  try {
    const response = await api.get("/admin/mail");

    return response.data.mails.map((mail: any) => ({
      id: mail._id,
      employeeId: mail.employee._id,
      employeeName: mail.employee.fullName,
      employeeEmail: mail.employee.email,
      subject: mail.subject,
      message: mail.message,
      attachment: mail.attachment,
      sentAt: mail.sentAt,
    }));
  } catch (error) {
    console.error("Mail History Error:", error);
    throw error;
  }
};