import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Lock, 
  Smartphone, 
  KeyRound, 
  RefreshCw, 
  Download, 
  Filter, 
  Search, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  FileText,
  Activity,
  Radio,
  Server
} from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

interface SecurityLog {
  id: string;
  timestamp: string;
  eventType: string;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  severity: 'info' | 'warning' | 'critical';
}

interface SecurityStats {
  totalEvents: number;
  criticalEventsCount: number;
  warningEventsCount: number;
  mfaEnabledUsers: number;
  verifiedUsers: number;
  activeProtections: Record<string, string>;
}

export const SecurityCenterTab: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const data = await api.getSecurityLogs();
      setLogs(data.logs || []);
      setStats(data.stats || null);
    } catch (err: any) {
      showToast(err?.message || 'Failed to fetch security logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchEmail = log.email?.toLowerCase().includes(term);
      const matchType = log.eventType?.toLowerCase().includes(term);
      const matchIp = log.ipAddress?.toLowerCase().includes(term);
      const matchDetails = JSON.stringify(log.details || {}).toLowerCase().includes(term);
      return matchEmail || matchType || matchIp || matchDetails;
    }
    return true;
  });

  const exportLogsAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ashish_studio_security_audit_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported security audit log', 'success');
  };

  const getSeverityBadge = (sev: 'info' | 'warning' | 'critical') => {
    switch (sev) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            Critical
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Warning
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Normal
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <span>Studio Security & Access Sentinel</span>
          </h2>
          <p className="text-xs text-neutral-400">
            Real-time brute force defense, 2FA enforcement, rate limiting telemetry, and immutable audit trails
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSecurityData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs font-bold hover:bg-neutral-800 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
          <button
            onClick={exportLogsAsJson}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Trail</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Audit Events Logged</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{stats?.totalEvents ?? logs.length}</p>
          <span className="text-[10px] text-neutral-500">Immutable security logs stored</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Critical Lockout Events</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-extrabold text-red-400">{stats?.criticalEventsCount ?? 0}</p>
          <span className="text-[10px] text-neutral-500">Brute-force thresholds triggered</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>2FA Protected Users</span>
            <Smartphone className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400">{stats?.mfaEnabledUsers ?? 0}</p>
          <span className="text-[10px] text-neutral-500">Accounts with TOTP 2FA enabled</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Email Verified Users</span>
            <UserCheck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-extrabold text-blue-400">{stats?.verifiedUsers ?? 0}</p>
          <span className="text-[10px] text-neutral-500">Verified client & admin identities</span>
        </div>
      </div>

      {/* Active Defensive Protections Grid */}
      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
          <Server className="w-4 h-4 text-amber-400" />
          <span>Active Defensive Controls & Policies</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white">Bcrypt 12-Round Password Hashing</h4>
              <p className="text-[11px] text-neutral-400">Cryptographic salt with resistant work factor</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white">Adaptive Brute Force Protection</h4>
              <p className="text-[11px] text-neutral-400">5 failed logins = 15 minute exponential account lock</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white">RFC 6238 TOTP Two-Factor Auth</h4>
              <p className="text-[11px] text-neutral-400">Google Authenticator + 8 single-use recovery codes</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white">Global Session Revocation (JTI)</h4>
              <p className="text-[11px] text-neutral-400">Instant token invalidation across all logged-in devices</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white">Strict XSS & SQL Input Sanitization</h4>
              <p className="text-[11px] text-neutral-400">Html entity encoding & prototype pollution prevention</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white">Zero Information Leakage</h4>
              <p className="text-[11px] text-neutral-400">Stack traces and database internals stripped from API errors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Table & Filters */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Audit Trail Event Stream ({filteredLogs.length})</span>
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logs by IP, email, action..."
                className="bg-neutral-950 border border-neutral-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 w-48 sm:w-60"
              />
            </div>

            {/* Severity Filter Buttons */}
            <div className="flex rounded-xl bg-neutral-950 border border-neutral-800 p-0.5 text-xs font-semibold">
              {(['all', 'critical', 'warning', 'info'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                    severityFilter === sev
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Event Action</th>
                <th className="py-3 px-3">Identity / Target</th>
                <th className="py-3 px-3">IP Address</th>
                <th className="py-3 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500">
                    Loading security audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500">
                    No security events matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-800/30 transition-colors font-mono">
                    <td className="py-3 px-3 text-neutral-400 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-sans">
                      {getSeverityBadge(log.severity)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                      {log.eventType}
                    </td>
                    <td className="py-3 px-3 text-amber-300/90 whitespace-nowrap font-sans">
                      {log.email || log.userId || '—'}
                    </td>
                    <td className="py-3 px-3 text-neutral-400 text-[11px] whitespace-nowrap">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-3 text-neutral-300 font-sans text-[11px] max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
