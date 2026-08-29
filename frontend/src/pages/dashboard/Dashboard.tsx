import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ShieldCheck, AlertTriangle, Activity, DollarSign } from "lucide-react";
import Card from "../../components/common/Card";
import PageHeader from "../../components/ui/PageHeader";
import RecoverLoader from "../../components/ui/RecoverLoader";
import ErrorState from "../../components/ui/ErrorState";
import StatusBadge from "../../components/ui/StatusBadge";
import CurrencyDisplay from "../../components/ui/CurrencyDisplay";
import DonutChart, { DonutDatum } from "../../components/charts/DonutChart";
import BarChartCard, { BarDatum } from "../../components/charts/BarChartCard";
import RadialGauge from "../../components/charts/RadialGauge";
import { getRevenueAnalysis } from "../../services/revenueAnalyst.service";
import { getRecoveryMonitoring } from "../../services/recoveryMonitoring.service";
import { RevenueAnalysisResult, RecoveryMonitoringResult } from "../../types/models";
import { getErrorMessage } from "../../utils/errors";
import { formatMoney } from "../../utils/money";
import { useAuth } from "../../context/AuthContext";
import { staggerContainer, staggerItem } from "../../lib/motion";

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <motion.div variants={staggerItem}>
      <Card className="!p-0">
        <div className="flex items-start justify-between p-5">
          <div>
            <p className="text-xs font-medium text-text-muted">{label}</p>
            <p className="mt-1.5 text-2xl font-semibold text-text-primary">{value}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-dark">
            {icon}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const { merchant } = useAuth();
  const [revenue, setRevenue] = useState<RevenueAnalysisResult | null>(null);
  const [monitoring, setMonitoring] = useState<RecoveryMonitoringResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [rev, mon] = await Promise.all([getRevenueAnalysis(), getRecoveryMonitoring()]);
      setRevenue(rev.revenueAnalysis);
      setMonitoring(mon.monitoring);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load dashboard data."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const revenueDonutData: DonutDatum[] = revenue
    ? [
        { name: "Recovered", value: revenue.totalRecoveredAmount, color: "#3395FF" },
        { name: "Still recoverable", value: Math.max(revenue.totalRecoverableAmount - revenue.totalRecoveredAmount, 0), color: "#5FACFF" },
        { name: "Lost", value: revenue.totalLostAmount, color: "#CBD5E1" },
      ].filter((d) => d.value > 0)
    : [];

  const actionsBarData: BarDatum[] = monitoring
    ? [
        { name: "Successful", value: monitoring.successfulActions, color: "#3395FF" },
        { name: "Failed", value: monitoring.failedActions, color: "#F87171" },
        { name: "Scheduled", value: monitoring.scheduledActions, color: "#5FACFF" },
        { name: "Running", value: monitoring.runningActions, color: "#0C2651" },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title={`Welcome back${merchant?.business_name ? `, ${merchant.business_name}` : ""}`}
        description="Live revenue recovery performance."
      />

      {loading && <RecoverLoader variant="card" size="sm" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && revenue && monitoring && (
        <div className="flex flex-col gap-6">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <StatCard
              label="Recoverable Revenue"
              value={<CurrencyDisplay value={revenue.totalRecoverableAmount} />}
              icon={<DollarSign size={17} />}
            />
            <StatCard
              label="Recovered Revenue"
              value={<CurrencyDisplay value={revenue.totalRecoveredAmount} />}
              icon={<ShieldCheck size={17} />}
            />
            <StatCard
              label="Recovery Rate"
              value={`${revenue.recoveryRate.toFixed(1)}%`}
              icon={revenue.recoveryRate >= 50 ? <TrendingUp size={17} /> : <TrendingDown size={17} />}
            />
            <StatCard
              label="Active Recovery Cases"
              value={monitoring.activeCases}
              icon={<Activity size={17} />}
            />
          </motion.div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card title="Revenue Breakdown" className="lg:col-span-1">
              <DonutChart
                data={revenueDonutData}
                valueFormatter={(v) => formatMoney(v)}
                centerLabel={{ value: `${revenue.recoveryRate.toFixed(0)}%`, label: "recovered" }}
              />
            </Card>

            <Card title="Recovery Rate" className="lg:col-span-1">
              <div className="flex h-full flex-col items-center justify-center gap-4">
                <RadialGauge value={revenue.recoveryRate} label="of recoverable revenue" />
                <div className="grid w-full grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-xs text-text-muted">Action success rate</p>
                    <p className="mt-0.5 text-sm font-semibold text-text-primary">{revenue.actionSuccessRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Avg. recovery amount</p>
                    <p className="mt-0.5 text-sm font-semibold text-text-primary">
                      <CurrencyDisplay value={revenue.averageRecoveryAmount} />
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Recovery Actions" className="lg:col-span-1">
              <BarChartCard data={actionsBarData} />
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card title="Revenue Impact" className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-xs text-text-muted">Overall impact</p>
                  <div className="mt-1">
                    <StatusBadge status={revenue.revenueImpact} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Total lost</p>
                  <p className="mt-1 text-sm font-medium text-text-primary">
                    <CurrencyDisplay value={revenue.totalLostAmount} />
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Total cases</p>
                  <p className="mt-1 text-sm font-medium text-text-primary">{revenue.totalCases}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Closed cases</p>
                  <p className="mt-1 text-sm font-medium text-text-primary">{revenue.closedCases}</p>
                </div>
              </div>
              {revenue.insights.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-medium text-text-muted">AI Insights</p>
                  <ul className="space-y-1.5">
                    {revenue.insights.map((insight, i) => (
                      <li key={i} className="flex gap-2 text-sm text-text-secondary">
                        <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-brand" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            <Card title="System Health">
              <div className="flex items-center gap-2">
                <StatusBadge status={monitoring.health} />
                {monitoring.health !== "HEALTHY" && <AlertTriangle size={15} className="text-amber-600" />}
              </div>
              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Total cases</span>
                  <span className="font-medium text-text-primary">{monitoring.totalCases}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Recovered cases</span>
                  <span className="font-medium text-text-primary">{monitoring.recoveredCases}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Scheduled actions</span>
                  <span className="font-medium text-text-primary">{monitoring.scheduledActions}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Successful actions</span>
                  <span className="font-medium text-text-primary">{monitoring.successfulActions}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Failed actions</span>
                  <span className="font-medium text-text-primary">{monitoring.failedActions}</span>
                </div>
              </div>
            </Card>
          </div>

          {monitoring.issues.length > 0 && (
            <Card title="Issues Detected">
              <ul className="space-y-3">
                {monitoring.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-lg border border-bg-border p-3">
                    <StatusBadge status={issue.severity} />
                    <div className="flex-1">
                      <p className="text-sm text-text-secondary">{issue.message}</p>
                      <p className="mt-1 text-xs text-text-muted">{issue.recommendation}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
