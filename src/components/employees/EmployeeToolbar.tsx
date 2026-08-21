type EmployeeToolbarProps = {
  q: string;
  setQ: (value: string) => void;

  selectedDepartment: string;
  departments: string[];
  onDepartmentChange: (department: string) => void;

  onExport: () => void;
  onAdd: () => void;
};

export function EmployeeToolbar({
  q,
  setQ,
  selectedDepartment,
  departments,
  onDepartmentChange,
  onExport,
  onAdd,
}: EmployeeToolbarProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      
      {/* Search + Department Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="input w-full lg:max-w-sm"
          placeholder="Search employees..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select
          className="select w-full sm:w-56"
          value={selectedDepartment}
          onChange={(e) =>
            onDepartmentChange(e.target.value)
          }
        >
          <option value="">All Departments</option>

          {departments.map((department) => (
            <option
              key={department}
              value={department}
            >
              {department}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          className="btn btn-ghost w-full sm:w-auto"
          onClick={onExport}
        >
          ⬇ Export Excel
        </button>

        <button
          className="btn w-full sm:w-auto"
          onClick={onAdd}
        >
          + Add Employee
        </button>
      </div>
    </div>
  );
}