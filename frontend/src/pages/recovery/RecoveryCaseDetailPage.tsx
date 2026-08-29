import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Sparkles, Zap, MessageCircle } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import RecoverLoader from "../../components/ui/RecoverLoader";
import ErrorState from "../../components/ui/ErrorState";
import StatusBadge from "../../components/ui/StatusBadge";
import CurrencyDisplay from "../../components/ui/CurrencyDisplay";
import { formatPercent } from "../../utils/money";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { formatDateTime } from "../../utils/date";
import { RecoveryCase } from "../../types/models";
import { getRecoveryCase, deleteRecoveryCase } from "../../services/recovery.service";
import { analyzeFailure } from "../../services/recoveryFailureAnalysis.service";
import { runRecoveryPipelineForCase } from "../../services/recoveryPipeline.service";
import { generateCustomerCommunication } from "../../services/customerCommunication.service";
import { getErrorMessage } from "../../utils/errors";
import { useToast } from "../../components/common/Toast";
import RecoveryCaseEditModal from "./RecoveryCaseEditModal";
import { FailureAnalysisResult, RecoveryPipelineRunResult, CustomerCommunicationResult } from "../../types/models";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}

export default function RecoveryCaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { show } = useToast();
  const [rc, setRc] = useState<RecoveryCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [analysis, setAnalysis] = useState<FailureAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<RecoveryPipelineRunResult | null>(null);
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [communication, setCommunication] = useState<CustomerCommunicationResult | null>(null);
  const [generatingCommunication, setGeneratingCommunication] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getRecoveryCase(id);
      setRc(res.recoveryCase);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load this recovery case."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    if (!id) return;
    setDeleteLoading(true);
    try {
      await deleteRecoveryCase(id);
      show("Recovery case deleted", "success");
      navigate("/recovery");
    } catch (err) {
      show(getErrorMessage(err), "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleAnalyze() {
    if (!id) return;
    setAnalyzing(true);
    try {
      const res = await analyzeFailure(id);
      setAnalysis(res.analysis);
      show("Failure analysis generated", "success");
    } catch (err) {
      show(getErrorMessage(err, "Couldn't run failure analysis."), "error");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleRunPipeline() {
    if (!id) return;
    setRunningPipeline(true);
    try {
      const res = await runRecoveryPipelineForCase(id);
      setPipelineResult(res.pipelineRun);
      show(
        res.pipelineRun.execution.success
          ? "Pipeline ran — payment recovered"
          : "Pipeline ran — retry failed, see details",
        res.pipelineRun.execution.success ? "success" : "info"
      );
      load();
    } catch (err) {
      show(getErrorMessage(err, "Couldn't run the recovery pipeline."), "error");
    } finally {
      setRunningPipeline(false);
    }
  }

  async function handleGenerateCommunication() {
    if (!id) return;
    setGeneratingCommunication(true);
    try {
      const res = await generateCustomerCommunication(id);
      setCommunication(res.communication);
      show("Outreach message generated", "success");
      load();
    } catch (err) {
      show(getErrorMessage(err, "Couldn't generate a customer message."), "error");
    } finally {
      setGeneratingCommunication(false);
    }
  }

  if (loading) return <RecoverLoader variant="page" size="md" />;
  if (error || !rc) return <ErrorState message={error ?? "Recovery case not found."} onRetry={load} />;

  const pipelineDisabled = rc.status === "RECOVERED" || rc.status === "CLOSED";

  return (
    <div>
      <button
        onClick={() => navigate("/recovery")}
        className="mb-3 flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary"
      >
        <ArrowLeft size={14} /> Back to recovery cases
      </button>
      <PageHeader
        title={rc.customers?.name ?? "Recovery case"}
        description={`Case for payment ${rc.payment_id ?? "—"}`}
        action={
          <div className="flex gap-2">
            <Button
              size="sm"
              icon={<Zap size={14} />}
              loading={runningPipeline}
              disabled={pipelineDisabled}
              onClick={handleRunPipeline}
              title={pipelineDisabled ? "This case is already recovered or closed" : undefined}
            >
              Run recovery pipeline
            </Button>
            <Button variant="secondary" size="sm" icon={<Sparkles size={14} />} loading={analyzing} onClick={handleAnalyze}>
              Run failure analysis
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<MessageCircle size={14} />}
              loading={generatingCommunication}
              onClick={handleGenerateCommunication}
            >
              Generate outreach message
            </Button>
            <Button variant="secondary" size="sm" icon={<Pencil size={14} />} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Overview" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            <Field label="Status" value={<StatusBadge status={rc.status} />} />
            <Field label="Priority" value={<StatusBadge status={rc.priority} />} />
            <Field label="Original amount" value={<CurrencyDisplay value={rc.original_amount} />} />
            <Field label="Recoverable amount" value={<CurrencyDisplay value={rc.recoverable_amount} />} />
            <Field label="Recovered amount" value={<CurrencyDisplay value={rc.recovered_amount} />} />
            <Field label="Expected recovery" value={<CurrencyDisplay value={rc.expected_recovery_amount} />} />
            <Field label="Recovery score" value={rc.recovery_score ?? "—"} />
            <Field label="Recovery probability" value={formatPercent(rc.recovery_probability)} />
            <Field label="Opened" value={formatDateTime(rc.created_at)} />
            <Field label="Closed" value={rc.closed_at ? formatDateTime(rc.closed_at) : "—"} />
          </div>
        </Card>

        <Card title="Customer">
          {rc.customers ? (
            <div className="flex flex-col gap-3">
              <Field label="Name" value={rc.customers.name} />
              <Field label="Email" value={rc.customers.email ?? "—"} />
              <Field label="Phone" value={rc.customers.phone ?? "—"} />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/customers/${rc.customers?.id}`)}
                className="mt-1"
              >
                View customer
              </Button>
            </div>
          ) : (
            <p className="text-sm text-text-muted">No linked customer.</p>
          )}
        </Card>
      </div>

      {pipelineResult && (
        <Card title="Latest Pipeline Run" className="mt-6">
          <div className="mb-4 flex items-center gap-2">
            <StatusBadge status={pipelineResult.execution.status} />
            <p className="text-sm text-text-secondary">{pipelineResult.execution.message}</p>
          </div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            <Field label="Predicted recovery score" value={pipelineResult.prediction.recoveryScore ?? "—"} />
            <Field
              label="Predicted probability"
              value={
                pipelineResult.prediction.recoveryProbability !== null
                  ? formatPercent(pipelineResult.prediction.recoveryProbability)
                  : "—"
              }
            />
            <Field label="Chosen strategy" value={pipelineResult.decision.recommendedAction?.replaceAll("_", " ") ?? "—"} />
            <Field
              label="Amount recovered this run"
              value={<CurrencyDisplay value={pipelineResult.execution.recoveredAmount} />}
            />
          </div>
          {pipelineResult.decision.reasoningSummary && (
            <p className="mt-4 text-sm text-text-secondary">{pipelineResult.decision.reasoningSummary}</p>
          )}
          {!pipelineResult.execution.success && pipelineResult.execution.failureMessage && (
            <p className="mt-2 text-sm text-rose-600">{pipelineResult.execution.failureMessage}</p>
          )}
        </Card>
      )}

      {communication && (
        <Card title="Latest Outreach Message" className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <StatusBadge status={communication.channel} />
            <StatusBadge status={communication.confidence} />
          </div>
          {communication.channel === "EMAIL" && communication.subject && (
            <p className="mb-2 text-sm font-medium text-text-primary">{communication.subject}</p>
          )}
          <p className="whitespace-pre-wrap text-sm text-text-secondary">{communication.message}</p>
          <p className="mt-3 text-xs text-text-muted">Why this message: {communication.reason}</p>
        </Card>
      )}

      {analysis && (
        <Card title="Latest Failure Analysis" className="mt-6">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            <Field label="Failure category" value={analysis.failureCategory} />
            <Field label="Severity" value={<StatusBadge status={analysis.severity} />} />
            <Field label="Recoverability" value={`${(analysis.recoverability * 100).toFixed(0)}%`} />
            <Field label="Recommended approach" value={analysis.recommendedApproach} />
          </div>
          <p className="mt-4 text-sm text-text-secondary">{analysis.reason}</p>
        </Card>
      )}

      <Card title="Recovery Actions" className="mt-6">
        {rc.recovery_actions && rc.recovery_actions.length > 0 ? (
          <div className="flex flex-col divide-y divide-bg-border">
            {rc.recovery_actions.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-text-primary">{a.action_type.replaceAll("_", " ")}</p>
                  <p className="text-xs text-text-muted">
                    Attempt #{a.attempt_number} · {formatDateTime(a.scheduled_at)}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No recovery actions yet" />
        )}
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="AI Predictions">
          {rc.ai_predictions && rc.ai_predictions.length > 0 ? (
            <div className="flex flex-col divide-y divide-bg-border">
              {rc.ai_predictions.map((p) => (
                <div key={p.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text-primary">
                      {p.model_name ?? p.model_provider ?? "Model"}
                    </p>
                    <StatusBadge status={p.confidence} />
                  </div>
                  <p className="mt-1 text-xs text-text-muted">
                    Expected recovery: <CurrencyDisplay value={p.expected_recovery_amount} className="text-text-secondary" />
                    {" · "}
                    {formatDateTime(p.created_at)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No predictions yet" />
          )}
        </Card>

        <Card title="AI Decisions">
          {rc.ai_decisions && rc.ai_decisions.length > 0 ? (
            <div className="flex flex-col divide-y divide-bg-border">
              {rc.ai_decisions.map((d) => (
                <div key={d.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text-primary">{d.agent_name}</p>
                    <StatusBadge status={d.confidence} />
                  </div>
                  <p className="mt-1 text-xs text-text-muted">{d.reasoning_summary ?? d.decision_type}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No decisions yet" />
          )}
        </Card>
      </div>

      <RecoveryCaseEditModal open={editOpen} onClose={() => setEditOpen(false)} onSaved={load} recoveryCase={rc} />
      <ConfirmDialog
        open={deleteOpen}
        title="Delete recovery case?"
        description="This will permanently remove this recovery case."
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
