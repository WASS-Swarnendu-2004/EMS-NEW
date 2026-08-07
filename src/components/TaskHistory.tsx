type Task = {
  _id: string;
  title: string;
  description: string;
  assignedByName: string;
  assignedToName: string;
  projectName?: string;
  status: "Pending" | "In Progress" | "Completed";
  progress: number;
  remarks: string;
  dueDate: string;
  createdAt: string;
};

type Props = {
  tasks: Task[];
  onView: (task: Task) => void;
  onUpdate: (task: Task) => void;
};

export default function TaskHistory({ tasks, onView, onUpdate }: Props) {
  return (
    <div className="card">
      <div className="card-header">
        <h2>Assigned Task History</h2>
      </div>

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
              <div
                style={{
                  marginBottom: "10px",
                }}
              >
                <strong>{task.title}</strong>
              </div>

              <p className="muted">
                <strong>Assigned To:</strong> {task.assignedToName}
              </p>

              {task.projectName && (
                <p className="muted">
                  <strong>Project:</strong> {task.projectName}
                </p>
              )}

              <p className="muted">
                <strong>Status:</strong> {task.status}
              </p>

              <p className="muted">
                <strong>Progress:</strong> {task.progress}%
              </p>

              <p className="muted">
                <strong>Due Date:</strong> {task.dueDate}
              </p>

              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button className="btn btn-sm btn-ghost" onClick={() => onView(task)}>
                  View
                </button>

                <button className="btn btn-sm" onClick={() => onUpdate(task)}>
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
