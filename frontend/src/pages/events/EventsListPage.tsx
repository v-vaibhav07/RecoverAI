import { useCallback, useEffect, useState } from "react";
import { useState as useModalState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import DataTable, { Column } from "../../components/tables/DataTable";
import Pagination from "../../components/tables/Pagination";
import Card from "../../components/common/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import JsonViewer from "../../components/ui/JsonViewer";
import { formatDateTime } from "../../utils/date";
import { getErrorMessage } from "../../utils/errors";
import { EventRecord } from "../../types/models";
import { listEvents } from "../../services/event.service";

export default function EventsListPage() {
  const [rows, setRows] = useState<EventRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useModalState<EventRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listEvents({ page, limit });
      setRows(res.events);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load events."));
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: Column<EventRecord>[] = [
    { header: "Event type", accessor: (e) => <Badge color="purple">{e.event_type}</Badge> },
    { header: "Aggregate", accessor: (e) => e.aggregate_type ?? "—" },
    { header: "Status", accessor: (e) => <StatusBadge status={e.status} /> },
    { header: "Processed", accessor: (e) => (e.processed ? <Badge color="green">Yes</Badge> : <Badge color="slate">No</Badge>) },
    { header: "Created", accessor: (e) => formatDateTime(e.created_at) },
  ];

  return (
    <div>
      <PageHeader title="Events" description="Domain events emitted by the backend event pipeline." />
      <Card className="!p-0">
        <DataTable columns={columns} rows={rows} rowKey={(e) => e.id} loading={loading} error={error} onRetry={load} onRowClick={setSelected} emptyTitle="No events yet" />
        <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onPageChange={setPage} />
      </Card>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Event details">
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-muted">Event type</p>
                <p className="mt-1 text-sm text-text-primary">{selected.event_type}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Status</p>
                <div className="mt-1"><StatusBadge status={selected.status} /></div>
              </div>
            </div>
            {selected.error && (
              <div>
                <p className="text-xs text-text-muted">Error</p>
                <p className="mt-1 text-sm text-rose-600">{selected.error}</p>
              </div>
            )}
            <div>
              <p className="mb-1.5 text-xs text-text-muted">Payload</p>
              <JsonViewer data={selected.payload} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
