import type { Employee } from "@/api/employee";

type EmployeeDetailsModalProps = {
  employee: Employee | null;
  onClose: () => void;
};

export function EmployeeDetailsModal({
  employee,
  onClose,
}: EmployeeDetailsModalProps) {
  if (!employee) {
    return null;
  }

  const imageUrl = employee.profileImage
    ? `https://fresh-01.onrender.com/${employee.profileImage.replace(
        /^src\//,
        "",
      )}`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold">
              Employee Details
            </h2>

            <p className="text-sm text-gray-500">
              {employee.employeeId}
            </p>
          </div>

          <button
            className="btn btn-sm btn-ghost"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Profile */}
          <div className="mb-6 flex items-center gap-5">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={employee.fullName}
                className="h-24 w-24 rounded-full object-cover border"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-2xl font-semibold text-gray-600">
                {employee.fullName
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div>
              <h3 className="text-2xl font-semibold">
                {employee.fullName}
              </h3>

              <p className="text-gray-500">
                {employee.designation}
              </p>

              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                  employee.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {employee.status}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem
              label="Employee ID"
              value={employee.employeeId}
            />

            <DetailItem
              label="Full Name"
              value={employee.fullName}
            />

            <DetailItem
              label="Email"
              value={employee.email}
            />

            <DetailItem
              label="Phone"
              value={employee.phone}
            />

            <DetailItem
              label="Designation"
              value={employee.designation}
            />

            <DetailItem
              label="Department"
              value={employee.department}
            />

            <DetailItem
              label="Monthly Gross Salary"
              value={`₹${employee.salary.toLocaleString(
                "en-IN",
              )}`}
            />

            <DetailItem
              label="Joining Date"
              value={new Date(
                employee.joiningDate,
              ).toLocaleDateString()}
            />

            <DetailItem
              label="ID Proof"
              value={employee.idProof}
            />

            <DetailItem
              label="PAN"
              value={employee.pan}
            />

            <DetailItem
              label="Bank Account"
              value={employee.bankAccount}
            />

            <DetailItem
              label="Emergency Contact"
              value={employee.emergencyContact}
            />

            <div className="sm:col-span-2">
              <DetailItem
                label="Address"
                value={employee.address}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t px-6 py-4">
          <button
            className="btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-lg border bg-gray-50 p-3">
      <p className="text-xs font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-gray-900">
        {value || "—"}
      </p>
    </div>
  );
}