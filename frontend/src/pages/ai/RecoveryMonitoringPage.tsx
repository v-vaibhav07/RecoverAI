import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import RecoverLoader from "../../components/ui/RecoverLoader";
import ErrorState from "../../components/ui/ErrorState";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import { formatDateTime } from "../../utils/date";
import { getErrorMessage } from "../../utils/errors";
import { RecoveryMonitoringResult } from "../../types/models";
import { getRecoveryMonitoring } from "../../services/recoveryMonitoring.service";
import BarChartCard, { BarDatum } from "../../components/charts/BarChartCard";
import RadialGauge from "../../components/charts/RadialGauge";

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-bg-border p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-text-primary">{value}</p>
    </div>
  );
}

export default function RecoveryMonitoringPage() {
  const [data, setData] = useState<RecoveryMonitoringResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRecoveryMonitoring();
      setData(res.monitoring);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load recovery monitoring."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Recovery Monitoring"
        description="Live health snapshot of your recovery pipeline."
        action={
          <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={load} loading={loading}>
            Refresh
          </Button>
        }
      />
      {loading && <RecoverLoader variant="card" size="sm" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && data && (
        <div className="flex flex-col gap-6">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-text-secondary">Overall health</p>
              <StatusBadge status={data.health} />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Total cases" value={data.totalCases} />
              <Stat label="Active cases" value={data.activeCases} />
              <Stat label="Recovered cases" value={data.recoveredCases} />
              <Stat label="Closed cases" value={data.closedCases} />
              <Stat label="Scheduled actions" value={data.scheduledActions} />
              <Stat label="Running actions" value={data.runningActions} />
              <Stat label="Successful actions" value={data.successfulActions} />
              <Stat label="Failed actions" value={data.failedActions} />
            </div>
            <p className="mt-4 text-xs text-text-muted">Last monitored: {formatDateTime(data.monitoredAt)}</p>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card title="Case Status" className="lg:col-span-1">
              <BarChartCard
                horizontal
                data={
                  [
                    { name: "Active", value: data.activeCases, color: "#5FACFF" },
                    { name: "Recovered", value: data.recoveredCases, color: "#3395FF" },
                    { name: "Closed", value: data.closedCases, color: "#0C2651" },
                  ] as BarDatum[]
                }
              />
            </Card>
            <Card title="Action Outcomes" className="lg:col-span-1">
              <BarChartCard
                data={
                  [
                    { name: "Scheduled", value: data.scheduledActions, color: "#5FACFF" },
                    { name: "Running", value: data.runningActions, color: "#0C2651" },
                    { name: "Success", value: data.successfulActions, color: "#3395FF" },
                    { name: "Failed", value: data.failedActions, color: "#F87171" },
                  ] as BarDatum[]
                }
              />
            </Card>
            <Card title="Action Success Rate" className="lg:col-span-1">
              <div className="flex h-full items-center justify-center">
                <RadialGauge
                  value={
                    data.successfulActions + data.failedActions > 0
                      ? (data.successfulActions / (data.successfulActions + data.failedActions)) * 100
                      : 0
                  }
                  label="of completed actions"
                />
              </div>
            </Card>
          </div>

          <Card title="Issues">
            {data.issues.length > 0 ? (
              <ul className="space-y-3">
                {data.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-lg border border-bg-border p-3">
                    <StatusBadge status={issue.severity} />
                    <div className="flex-1">
                      <p className="text-sm text-text-secondary">{issue.message}</p>
                      <p className="mt-1 text-xs text-text-muted">{issue.recommendation}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No issues detected" description="Everything is running smoothly." />
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
