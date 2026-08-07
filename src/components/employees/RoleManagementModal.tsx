import type { Role } from "@/api/role";

type NewRole = {
  roleName: string;
  description: string;
  status: string;
};

type RoleManagementModalProps = {
  open: boolean;
  roles: Role[];
  newRole: NewRole;
  onClose: () => void;
  onAddRole: () => void;
  onDeleteRole: (id: string) => void;
  onNewRoleChange: (value: NewRole) => void;
};

export function RoleManagementModal({
  open,
  roles,
  newRole,
  onClose,
  onAddRole,
  onDeleteRole,
  onNewRoleChange,
}: RoleManagementModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-lg font-semibold">
            Manage Roles
          </h2>

          <button
            className="btn btn-sm btn-ghost"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 p-5">
          <input
            className="input w-full"
            placeholder="Role Name"
            value={newRole.roleName}
            onChange={(e) =>
              onNewRoleChange({
                ...newRole,
                roleName: e.target.value,
              })
            }
          />

          <button
            className="btn w-full"
            onClick={onAddRole}
          >
            + Add Role
          </button>
        </div>

        <div className="max-h-72 space-y-2 overflow-y-auto px-5">
          {roles.map((role) => (
            <div
              key={role._id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <div className="font-medium">
                  {role.roleName}
                </div>

                <div className="text-sm text-gray-500">
                  {role.description}
                </div>
              </div>

              <button
                className="btn btn-danger btn-sm"
                onClick={() => onDeleteRole(role._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <div className="border-t p-5 text-right">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}