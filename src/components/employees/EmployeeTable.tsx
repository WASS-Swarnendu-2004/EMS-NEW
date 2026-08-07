import { Loader2 } from "lucide-react";
import type { Employee } from "@/api/employee";

type EmployeeTableProps = {
  employees: Employee[];
  deletingId: string | null;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
};

export function EmployeeTable({
  employees,
  deletingId,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  return (
    <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="table w-full min-w-[950px]">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Department</th>
            <th>Salary</th>
            <th>Status</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((e) => (
            <tr key={e._id}>
              <td>
                <div className="font-semibold">{e.fullName}</div>

                <div className="mt-1 text-xs text-gray-500">
                  Joined {e.joiningDate.slice(0, 10)}
                </div>
              </td>

              <td>{e.email}</td>

              <td>{e.phone}</td>

              <td>
                <span className="badge purple">{e.role}</span>
              </td>

              <td>{e.department}</td>

              <td>₹{e.salary.toLocaleString()}</td>

              <td>
                <span
                  className={
                    "badge " +
                    (e.status === "Active" ? "success" : "danger")
                  }
                >
                  {e.status}
                </span>
              </td>

              <td>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <button
                    className="btn btn-sm btn-ghost w-full sm:w-auto"
                    onClick={() => onEdit(e)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-sm btn-danger w-full sm:w-auto"
                    onClick={() => onDelete(e._id)}
                    disabled={deletingId === e._id}
                  >
                    {deletingId === e._id ? (
                      <>
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {employees.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="py-8 text-center text-gray-500"
              >
                No employees found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}