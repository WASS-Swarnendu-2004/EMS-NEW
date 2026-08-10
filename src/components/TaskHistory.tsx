import type { CreatedTask } from "@/api/task";

type Employee = {
  _id: string;
  fullName: string;
};

type Props = {
  tasks: CreatedTask[];
  employees: Employee[];
  onView: (task: CreatedTask) => void;
  onUpdate: (task: CreatedTask) => void;
};

export default function TaskHistory({
  tasks,
  employees,
  onView,
  onUpdate,
}: Props) {
  function getEmployeeName(employeeId: string) {
    const employee = employees.find(
      (employee) => employee._id === employeeId
    );

    return employee?.fullName || employeeId;
  }

  return (
    <div>
      <h2>Assigned Task History</h2>

      {tasks.length === 0 ? (
        <div
          className="empty"
          style={{
            padding: "2rem",
            textAlign: "center",
          }}
        >
          No assigned tasks
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {tasks.map((task) => (
            <div
              key={task._id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "16px",
              }}
            >
              {/* TASK TITLE */}
              <div
                style={{
                  marginBottom: "10px",
                }}
              >
                <strong>{task.title}</strong>
              </div>

              {/* DESCRIPTION */}
              <p className="muted">
                <strong>Description:</strong>{" "}
                {task.description}
              </p>

              {/* PROJECT */}
              {task.project?.projectName && (
                <p className="muted">
                  <strong>Project:</strong>{" "}
                  {task.project.projectName}
                </p>
              )}

              {/* ASSIGNEES */}
              <div className="muted">
                <strong>Assigned To:</strong>

                {task.assignees?.length > 0 ? (
                  <div
                    style={{
                      marginTop: "6px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {task.assignees.map((assignee) => (
                      <div
                        key={assignee._id}
                        style={{
                          padding: "8px",
                          background: "#f9fafb",
                          borderRadius: "6px",
                        }}
                      >
                        <div>
                          {assignee.employee.fullName}
                        </div>

                        <div
                          style={{
                            fontSize: "13px",
                            marginTop: "3px",
                          }}
                        >
                          Status: {assignee.status}
                          {" | "}
                          Progress: {assignee.progress}%
                        </div>
                      </div>
                    ))}
                  </div>
                ) : task.assignedTo ? (
                  <span>
                    {" "}
                    {getEmployeeName(task.assignedTo)}
                  </span>
                ) : (
                  <span> No employee assigned</span>
                )}
              </div>

              {/* OLD SINGLE TASK STATUS */}
              {task.assignees?.length === 0 &&
                task.status && (
                  <>
                    <p className="muted">
                      <strong>Status:</strong>{" "}
                      {task.status}
                    </p>

                    <p className="muted">
                      <strong>Progress:</strong>{" "}
                      {task.progress ?? 0}%
                    </p>
                  </>
                )}

              {/* DUE DATE */}
              <p className="muted">
                <strong>Due Date:</strong>{" "}
                {new Date(
                  task.dueDate
                ).toLocaleDateString()}
              </p>

              {/* BUTTONS */}
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => onView(task)}
                >
                  View
                </button>

                <button
                  className="btn btn-sm"
                  onClick={() => onUpdate(task)}
                >
                  Update
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}