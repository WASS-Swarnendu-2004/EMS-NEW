import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Printer, X, Loader2 } from "lucide-react";
import {
  getMySalarySlips,
  type SalarySlip,
} from "@/api/salary";
import { useAuth } from "@/lib/auth";
import { SalarySlipView } from "@/components/SalarySlipView";
import { toast } from "react-toastify";

export const Route = createFileRoute(
  "/user/salary",
)({
  component: Page,
});

function Page() {
  const { session } = useAuth();

  const empId = session!.id;

  const me = {
    name: session?.name ?? "",
  };

  const [slips, setSlips] = useState<
    SalarySlip[]
  >([]);

  const [view, setView] =
    useState<SalarySlip | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadSalary = async () => {
      try {
        setLoading(true);

        const data =
          await getMySalarySlips();

        setSlips(
          data.sort((a, b) =>
            b.month.localeCompare(a.month),
          ),
        );
      } catch (err: any) {
        console.error(err);

        toast.error(
          err.response?.data?.message ||
            "Failed to load salary slips",
        );
      } finally {
        setLoading(false);
      }
    };

    loadSalary();
  }, []);

  if (loading) {
    return (
      <div
        className="
          flex
          h-[70vh]
          flex-col
          items-center
          justify-center
          gap-3
        "
      >
        <Loader2
          className="
            h-10
            w-10
            animate-spin
            text-yellow-500
          "
        />

        <p
          className="
            text-lg
            font-medium
            text-gray-500
          "
        >
          Loading salary slips...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2>
            Auto-generated salary slips
          </h2>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Gross</th>
                <th>Earnings</th>
                <th>Deductions</th>
                <th>Net</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {slips.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.month}
                  </td>

                  <td>
                    ₹
                    {s.gross.toLocaleString()}
                  </td>

                  <td>
                    ₹
                    {s.totalEarnings.toLocaleString()}
                  </td>

                  <td>
                    - ₹
                    {s.totalDeductions.toLocaleString()}
                  </td>

                  <td>
                    <strong>
                      ₹
                      {s.net.toLocaleString()}
                    </strong>
                  </td>

                  <td>
                    <button
                      className="
                        btn
                        btn-sm
                        btn-ghost
                      "
                      onClick={() =>
                        setView(s)
                      }
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {slips.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="empty"
                  >
                    No salary slips yet.
                    Ask admin to generate.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================
          SALARY SLIP MODAL
          ====================================================== */}

      {view && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setView(null)
          }
        >
          <div
            className="modal lg"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div
              className="
                modal-head
                no-print
              "
            >
              <h2>
                Salary Slip
              </h2>

              <div className="flex">
                {/* Print */}

                <button
                  className="
                    btn
                    btn-ghost
                  "
                  onClick={() => {
                    toast.info(
                      "Preparing salary slip for printing...",
                    );

                    window.print();
                  }}
                >
                  <Printer size={16} />

                  Print
                </button>

                {/* Close */}

                <button
                  className="
                    btn
                    btn-ghost
                  "
                  onClick={() =>
                    setView(null)
                  }
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Salary Slip */}

            <SalarySlipView
              slip={view}
              empName={me.name}
            />
          </div>
        </div>
      )}
    </>
  );
}