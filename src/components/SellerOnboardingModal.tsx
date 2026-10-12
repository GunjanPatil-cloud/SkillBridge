import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  Sparkles,
  Plus,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { SellerProfile, User } from '../types';

interface SellerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: SellerProfile, user: User) => void;
}

const COMMON_SKILLS = [
  'React',
  'Next.js',
  'TypeScript',
  'Node.js',
  'FastAPI',
  'Python',
  'Figma',
  'UI/UX Design',
  'PostgreSQL',
  'Tailwind CSS',
  'Machine Learning',
  'Academic Tutoring',
  'Video Editing',
  'Technical Writing',
];

export const SellerOnboardingModal: React.FC<SellerOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [collegeName, setCollegeName] = useState('');
  const [graduationYear, setGraduationYear] = useState('2027');
  const [major, setMajor] = useState('Computer Science & Engineering');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('500');
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'Tailwind CSS']);
  const [newSkill, setNewSkill] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!collegeName.trim()) {
      setError('Please enter your college or university name.');
      return;
    }
    if (bio.trim().length < 25) {
      setError('Please write at least 25 characters in your bio to help clients trust your work.');
      return;
    }
    if (skills.length === 0) {
      setError('Please add at least one core skill.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.onboardSeller({
        collegeName,
        graduationYear: parseInt(graduationYear, 10),
        major,
        bio,
        skills,
        hourlyRate: parseInt(hourlyRate, 10) || 500,
        portfolioUrl: portfolioUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
      });

      onSuccess(res.sellerProfile, res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to complete seller onboarding. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-emerald-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Student Seller Onboarding</h2>
              <p className="text-xs text-emerald-100">
                Setup your profile to start offering services and earning on campus
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                College / University <span className="text-emerald-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. IIT Bombay, BITS Pilani, NIT Trichy"
                value={collegeName}
                onChange={e => setCollegeName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Graduation Year <span className="text-emerald-600">*</span>
              </label>
              <select
                value={graduationYear}
                onChange={e => setGraduationYear(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
              >
                <option value="2024">2024 (Recent Graduate)</option>
                <option value="2025">2025 (Final Year)</option>
                <option value="2026">2026 (Pre-final Year)</option>
                <option value="2027">2027 (Sophomore)</option>
                <option value="2028">2028 (Freshman)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Major / Degree <span className="text-emerald-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. B.Tech Computer Science, Design"
                value={major}
                onChange={e => setMajor(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Expected Hourly Rate (INR ₹) <span className="text-emerald-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="100"
                  max="10000"
                  step="50"
                  value={hourlyRate}
                  onChange={e => setHourlyRate(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Professional Biography & Campus Experience <span className="text-emerald-600">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Tell buyers about your projects, hackathons, technical strengths, and what student services you provide..."
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">
              Minimum 25 characters. {bio.length}/25 characters.
            </p>
          </div>

          {/* Skills Tag Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Core Skills & Tools <span className="text-emerald-600">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {skills.map(sk => (
                <span
                  key={sk}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"
                >
                  {sk}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(sk)}
                    className="hover:text-rose-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add custom skill (e.g. Flutter, PyTorch)..."
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(newSkill);
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => handleAddSkill(newSkill)}
                className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[11px] text-slate-400 mr-1">Suggestions:</span>
              {COMMON_SKILLS.slice(0, 8).map(sk => (
                <button
                  type="button"
                  key={sk}
                  onClick={() => handleAddSkill(sk)}
                  disabled={skills.includes(sk)}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                    skills.includes(sk)
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                      : 'bg-white hover:bg-emerald-50 text-slate-600 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  + {sk}
                </button>
              ))}
            </div>
          </div>

          {/* Portfolio & Links */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Portfolio & Social Links (Optional)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">GitHub URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">LinkedIn URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={e => setLinkedinUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Live Portfolio / Demo</label>
                <input
                  type="url"
                  placeholder="https://myportfolio.dev"
                  value={portfolioUrl}
                  onChange={e => setPortfolioUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Includes Free Student Seller Plan</span>
            </div>

            <div className="flex gap-2">
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
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Creating Profile...' : 'Complete Onboarding & Start Selling'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
