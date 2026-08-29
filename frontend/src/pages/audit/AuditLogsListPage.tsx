import { useCallback, useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import DataTable, { Column } from "../../components/tables/DataTable";
import Card from "../../components/common/Card";
import Modal from "../../components/common/Modal";
import JsonViewer from "../../components/ui/JsonViewer";
import { formatDateTime } from "../../utils/date";
import { getErrorMessage } from "../../utils/errors";
import { AuditLog } from "../../types/models";
import { listAuditLogs } from "../../services/auditLog.service";

export default function AuditLogsListPage() {
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AuditLog | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAuditLogs();
      setRows(res.auditLogs);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load audit logs."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns: Column<AuditLog>[] = [
    { header: "Action", accessor: (a) => <span className="font-medium text-text-primary">{a.action}</span> },
    { header: "Entity", accessor: (a) => `${a.entity_type ?? "—"}${a.entity_id ? ` (${a.entity_id.slice(0, 8)}…)` : ""}` },
    { header: "IP address", accessor: (a) => a.ip_address ?? "—" },
    { header: "Created", accessor: (a) => formatDateTime(a.created_at) },
  ];

  return (
    <div>
      <PageHeader title="Audit Logs" description="Full history of mutating actions across your account." />
      <Card className="!p-0">
        <DataTable columns={columns} rows={rows} rowKey={(a) => a.id} loading={loading} error={error} onRetry={load} onRowClick={setSelected} emptyTitle="No audit logs yet" />
      </Card>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Audit log details" size="lg">
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-text-muted">Action</p>
                <p className="mt-1 text-sm text-text-primary">{selected.action}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Entity type</p>
                <p className="mt-1 text-sm text-text-primary">{selected.entity_type ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">User agent</p>
                <p className="mt-1 truncate text-sm text-text-primary" title={selected.user_agent ?? ""}>
                  {selected.user_agent ?? "—"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1.5 text-xs text-text-muted">Old values</p>
                <JsonViewer data={selected.old_values} />
              </div>
              <div>
                <p className="mb-1.5 text-xs text-text-muted">New values</p>
                <JsonViewer data={selected.new_values} />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
