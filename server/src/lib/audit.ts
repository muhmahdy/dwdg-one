import type { AuditEntry, HubGateway } from './hub/gateway.ts';

/* Writes one line to the hub's audit_log. A failed write is logged on the server and never reaches the client: an audit
   problem must not turn a refusal into a different error, and details of the hub must not leak. */
export async function audit(hub: HubGateway, entry: AuditEntry): Promise<void> {
  try {
    await hub.audit(entry);
  } catch (err) {
    console.error('audit_failed', entry.action, err instanceof Error ? err.message : 'unknown');
  }
}
