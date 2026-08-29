import { useState } from "react";
import { AlertTriangle, Sparkles } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/ui/StatusBadge";
import { getErrorMessage } from "../../utils/errors";
import { ExplainabilityResult } from "../../types/models";
import { generateExplainability } from "../../services/explainability.service";

export default function ExplainabilityPage() {
  const [recoveryCaseId, setRecoveryCaseId] = useState("");
  const [result, setResult] = useState<ExplainabilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!recoveryCaseId.trim()) {
      setError("Enter a recovery case ID.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await generateExplainability(recoveryCaseId.trim());
      setResult(res.explainability);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError(
          "This endpoint isn't available yet — the /api/explainability route exists in the backend source but hasn't been mounted in routes/index.ts. Ask your backend team to wire it up."
        );
      } else {
        setError(getErrorMessage(err, "Couldn't generate an explanation."));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="AI Explainability" description="Human-readable explanations for AI decisions on a recovery case." />

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[240px]">
            <Input
              label="Recovery case ID"
              value={recoveryCaseId}
              onChange={(e) => setRecoveryCaseId(e.target.value)}
              placeholder="e.g. a1b2c3d4-…"
            />
          </div>
          <Button icon={<Sparkles size={15} />} onClick={handleGenerate} loading={loading}>
            Generate explanation
          </Button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <AlertTriangle size={15} className="mt-0.5 flex-none text-amber-600" />
            <p className="text-sm text-amber-800">{error}</p>
          </div>
        )}
      </Card>

      {result && (
        <Card title="Explanation" className="mt-6">
          <div className="mb-4 flex items-center gap-2">
            <p className="text-sm text-text-secondary">Confidence</p>
            <StatusBadge status={result.confidence} />
          </div>
          <p className="text-sm text-text-secondary">{result.summary}</p>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs font-medium text-text-muted">Decision explanation</p>
              <p className="text-sm text-text-secondary">{result.decisionExplanation}</p>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-text-muted">Prediction explanation</p>
              <p className="text-sm text-text-secondary">{result.predictionExplanation}</p>
            </div>
          </div>

          {result.factors.length > 0 && (
            <div className="mt-5">
              <p className="mb-1.5 text-xs font-medium text-text-muted">Factors</p>
              <ul className="space-y-1.5">
                {result.factors.map((f, i) => (
                  <li key={i} className="flex gap-2 text-sm text-text-secondary">
                    <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-brand-light" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.risks.length > 0 && (
            <div className="mt-5">
              <p className="mb-1.5 text-xs font-medium text-text-muted">Risks</p>
              <ul className="space-y-1.5">
                {result.risks.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm text-text-secondary">
                    <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-rose-400" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-5">
            <p className="mb-1.5 text-xs font-medium text-text-muted">Recommendation</p>
            <p className="text-sm text-text-secondary">{result.recommendation}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
