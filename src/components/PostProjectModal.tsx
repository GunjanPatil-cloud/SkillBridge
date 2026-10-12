import React, { useState } from 'react';
import { X, Briefcase, Plus, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { Project } from '../types';

interface PostProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: Project) => void;
}

export const PostProjectModal: React.FC<PostProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('web-dev');
  const [budget, setBudget] = useState('2500');
  const [deadlineDays, setDeadlineDays] = useState('5');
  const [skills, setSkills] = useState<string[]>(['React', 'Node.js']);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 8) {
      setError('Please provide a project title with at least 8 characters.');
      return;
    }
    if (description.trim().length < 20) {
      setError('Please describe your project requirements in at least 20 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.createProject({
        title: title.trim(),
        description: description.trim(),
        categoryId,
        budget: parseInt(budget, 10) || 1000,
        deadlineDays: parseInt(deadlineDays, 10) || 3,
        requiredSkills: skills,
      });
      onSuccess(res.project);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to post project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-emerald-100">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">Post a Student Task / Project</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Project Title <span className="text-emerald-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Build an interactive quiz app with React & Tailwind"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
              >
                <option value="web-dev">Web & Mobile Dev</option>
                <option value="ai-data">AI & Data Science</option>
                <option value="design">UI/UX & Graphics</option>
                <option value="tutoring">Tutoring & Academic</option>
                <option value="content">Content & Writing</option>
                <option value="video">Video & Animation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Budget (INR ₹) <span className="text-emerald-600">*</span>
              </label>
              <input
                type="number"
                min="100"
                step="100"
                required
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Project Brief & Scope <span className="text-emerald-600">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Explain deliverables, technology preferences, and expected outcome..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deadline (Days)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={deadlineDays}
                onChange={e => setDeadlineDays(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Required Skills</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. Python"
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {skills.map(s => (
                <span
                  key={s}
                  className="px-2 py-0.5 text-[11px] bg-emerald-100 text-emerald-800 rounded-md font-medium flex items-center gap-1"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => setSkills(skills.filter(x => x !== s))}
                    className="hover:text-rose-600 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Publish Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
