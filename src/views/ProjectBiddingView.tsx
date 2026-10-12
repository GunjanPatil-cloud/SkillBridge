import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Send,
  Clock,
  Sparkles,
  Star,
  CheckCircle2,
  Users,
  ChevronDown,
  ChevronUp,
  Tag,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Project, Proposal, User, SellerProfile } from '../types';
import { api } from '../services/api';

interface ProjectBiddingViewProps {
  currentUser: User | null;
  sellerProfile: SellerProfile | null;
  onOpenPostProject: () => void;
  onOpenSubmitProposal: (project: Project) => void;
  onOrderCreated: (order: any) => void;
  onOpenOnboarding: () => void;
}

export const ProjectBiddingView: React.FC<ProjectBiddingViewProps> = ({
  currentUser,
  sellerProfile,
  onOpenPostProject,
  onOpenSubmitProposal,
  onOrderCreated,
  onOpenOnboarding,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const isSeller = currentUser?.activeRole === 'seller';

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.getProjects();
      setProjects(res.projects);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleToggleProposals = async (projectId: string) => {
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
      setProposals([]);
      return;
    }

    setSelectedProjectId(projectId);
    setLoadingProposals(true);
    try {
      const res = await api.getProjectProposals(projectId);
      setProposals(res.proposals);
    } catch (err) {
      console.error('Failed to load proposals:', err);
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleAcceptProposal = async (projectId: string, proposalId: string) => {
    try {
      const res = await api.acceptProposal(projectId, proposalId);
      setActionMessage('Proposal awarded! Order has been created and escrow initialized.');
      onOrderCreated(res.order);
      fetchProjects();
      handleToggleProposals(projectId);
    } catch (err: any) {
      alert(err.message || 'Failed to accept proposal.');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-emerald-900/50">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Task Bidding & Custom Opportunities</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Campus Project Bidding
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Buyers post custom project requirements; student freelancers bid with tailored pitches
            and deliver turnaround times.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={onOpenPostProject}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post a Task (Buyer)</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">
            Active Project Listings ({projects.length})
          </h2>
          <span className="text-xs text-slate-500">Live student opportunities</span>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 mt-3">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 p-6">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No projects currently posted</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Be the first to post a task requirement for students to bid on!
            </p>
            <button
              onClick={onOpenPostProject}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer"
            >
              Post Project Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map(proj => {
              const isOwner = currentUser?.id === proj.buyerId;
              const isExpanded = selectedProjectId === proj.id;

              return (
                <div
                  key={proj.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          {proj.categoryId}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            proj.status === 'open'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {proj.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{proj.title}</h3>
                      <p className="text-xs text-slate-500">
                        Posted by <strong>{proj.buyerName}</strong> • {new Date(proj.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                      <span className="text-[11px] text-slate-400">Budget</span>
                      <span className="text-lg font-black text-slate-900">₹{proj.budget.toLocaleString()}</span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {proj.deadlineDays} Days
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{proj.description}</p>

                  {/* Skills Required */}
                  {proj.requiredSkills && proj.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-slate-400 mr-1">Skills:</span>
                      {proj.requiredSkills.map(s => (
                        <span
                          key={s}
                          className="px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-800 rounded-md border border-emerald-100"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => handleToggleProposals(proj.id)}
                      className="text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{proj.proposalCount} Student Proposals</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex items-center gap-2">
                      {isSeller && !isOwner && proj.status === 'open' && (
                        <button
                          onClick={() => {
                            if (!sellerProfile || !sellerProfile.isOnboarded) {
                              onOpenOnboarding();
                            } else {
                              onOpenSubmitProposal(proj);
                            }
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Submit Proposal Bid</span>
                        </button>
                      )}

                      {isOwner && (
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                          Your Project
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Drawer for Proposals */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50/70 p-4 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        Submitted Proposals ({proposals.length})
                      </h4>

                      {loadingProposals ? (
                        <p className="text-xs text-slate-500 italic">Loading student proposals...</p>
                      ) : proposals.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">
                          No student proposals submitted yet.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {proposals.map(prop => (
                            <div
                              key={prop.id}
                              className={`p-3 rounded-xl border bg-white space-y-2 transition-all ${
                                prop.isPromotedSeller
                                  ? 'border-amber-300 ring-1 ring-amber-300/40 shadow-xs'
                                  : 'border-slate-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-900">
                                      {prop.sellerName}
                                    </span>
                                    <span className="text-[11px] text-slate-400">•</span>
                                    <span className="text-[11px] text-slate-500">
                                      {prop.sellerCollege}
                                    </span>
                                    {prop.isPromotedSeller && (
                                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-full">
                                        <Sparkles className="w-2.5 h-2.5 text-amber-600" /> PRO Star
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mt-0.5">
                                    <span className="text-emerald-700 font-bold">
                                      Bid: ₹{prop.bidAmount.toLocaleString()}
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span>{prop.deliveryDays} Days Turnaround</span>
                                  </div>
                                </div>

                                {isOwner && prop.status === 'pending' && (
                                  <button
                                    onClick={() => handleAcceptProposal(proj.id, prop.id)}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                                  >
                                    Accept & Hire
                                  </button>
                                )}

                                {prop.status === 'accepted' && (
                                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Hired
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                                "{prop.coverLetter}"
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
