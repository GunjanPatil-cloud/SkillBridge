import React, { useState, useEffect } from 'react';
import {
  Zap,
  Send,
  CheckCircle2,
  Clock,
  Code,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AutomationLogItem } from '../types';
import { api } from '../services/api';

export const AutomationCenterView: React.FC = () => {
  const [logs, setLogs] = useState<AutomationLogItem[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [selectedEventType, setSelectedEventType] = useState('order.created');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAutomationLogs();
      setLogs(res.logs);
      setConfig(res.config);
    } catch (err) {
      console.error('Failed to load automation logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleTestTrigger = async () => {
    setTesting(true);
    setTestSuccess(null);
    try {
      const res = await api.testAutomationTrigger(selectedEventType);
      setTestSuccess(`Dispatched '${selectedEventType}' event to n8n webhook pipeline.`);
      fetchLogs();
    } catch (err: any) {
      alert(err.message || 'Trigger failed.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-amber-900/30">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>n8n Cloud Automation Integration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Webhook Event Outbox
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Asynchronous event dispatching for campus order alerts, delivery updates, and Razorpay
            subscription renewals. Authenticated with HMAC header tokens.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Outbox</span>
        </button>
      </div>

      {testSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{testSuccess}</span>
          </div>
          <button onClick={() => setTestSuccess(null)} className="text-emerald-800 font-bold hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Test Trigger Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Send className="w-4 h-4 text-emerald-600" /> Test Webhook Dispatcher
          </h3>
          <p className="text-xs text-slate-500">
            Simulate a trusted backend event to verify your n8n workflow webhook triggers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedEventType}
            onChange={e => setSelectedEventType(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-semibold focus:outline-hidden"
          >
            <option value="order.created">order.created</option>
            <option value="order.delivered">order.delivered</option>
            <option value="order.completed">order.completed</option>
            <option value="subscription.activated">subscription.activated</option>
            <option value="subscription.cancelled">subscription.cancelled</option>
            <option value="payment.failed">payment.failed</option>
          </select>

          <button
            onClick={handleTestTrigger}
            disabled={testing}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {testing ? 'Dispatching...' : 'Send Event'}
          </button>
        </div>
      </div>

      {/* Outbox Event Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Dispatched Automation Events ({logs.length})
          </h2>
          <span className="text-xs text-slate-500">
            Auth Header: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">X-SkillBridge-Secret</code>
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 mt-3">Loading event logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 p-6">
            <Zap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No webhook events in outbox</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Place an order, activate a PRO subscription, or use the test dispatcher above to see live events.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map(log => {
              const isExpanded = expandedLogId === log.id;

              return (
                <div
                  key={log.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                >
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                        <Zap className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {log.eventType}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
                            HTTP {log.statusCode}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                            {log.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(log.dispatchedAt).toLocaleString()} • Event ID: {log.id}
                        </p>
                      </div>
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-950 rounded-b-2xl">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold py-1">
                        <span>Payload JSON</span>
                        <span>Source: SkillBridge Server</span>
                      </div>
                      <pre className="font-mono text-xs text-emerald-400 overflow-x-auto p-3 bg-slate-900/80 rounded-xl max-h-60 scrollbar-none">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security Architecture Notice (Section 8) */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          n8n Workflow Authority Policy
        </h4>
        <p className="leading-relaxed">
          In accordance with Section 8 requirements, n8n Cloud is used purely for asynchronous
          automation (notifications, student WhatsApp/email alerts, and calendar reminders).
          Core business logic, identity verification, payment confirmation, and premium subscription
          entitlements are strictly calculated and enforced on the FastAPI/Express backend.
        </p>
      </div>
    </div>
  );
};
