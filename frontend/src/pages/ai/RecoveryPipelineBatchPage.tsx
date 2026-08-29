import { useState } from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import StatusBadge from "../../components/ui/StatusBadge";
import CurrencyDisplay from "../../components/ui/CurrencyDisplay";
import EmptyState from "../../components/ui/EmptyState";
import { getErrorMessage } from "../../utils/errors";
import { useToast } from "../../components/common/Toast";
import { RecoveryPipelineBatchResult } from "../../types/models";
import { runRecoveryPipelineBatch } from "../../services/recoveryPipeline.service";

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-bg-border p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-text-primary">{value}</p>
    </div>
  );
}

export default function RecoveryPipelineBatchPage() {
  const { show } = useToast();
  const [limit, setLimit] = useState("10");
  const [status, setStatus] = useState("OPEN");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RecoveryPipelineBatchResult | null>(null);

  async function handleRun() {
    setRunning(true);
    setResult(null);
    try {
      const res = await runRecoveryPipelineBatch({
        limit: Number(limit) || 10,
        status: status || "OPEN",
      });
      setResult(res.batchRun);
      show(
        `Batch complete — ${res.batchRun.succeeded}/${res.batchRun.totalCases} cases recovered`,
        res.batchRun.succeeded > 0 ? "success" : "info"
      );
    } catch (err) {
      show(getErrorMessage(err, "Couldn't run the batch pipeline."), "error");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Recovery Pipeline — Batch Run"
        description="Run predict → decide → schedule → execute across every eligible recovery case at once, and see measured money recovered."
      />

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-40">
            <Input label="Case status" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="OPEN" />
          </div>
          <div className="w-32">
            <Input label="Limit (max 50)" type="number" min={1} max={50} value={limit} onChange={(e) => setLimit(e.target.value)} />
          </div>
          <Button icon={<Zap size={15} />} onClick={handleRun} loading={running}>
            Run batch
          </Button>
        </div>
      </Card>

      {result && (
        <div className="mt-6 flex flex-col gap-6">
          <Card>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Cases run" value={result.totalCases} />
              <Stat label="Recovered" value={result.succeeded} />
              <Stat label="Failed" value={result.failed} />
              <Stat label="Total recovered" value={<CurrencyDisplay value={result.totalRecoveredAmount} />} />
            </div>
          </Card>

          <Card title="Results by case">
            {result.results.length > 0 ? (
              <div className="flex flex-col divide-y divide-bg-border">
                {result.results.map((r) => (
                  <div key={r.recoveryCaseId} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div>
                      <Link to={`/recovery/cases/${r.recoveryCaseId}`} className="text-sm font-medium text-brand hover:text-brand-dark hover:underline">
                        {r.recoveryCaseId.slice(0, 8)}…
                      </Link>
                      {r.success ? (
                        <p className="mt-0.5 text-xs text-text-muted">{r.result.execution.message}</p>
                      ) : (
                        <p className="mt-0.5 text-xs text-rose-600">{r.error}</p>
                      )}
                    </div>
                    {r.success ? (
                      <div className="flex items-center gap-3">
                        <CurrencyDisplay value={r.result.execution.recoveredAmount} className="text-sm text-text-secondary" />
                        <StatusBadge status={r.result.execution.status} />
                      </div>
                    ) : (
                      <StatusBadge status="FAILED" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No eligible cases found" description={`No recovery cases with status "${status}" were found.`} />
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
