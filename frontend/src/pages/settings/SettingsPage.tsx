import { useCallback, useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import RecoverLoader from "../../components/ui/RecoverLoader";
import JsonEditor from "../../components/forms/JsonEditor";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/common/Toast";
import { getErrorMessage } from "../../utils/errors";
import { MerchantSettings } from "../../types/models";
import {
  getMerchantSettings,
  createMerchantSettings,
  updateMerchantSettings,
  MerchantSettingsInput,
} from "../../services/merchantSettings.service";

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-bg-border px-4 py-3">
      <span className="text-sm text-text-secondary">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`h-5 w-9 rounded-full transition-colors ${checked ? "bg-brand" : "bg-bg-elevated"}`}
      >
        <span
          className={`block h-4 w-4 translate-y-0.5 rounded-full bg-bg-surface transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}

export default function SettingsPage() {
  const { merchant, user } = useAuth();
  const { show } = useToast();
  const [settings, setSettings] = useState<MerchantSettings | null>(null);
  const [exists, setExists] = useState(true);
  const [form, setForm] = useState<MerchantSettingsInput>({
    recoveryEnabled: true,
    aiEnabled: true,
    maxRetryAttempts: 3,
    defaultRetryDelayMinutes: 60,
    notificationEnabled: true,
  });
  const [extraSettings, setExtraSettings] = useState<Record<string, any> | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMerchantSettings();
      setSettings(res.merchantSettings);
      setExists(true);
      setForm({
        recoveryEnabled: res.merchantSettings.recovery_enabled,
        aiEnabled: res.merchantSettings.ai_enabled,
        maxRetryAttempts: res.merchantSettings.max_retry_attempts,
        defaultRetryDelayMinutes: res.merchantSettings.default_retry_delay_minutes,
        notificationEnabled: res.merchantSettings.notification_enabled,
      });
      setExtraSettings(res.merchantSettings.settings);
    } catch (err: any) {
      // 404 = no settings row yet for this merchant
      if (err?.response?.status === 404) {
        setExists(false);
      } else {
        show(getErrorMessage(err, "Couldn't load settings."), "error");
      }
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { ...form, settings: extraSettings };
      if (exists) {
        const res = await updateMerchantSettings(payload);
        setSettings(res.merchantSettings);
      } else {
        const res = await createMerchantSettings(payload);
        setSettings(res.merchantSettings);
        setExists(true);
      }
      show("Settings saved", "success");
    } catch (err) {
      show(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <RecoverLoader variant="page" size="md" />;

  return (
    <div>
      <PageHeader title="Settings" description="Merchant, recovery, and AI configuration." />

      <div className="flex flex-col gap-6">
        <Card title="Business information">
          <p className="mb-4 text-xs text-text-muted">
            Read-only — the backend has no endpoint to update merchant business information yet. This reflects
            what was captured when your account was registered.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Input label="Business name" value={merchant?.business_name ?? "—"} disabled />
            <Input label="Email" value={merchant?.email ?? user?.email ?? "—"} disabled />
            <Input label="Country" value={merchant?.country ?? "—"} disabled />
            <Input label="Currency" value={merchant?.currency ?? "—"} disabled />
            <Input label="Timezone" value={merchant?.timezone ?? "—"} disabled />
          </div>
        </Card>

        <Card title="Recovery & AI settings">
          {!exists && (
            <p className="mb-4 text-xs text-amber-600">
              No settings configured yet for your merchant — saving below will create them.
            </p>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Toggle
              label="Recovery enabled"
              checked={Boolean(form.recoveryEnabled)}
              onChange={(v) => setForm({ ...form, recoveryEnabled: v })}
            />
            <Toggle
              label="AI enabled"
              checked={Boolean(form.aiEnabled)}
              onChange={(v) => setForm({ ...form, aiEnabled: v })}
            />
            <Toggle
              label="Notifications enabled"
              checked={Boolean(form.notificationEnabled)}
              onChange={(v) => setForm({ ...form, notificationEnabled: v })}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Input
              label="Max retry attempts"
              type="number"
              min={0}
              value={String(form.maxRetryAttempts ?? "")}
              onChange={(e) => setForm({ ...form, maxRetryAttempts: Number(e.target.value) })}
            />
            <Input
              label="Default retry delay (minutes)"
              type="number"
              min={0}
              value={String(form.defaultRetryDelayMinutes ?? "")}
              onChange={(e) => setForm({ ...form, defaultRetryDelayMinutes: Number(e.target.value) })}
            />
          </div>
          <div className="mt-4">
            <JsonEditor label="Additional settings (JSON)" value={extraSettings} onChange={setExtraSettings} />
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={handleSave} loading={saving}>
              Save settings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
