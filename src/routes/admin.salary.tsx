import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Zap,
  Download,
  Printer,
  X,
  Plus,
  RotateCcw,
  Settings2,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";

import { exportToExcel } from "@/lib/excel";
import { SalarySlipView } from "@/components/SalarySlipView";

import {
  getSalaryList,
  generateSalary,
  generateSalaryForEmployee,
  getSalarySlip,
  getSalaryConfig,
  updateSalaryConfig,
  type SalaryListItem,
  type SalarySlip,
  type SalaryComponent,
} from "@/api/salary";

export const Route = createFileRoute("/admin/salary")({
  component: Page,
});

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function Page() {
  const [month, setMonth] = useState(currentMonth());
  const [view, setView] = useState<SalarySlip | null>(null);
  const [showCfg, setShowCfg] = useState(false);

  const [employees, setEmployees] = useState<SalaryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");

  async function loadSalarySlips() {
    try {
      setLoading(true);

      const data = await getSalaryList(month);

      setEmployees(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load salary list");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSalarySlips();
  }, [month]);

  /**
   * Get unique departments from employees
   */
  const departments = useMemo(() => {
    const uniqueDepartments = Array.from(
      new Set(
        employees
          .map((employee) => employee.department)
          .filter(Boolean),
      ),
    );

    return uniqueDepartments.sort((a, b) =>
      a.localeCompare(b),
    );
  }, [employees]);

  /**
   * Filter employees by:
   * 1. Employee name
   * 2. Department
   */
  const filteredEmployees = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return employees.filter((employee) => {
      const matchesName =
        !searchValue ||
        employee.fullName
          .toLowerCase()
          .includes(searchValue);

      const matchesDepartment =
        department === "All" ||
        employee.department === department;

      return (
        matchesName &&
        matchesDepartment
      );
    });
  }, [employees, search, department]);

  async function genAll() {
    try {
      setGenerating(true);

      await generateSalary(month);

      toast.success(
        "Salary generated successfully",
      );

      await loadSalarySlips();
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to generate salary",
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleViewSlip(
    salarySlipId: string,
  ) {
    try {
      setViewLoading(true);

      const slip =
        await getSalarySlip(salarySlipId);

      setView(slip);
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to load salary slip",
      );
    } finally {
      setViewLoading(false);
    }
  }

  async function handleGenerateEmployee(
    employeeId: string,
  ) {
    try {
      setGenerating(true);

      await generateSalaryForEmployee(
        employeeId,
        month,
      );

      toast.success(
        "Salary generated successfully",
      );

      await loadSalarySlips();
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to generate salary",
      );
    } finally {
      setGenerating(false);
    }
  }

  function exportXlsx() {
    exportToExcel(
      filteredEmployees.map((e) => ({
        Employee: e.fullName,
        Department: e.department,
        Gross: e.grossSalary,
        Net: e.netSalary ?? "",
        Generated: e.generated
          ? "Yes"
          : "No",
      })),
      "salary-slips.xlsx",
      "Salaries",
    );
  }

  function clearFilters() {
    setSearch("");
    setDepartment("All");
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />

        <p className="text-gray-500 text-lg font-medium">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* =========================
          TOOLBAR
      ========================== */}
      <div
        className="
          mb-4
          flex flex-col gap-3
          rounded-lg
          sm:flex-row sm:flex-wrap
          sm:items-center
        "
      >
        {/* Month */}
        <label className="flex w-full items-center gap-2 sm:w-auto">
          <span className="muted whitespace-nowrap">
            Month:
          </span>

          <input
            className="input w-full sm:w-[180px]"
            type="month"
            value={month}
            onChange={(e) =>
              setMonth(e.target.value)
            }
          />
        </label>

        {/* Search */}
        <div className="relative w-full sm:w-[220px]">
          <input
            className="input w-full pl-9"
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {/* Department */}
        <select
          className="input w-full sm:w-[190px]"
          value={department}
          onChange={(e) =>
            setDepartment(e.target.value)
          }
        >
          <option value="All">
            All Departments
          </option>

          {departments.map((dept) => (
            <option
              key={dept}
              value={dept}
            >
              {dept}
            </option>
          ))}
        </select>

        {/* Clear Filters */}
        {(search ||
          department !== "All") && (
          <button
            className="btn btn-ghost w-full sm:w-auto"
            onClick={clearFilters}
          >
            <X size={16} />
            Clear
          </button>
        )}

        {/* Generate All */}
        <button
          className="
            btn btn-gold
            w-full sm:w-auto
          "
          onClick={genAll}
          disabled={generating}
        >
          {generating ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <Zap size={16} />
          )}

          {generating
            ? "Generating..."
            : "Generate salary for all"}
        </button>

        {/* Configure */}
        <button
          className="
            btn btn-ghost
            w-full sm:w-auto
          "
          onClick={() =>
            setShowCfg(true)
          }
        >
          <Settings2 size={16} />

          Configure breakdown
        </button>

        {/* Export */}
        <button
          className="
            btn btn-ghost
            w-full sm:w-auto
            sm:ml-auto
          "
          onClick={exportXlsx}
        >
          <Download size={16} />

          Export Excel
        </button>
      </div>

      {/* =========================
          RESULT COUNT
      ========================== */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="muted text-sm">
          Showing{" "}
          <strong>
            {filteredEmployees.length}
          </strong>{" "}
          of{" "}
          <strong>
            {employees.length}
          </strong>{" "}
          employees
        </p>

        {(search ||
          department !== "All") && (
          <p className="muted text-sm">
            Filtered results
          </p>
        )}
      </div>

      {/* =========================
          SALARY TABLE
      ========================== */}
      <div className="table-wrap w-full overflow-x-auto">
        <table className="table min-w-[760px]">
          <thead>
            <tr>
              <th>Employee</th>

              <th>Department</th>

              <th>Gross</th>

              <th>
                Generated for {month}
              </th>

              <th></th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.length ===
            0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Search
                      size={28}
                      className="text-gray-400"
                    />

                    <p className="font-medium text-gray-600">
                      No employees found
                    </p>

                    <p className="muted text-sm">
                      Try changing the search
                      or department filter.
                    </p>

                    {(search ||
                      department !==
                        "All") && (
                      <button
                        className="btn btn-sm btn-ghost mt-2"
                        onClick={
                          clearFilters
                        }
                      >
                        <X size={14} />
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredEmployees.map(
                (e) => (
                  <tr
                    key={
                      e.employeeIdMongo
                    }
                  >
                    {/* Employee */}
                    <td>
                      <div className="font-medium">
                        {e.fullName}
                      </div>
                    </td>

                    {/* Department */}
                    <td>
                      <span className="badge purple">
                        {e.department}
                      </span>
                    </td>

                    {/* Gross */}
                    <td className="whitespace-nowrap">
                      ₹
                      {e.grossSalary.toLocaleString()}
                    </td>

                    {/* Generated */}
                    <td>
                      {e.generated ? (
                        <span className="badge success whitespace-nowrap">
                          Net ₹
                          {e.netSalary?.toLocaleString()}
                        </span>
                      ) : (
                        <span className="badge warn whitespace-nowrap">
                          Not generated
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="actions">
                      {e.generated ? (
                        <button
                          className="btn btn-sm btn-ghost whitespace-nowrap"
                          onClick={() =>
                            handleViewSlip(
                              e.salarySlipId!,
                            )
                          }
                          disabled={
                            viewLoading
                          }
                        >
                          {viewLoading ? (
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                          ) : null}

                          {viewLoading
                            ? "Loading..."
                            : "View Slip"}
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm whitespace-nowrap"
                          onClick={() =>
                            handleGenerateEmployee(
                              e.employeeIdMongo,
                            )
                          }
                          disabled={
                            generating
                          }
                        >
                          {generating ? (
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                          ) : null}

                          {generating
                            ? "Generating..."
                            : "Generate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </div>

      {/* =========================
          SALARY SLIP MODAL
      ========================== */}
      {view && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setView(null)
          }
        >
          <div
            className="
              modal lg
              w-[calc(100vw-24px)]
              max-w-5xl
              max-h-[90vh]
              overflow-y-auto
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* Modal Header */}
            <div className="modal-head no-print">
              <h2>Salary Slip</h2>

              <div className="flex gap-2">
                <button
                  className="btn btn-ghost"
                  onClick={() =>
                    window.print()
                  }
                >
                  <Printer size={16} />

                  <span className="hidden sm:inline">
                    Print
                  </span>
                </button>

                <button
                  className="btn btn-ghost"
                  onClick={() =>
                    setView(null)
                  }
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <SalarySlipView
              slip={view}
              empName={
                view.employee
                  ?.fullName ?? ""
              }
              department={
                view.employee
                  ?.department ?? ""
              }
            />
          </div>
        </div>
      )}

      {/* =========================
          CONFIGURATION MODAL
      ========================== */}
      {showCfg && (
        <BreakdownConfig
          onClose={() =>
            setShowCfg(false)
          }
        />
      )}
    </>
  );
}

function BreakdownConfig({
  onClose,
}: {
  onClose: () => void;
}) {
  const [items, setItems] = useState<
    SalaryComponent[]
  >([]);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      const data =
        await getSalaryConfig();

      setItems(data);
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to load salary configuration",
      );
    }
  }

  function update(
    index: number,
    patch: Partial<SalaryComponent>,
  ) {
    setItems((xs) =>
      xs.map((x, i) =>
        i === index
          ? { ...x, ...patch }
          : x,
      ),
    );
  }

  function add(
    type: "Earning" | "Deduction",
  ) {
    setItems((xs) => [
      ...xs,
      {
        label:
          type === "Earning"
            ? "New Earning"
            : "New Deduction",
        type,
        mode: "% of gross",
        value: "",
      },
    ]);
  }

  function remove(index: number) {
    setItems((xs) =>
      xs.filter(
        (_, i) => i !== index,
      ),
    );
  }

  async function save() {
    const invalidItem =
      items.find(
        (item) =>
          !item.label.trim() ||
          item.value === "" ||
          Number(item.value) < 0,
      );

    if (invalidItem) {
      toast.warning(
        "Please enter a valid label and value",
      );
      return;
    }

    try {
      await updateSalaryConfig(
        items.map((item) => ({
          ...item,
          value: Number(
            item.value,
          ),
        })),
      );

      toast.success(
        "Salary configuration updated",
      );

      onClose();
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to update salary configuration",
      );
    }
  }

  function reset() {
    setItems([
      {
        label: "Basic",
        type: "Earning",
        mode: "% of gross",
        value: 50,
      },
      {
        label: "HRA",
        type: "Earning",
        mode: "% of gross",
        value: 20,
      },
      {
        label: "Special Allowance",
        type: "Earning",
        mode: "% of gross",
        value: 30,
      },
    ]);
  }

  const earnPct = items
    .filter(
      (i) =>
        i.type === "Earning" &&
        i.mode === "% of gross",
    )
    .reduce(
      (s, i) =>
        s +
        (typeof i.value ===
        "number"
          ? i.value
          : 0),
      0,
    );

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
    >
      <div
        className="
          modal lg
          w-[calc(100vw-24px)]
          max-w-5xl
          max-h-[90vh]
          overflow-y-auto
        "
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        {/* Header */}
        <div className="modal-head">
          <h2 className="flex items-center gap-2">
            <Settings2 size={18} />

            <span>
              Salary Breakdown Configuration
            </span>
          </h2>

          <button
            className="btn btn-ghost"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <p
          className="muted"
          style={{
            fontSize: ".85rem",
            marginTop: 0,
          }}
        >
          Define the earning and
          deduction components.
          Percent values are calculated
          from the employee's gross
          monthly salary.
        </p>

        {/* Configuration Table */}
        <div className="table-wrap w-full overflow-x-auto">
          <table className="table min-w-[750px]">
            <thead>
              <tr>
                <th>Label</th>
                <th>Type</th>
                <th>Mode</th>
                <th>Value</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {items.map(
                (it, index) => (
                  <tr
                    key={
                      it.id ??
                      `salary-${index}`
                    }
                  >
                    <td>
                      <input
                        className="input w-full"
                        value={it.label}
                        onChange={(e) =>
                          update(
                            index,
                            {
                              label:
                                e
                                  .target
                                  .value,
                            },
                          )
                        }
                      />
                    </td>

                    <td>
                      <select
                        className="input w-full"
                        value={it.type}
                        onChange={(e) =>
                          update(
                            index,
                            {
                              type:
                                e
                                  .target
                                  .value as SalaryComponent["type"],
                            },
                          )
                        }
                      >
                        <option value="Earning">
                          Earning
                        </option>

                        <option value="Deduction">
                          Deduction
                        </option>
                      </select>
                    </td>

                    <td>
                      <select
                        className="input w-full"
                        value={it.mode}
                        onChange={(e) =>
                          update(
                            index,
                            {
                              mode:
                                e
                                  .target
                                  .value as SalaryComponent["mode"],
                            },
                          )
                        }
                      >
                        <option value="% of gross">
                          % of gross
                        </option>

                        <option value="Fixed">
                          Fixed ₹
                        </option>
                      </select>
                    </td>

                    <td>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        max={
                          it.mode ===
                          "% of gross"
                            ? 100
                            : undefined
                        }
                        value={it.value}
                        onChange={(e) =>
                          update(
                            index,
                            {
                              value:
                                e
                                  .target
                                  .value ===
                                ""
                                  ? ""
                                  : Number(
                                      e
                                        .target
                                        .value,
                                    ),
                            },
                          )
                        }
                        style={{
                          width: 110,
                        }}
                      />
                    </td>

                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost whitespace-nowrap"
                        onClick={() =>
                          remove(index)
                        }
                        title={`Remove ${it.label}`}
                      >
                        <X size={14} />

                        Remove
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>

        {/* Configuration Actions */}
        <div
          className="
            mt-3
            flex flex-col gap-3
            sm:flex-row
            sm:flex-wrap
            sm:items-center
          "
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              className="btn btn-sm"
              onClick={() =>
                add("Earning")
              }
            >
              <Plus size={14} />
              Add Earning
            </button>

            <button
              className="btn btn-sm"
              onClick={() =>
                add("Deduction")
              }
            >
              <Plus size={14} />
              Add Deduction
            </button>
          </div>

          <span className="muted text-sm">
            Earnings (%):{" "}
            <strong>
              {earnPct}%
            </strong>{" "}
            {earnPct !== 100 &&
              earnPct > 0 && (
                <em>
                  (typically 100%)
                </em>
              )}
          </span>

          <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row">
            <button
              className="btn btn-ghost"
              onClick={reset}
            >
              <RotateCcw size={14} />

              Reset to default
            </button>

            <button
              className="btn btn-gold"
              onClick={save}
            >
              Save configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

