type Task = {
  _id: string;
  title: string;
  description: string;
  assignedToName: string;
  assignedByName: string;
  projectName?: string;
  status: "Pending" | "In Progress" | "Completed";
  progress: number;
  remarks: string;
  dueDate: string;
  createdAt: string;
};

type Props = {
  task: Task | null;
  onClose: () => void;
};

export default function TaskDetailsDialog({
  task,
  onClose,
}: Props) {
  if (!task) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
    >
      <div
        className="modal lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2>Task Details</h2>

          <button
            className="btn btn-sm btn-ghost"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="row-2">
          <div>
            <strong>Task Title</strong>
            <p>{task.title}</p>
          </div>

          <div>
            <strong>Project</strong>
            <p>{task.projectName || "No Project"}</p>
          </div>

          <div>
            <strong>Assigned To</strong>
            <p>{task.assignedToName}</p>
          </div>

          <div>
            <strong>Assigned By</strong>
            <p>{task.assignedByName}</p>
          </div>

          <div>
            <strong>Due Date</strong>
            <p>{task.dueDate}</p>
          </div>

          <div>
            <strong>Status</strong>
            <span
              className={
                "badge " +
                (task.status === "Completed"
                  ? "success"
                  : task.status === "In Progress"
                  ? "warn"
                  : "purple")
              }
            >
              {task.status}
            </span>
          </div>

          <div>
            <strong>Progress</strong>
            <p>{task.progress}%</p>
          </div>
        </div>

        <div className="field">
          <label>Description</label>

          <textarea
            className="textarea"
            readOnly
            value={task.description}
          />
        </div>

        <div className="field">
          <label>Employee Remarks</label>

          <textarea
            className="textarea"
            readOnly
            value={task.remarks || "No remarks yet"}
          />
        </div>

        <div className="modal-foot">
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