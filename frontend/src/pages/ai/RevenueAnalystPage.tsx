import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import RecoverLoader from "../../components/ui/RecoverLoader";
import ErrorState from "../../components/ui/ErrorState";
import StatusBadge from "../../components/ui/StatusBadge";
import CurrencyDisplay from "../../components/ui/CurrencyDisplay";
import { formatDateTime } from "../../utils/date";
import { formatMoney } from "../../utils/money";
import { getErrorMessage } from "../../utils/errors";
import { RevenueAnalysisResult } from "../../types/models";
import { getRevenueAnalysis } from "../../services/revenueAnalyst.service";
import DonutChart, { DonutDatum } from "../../components/charts/DonutChart";
import RadialGauge from "../../components/charts/RadialGauge";
import BarChartCard, { BarDatum } from "../../components/charts/BarChartCard";

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-bg-border p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-text-primary">{value}</p>
    </div>
  );
}

export default function RevenueAnalystPage() {
  const [data, setData] = useState<RevenueAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRevenueAnalysis();
      setData(res.revenueAnalysis);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load revenue analysis."));
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
        title="Revenue Analyst"
        description="AI-generated analysis of your recovery revenue impact."
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
              <p className="text-sm text-text-secondary">Revenue impact</p>
              <StatusBadge status={data.revenueImpact} />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Recoverable" value={<CurrencyDisplay value={data.totalRecoverableAmount} />} />
              <Stat label="Recovered" value={<CurrencyDisplay value={data.totalRecoveredAmount} />} />
              <Stat label="Lost" value={<CurrencyDisplay value={data.totalLostAmount} />} />
              <Stat label="Avg. recovery" value={<CurrencyDisplay value={data.averageRecoveryAmount} />} />
              <Stat label="Recovery rate" value={`${data.recoveryRate.toFixed(1)}%`} />
              <Stat label="Action success rate" value={`${data.actionSuccessRate.toFixed(1)}%`} />
              <Stat label="Total actions" value={data.totalActions} />
              <Stat label="Successful actions" value={data.successfulActions} />
            </div>
            <p className="mt-4 text-xs text-text-muted">Analyzed: {formatDateTime(data.analyzedAt)}</p>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card title="Revenue Breakdown">
              <DonutChart
                data={
                  [
                    { name: "Recovered", value: data.totalRecoveredAmount, color: "#3395FF" },
                    { name: "Still recoverable", value: Math.max(data.totalRecoverableAmount - data.totalRecoveredAmount, 0), color: "#5FACFF" },
                    { name: "Lost", value: data.totalLostAmount, color: "#CBD5E1" },
                  ].filter((d) => d.value > 0) as DonutDatum[]
                }
                valueFormatter={(v) => formatMoney(v)}
              />
            </Card>
            <Card title="Action Success Rate">
              <div className="flex h-full items-center justify-center">
                <RadialGauge value={data.actionSuccessRate} label="actions succeeded" />
              </div>
            </Card>
            <Card title="Case Outcomes">
              <BarChartCard
                data={
                  [
                    { name: "Active", value: data.activeCases, color: "#5FACFF" },
                    { name: "Recovered", value: data.recoveredCases, color: "#3395FF" },
                    { name: "Closed", value: data.closedCases, color: "#0C2651" },
                  ] as BarDatum[]
                }
              />
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title="Insights">
              {data.insights.length > 0 ? (
                <ul className="space-y-2">
                  {data.insights.map((i, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-text-secondary">
                      <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-brand-light" />
                      {i}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-muted">No insights available.</p>
              )}
            </Card>
            <Card title="Recommendations">
              {data.recommendations.length > 0 ? (
                <ul className="space-y-2">
                  {data.recommendations.map((r, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-text-secondary">
                      <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-emerald-400" />
                      {r}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-muted">No recommendations available.</p>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
