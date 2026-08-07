import type { Employee } from "@/api/employee";
import { Loader2 } from "lucide-react";

type EmployeeTableProps = {
  employees: Employee[];
  deletingId: string | null;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  onView: (employee: Employee) => void;
};

export function EmployeeTable({
  employees,
  deletingId,
  onEdit,
  onDelete,
  onView,
}: EmployeeTableProps) {
  return (
    <div className="table-wrap">
      <table className="table min-w-[950px]">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Department</th>
            <th>Salary</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.length === 0 ? (
            <tr>
              <td colSpan={8} className="empty">
                No employees found
              </td>
            </tr>
          ) : (
            employees.map((employee) => (
              <tr
                key={employee._id}
                onClick={() => onView(employee)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <td>
                  <div className="flex items-center gap-3">
                    {employee.profileImage ? (
                      <img
                        src={`https://fresh-01.onrender.com/${employee.profileImage.replace(
                          /^src\//,
                          "",
                        )}`}
                        alt={employee.fullName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-600">
                        {employee.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <div className="font-medium">
                        {employee.fullName}
                      </div>

                      <div className="text-xs text-gray-500">
                        {employee.employeeId ?? "-"}
                      </div>
                    </div>
                  </div>
                </td>

                <td>{employee.email}</td>

                <td>{employee.phone}</td>

                <td>{employee.role}</td>

                <td>{employee.department}</td>

                <td>
                  ₹{employee.salary.toLocaleString("en-IN")}
                </td>

                <td>
                  <span
                    className={
                      employee.status === "Active"
                        ? "badge green"
                        : "badge gray"
                    }
                  >
                    {employee.status}
                  </span>
                </td>

                <td>
                  <div className="flex items-center gap-2">
                    <button
                      className="btn btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(employee);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-error"
                      disabled={deletingId === employee._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(employee._id);
                      }}
                    >
                      {deletingId === employee._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}