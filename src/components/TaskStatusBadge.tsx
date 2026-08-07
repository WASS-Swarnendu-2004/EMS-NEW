type TaskStatus =
  | "Pending"
  | "In Progress"
  | "Completed"
  | "Cancelled";

type Props = {
  status: TaskStatus;
};

export default function TaskStatusBadge({
  status,
}: Props) {
  let className = "badge";
  let icon = "";

  switch (status) {
    case "Pending":
      className += " purple";
      icon = "🟣";
      break;

    case "In Progress":
      className += " warn";
      icon = "🟡";
      break;

    case "Completed":
      className += " success";
      icon = "🟢";
      break;

    case "Cancelled":
      className += " danger";
      icon = "🔴";
      break;

    default:
      className += " purple";
      break;
  }

  return (
    <span className={className}>
      {icon} {status}
    </span>
  );
}