export interface EmployeeField {
  id: string;
  label: string;
  name: string;
  type:
    | "text"
    | "email"
    | "number"
    | "date"
    | "textarea"
    | "select";

  options?: string[];
  required?: boolean;
  removable?: boolean;
}

export const defaultEmployeeFields: EmployeeField[] = [
  {
    id: crypto.randomUUID(),
    label: "Full Name",
    name: "fullName",
    type: "text",
    required: true,
    removable: false,
  },
  {
    id: crypto.randomUUID(),
    label: "Email",
    name: "email",
    type: "email",
    required: true,
    removable: false,
  },
  {
    id: crypto.randomUUID(),
    label: "Password",
    name: "password",
    type: "text",
    required: true,
    removable: false,
  },
  {
    id: crypto.randomUUID(),
    label: "Phone",
    name: "phone",
    type: "text",
    required: true,
    removable: false,
  },
  {
  id: crypto.randomUUID(),
  label: "Designation",
  name: "designation",
  type: "select",
  required: true,
  removable: false,
},
  {
    id: crypto.randomUUID(),
    label: "Department",
    name: "department",
    type: "text",
    required: true,
    removable: false,
  },
  {
    id: crypto.randomUUID(),
    label: "Monthly Gross Salary (₹)",
    name: "salary",
    type: "number",
    required: true,
    removable: false,
  },
  {
    id: crypto.randomUUID(),
    label: "Joining Date",
    name: "joiningDate",
    type: "date",
    required: true,
    removable: false,
  },
  {
    id: crypto.randomUUID(),
    label: "ID Proof",
    name: "idProof",
    type: "text",
    removable: false,
  },
  // {
  //   id: crypto.randomUUID(),
  //   label: "PAN",
  //   name: "pan",
  //   type: "text",
  //   removable: false,
  // },
  {
    id: crypto.randomUUID(),
    label: "Bank Account",
    name: "bankAccount",
    type: "text",
    removable: false,
  },
  {
    id: crypto.randomUUID(),
    label: "Emergency Contact",
    name: "emergencyContact",
    type: "text",
    removable: false,
  },
  {
    id: crypto.randomUUID(),
    label: "Status",
    name: "status",
    type: "select",
    options: ["Active", "Inactive"],
    removable: false,
  },
  {
    id: crypto.randomUUID(),
    label: "Address",
    name: "address",
    type: "textarea",
    removable: false,
  },
];