import { Link } from "react-router-dom";
import { Activity, TrendingUp, ShieldAlert, Zap } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/common/Card";

const tiles = [
  {
    to: "/ai/monitoring",
    title: "Recovery Monitoring",
    description: "Live health of the recovery pipeline: active cases, actions, and issues.",
    icon: <Activity size={18} />,
  },
  {
    to: "/ai/revenue",
    title: "Revenue Analyst",
    description: "AI-generated revenue impact analysis and recommendations.",
    icon: <TrendingUp size={18} />,
  },
  {
    to: "/ai/explainability",
    title: "AI Explainability",
    description: "Explanations for AI decisions on a given recovery case.",
    icon: <ShieldAlert size={18} />,
  },
  {
    to: "/ai/pipeline",
    title: "Recovery Pipeline — Batch Run",
    description: "Run predict → decide → schedule → execute across every eligible case, and see measured money recovered.",
    icon: <Zap size={18} />,
  },
];

export default function AIHubPage() {
  return (
    <div>
      <PageHeader
        title="AI"
        description="The AI agents behind RecoverAI's recovery pipeline. Failure analysis runs from a specific recovery case's detail page."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to}>
            <Card className="h-full transition-colors hover:border-brand/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-dark">
                {t.icon}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-text-primary">{t.title}</h3>
              <p className="mt-1 text-xs text-text-muted">{t.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
