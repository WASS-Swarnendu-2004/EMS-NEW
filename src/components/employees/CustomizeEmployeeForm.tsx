type NewField = {
  label: string;
  type: string;
};

type CustomizeEmployeeFormProps = {
  newField: NewField;
  setNewField: (value: NewField) => void;
  onAddField: () => void;
};

export function CustomizeEmployeeForm({
  newField,
  setNewField,
  onAddField,
}: CustomizeEmployeeFormProps) {
  return (
    <div className="mb-6 rounded-lg border bg-gray-50 p-4">
      <h3 className="mb-4 text-lg font-semibold">
        Customize Employee Form
      </h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <input
          className="input"
          placeholder="Field Label"
          value={newField.label}
          onChange={(e) =>
            setNewField({
              ...newField,
              label: e.target.value,
            })
          }
        />

        <select
          className="select"
          value={newField.type}
          onChange={(e) =>
            setNewField({
              ...newField,
              type: e.target.value,
            })
          }
        >
          <option value="text">Text</option>
          <option value="email">Email</option>
          <option value="number">Number</option>
          <option value="date">Date</option>
          <option value="textarea">Textarea</option>
        </select>

        <button
          type="button"
          className="btn"
          onClick={onAddField}
        >
          + Add Field
        </button>
      </div>
    </div>
  );
}