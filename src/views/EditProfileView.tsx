import React, { useState, useEffect } from 'react';
import {
  User,
  SellerProfile,
  SellerSubscription,
} from '../types';
import { api } from '../services/api';
import {
  GraduationCap,
  Sparkles,
  Camera,
  Mail,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Plus,
  X,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  IndianRupee,
  Calendar,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface EditProfileViewProps {
  currentUser: User | null;
  sellerProfile: SellerProfile | null;
  subscription: SellerSubscription | null;
  onProfileUpdated: (user: User, sellerProfile: SellerProfile | null, sub: SellerSubscription | null) => void;
  onOpenOnboarding: () => void;
  onSwitchToSeller: () => void;
}

const COMMON_SKILLS = [
  'React',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Python',
  'Tailwind CSS',
  'Figma',
  'UI/UX Design',
  'FastAPI',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'Git',
  'AI Prompting',
  'Machine Learning',
  'Academic Tutoring',
  'Video Editing',
  'Content Writing',
];

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
];

export const EditProfileView: React.FC<EditProfileViewProps> = ({
  currentUser,
  sellerProfile,
  subscription,
  onProfileUpdated,
  onOpenOnboarding,
  onSwitchToSeller,
}) => {
  // Account Information
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');

  // Student / Seller Information
  const [collegeName, setCollegeName] = useState(sellerProfile?.collegeName || '');
  const [graduationYear, setGraduationYear] = useState(String(sellerProfile?.graduationYear || '2027'));
  const [major, setMajor] = useState(sellerProfile?.major || '');
  const [bio, setBio] = useState(sellerProfile?.bio || '');
  const [hourlyRate, setHourlyRate] = useState(String(sellerProfile?.hourlyRate || '500'));
  const [skills, setSkills] = useState<string[]>(sellerProfile?.skills || ['React', 'TypeScript', 'Tailwind CSS']);
  const [newSkill, setNewSkill] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState(sellerProfile?.portfolioUrl || '');
  const [githubUrl, setGithubUrl] = useState(sellerProfile?.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(sellerProfile?.linkedinUrl || '');

  // Form State
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state if currentUser/sellerProfile changes (e.g. persona switch)
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName);
      setEmail(currentUser.email);
      setAvatarUrl(currentUser.avatarUrl);
    }
    if (sellerProfile) {
      setCollegeName(sellerProfile.collegeName);
      setGraduationYear(String(sellerProfile.graduationYear || '2027'));
      setMajor(sellerProfile.major);
      setBio(sellerProfile.bio);
      setHourlyRate(String(sellerProfile.hourlyRate || '500'));
      setSkills(sellerProfile.skills || []);
      setPortfolioUrl(sellerProfile.portfolioUrl || '');
      setGithubUrl(sellerProfile.githubUrl || '');
      setLinkedinUrl(sellerProfile.linkedinUrl || '');
    }
  }, [currentUser, sellerProfile]);

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
    setErrorMessage(null);
    setSuccessMessage(null);
    setSaving(true);

    try {
      const res = await api.updateUserProfile({
        fullName,
        email,
        avatarUrl,
        collegeName: collegeName || undefined,
        graduationYear: graduationYear ? parseInt(graduationYear, 10) : undefined,
        major: major || undefined,
        bio: bio || undefined,
        hourlyRate: hourlyRate ? parseInt(hourlyRate, 10) : undefined,
        skills: skills.length > 0 ? skills : undefined,
        portfolioUrl: portfolioUrl || '',
        githubUrl: githubUrl || '',
        linkedinUrl: linkedinUrl || '',
      });

      onProfileUpdated(res.user, res.sellerProfile, res.subscription);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const isSeller = currentUser?.activeRole === 'seller' || Boolean(sellerProfile?.isOnboarded);
  const isPro = subscription?.planId.includes('premium');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <img
              src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={fullName}
              className="w-20 h-20 rounded-2xl object-cover border-3 border-emerald-500 shadow-md"
            />
            <div className="absolute inset-0 bg-slate-900/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Camera className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900">{fullName || 'Student User'}</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                {currentUser?.activeRole === 'seller' ? 'Seller Account' : 'Buyer Account'}
              </span>
              {isPro && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1 border border-amber-200">
                  <Sparkles className="w-3 h-3 text-amber-600 fill-amber-500" /> PRO Star
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{email}</span>
              {collegeName && (
                <>
                  <span className="text-slate-300">•</span>
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{collegeName}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Quick Mode Status Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          {!sellerProfile?.isOnboarded ? (
            <button
              onClick={onOpenOnboarding}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-102"
            >
              <Briefcase className="w-4 h-4" />
              <span>Activate Seller Profile</span>
            </button>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                ★
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-900">Seller Mode Onboarded</p>
                <p className="text-[10px] text-slate-500">{sellerProfile.totalOrdersCompleted} orders completed • {sellerProfile.averageRating.toFixed(1)} rating</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success & Error alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Account Profile */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Personal & Account Details</h2>
              <p className="text-xs text-slate-500">Your public identity and contact information across SkillBridge</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name <span className="text-emerald-600">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Arjun Sharma"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address <span className="text-emerald-600">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. arjun@iitb.ac.in"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Avatar Photo URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden mb-2"
            />
            {/* Quick avatar selector presets */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] font-semibold text-slate-400">Presets:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      avatarUrl === preset ? 'border-emerald-600 scale-110' : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    <img src={preset} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: College & Academic Background */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Campus & Academic Background</h2>
              <p className="text-xs text-slate-500">Helps build verified trust with student peers and project founders</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> College / University Name
              </label>
              <input
                type="text"
                value={collegeName}
                onChange={e => setCollegeName(e.target.value)}
                placeholder="e.g. IIT Bombay, BITS Pilani, Stanford..."
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Graduation Year
              </label>
              <select
                value={graduationYear}
                onChange={e => setGraduationYear(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
              >
                <option value="2024">2024 (Alumni)</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
                <option value="2029">2029</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Major / Degree
            </label>
            <input
              type="text"
              value={major}
              onChange={e => setMajor(e.target.value)}
              placeholder="e.g. Computer Science & Engineering, Design, Business..."
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Section 3: Student Freelancer & Creator Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Student Bio, Skills & Links</h2>
              <p className="text-xs text-slate-500">Showcase your portfolio, technical stack, and rates to clients</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Professional Bio & Experience
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Share what projects you love building, hackathons won, or academic coursework..."
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Hourly Rate (INR ₹)
            </label>
            <input
              type="number"
              min="100"
              step="50"
              value={hourlyRate}
              onChange={e => setHourlyRate(e.target.value)}
              placeholder="500"
              className="w-full max-w-xs px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            <p className="text-[11px] text-slate-400 mt-1">Suggested student freelance rate: ₹400 – ₹1,500/hour</p>
          </div>

          {/* Skills Tag Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Skills & Technologies
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {skills.map(s => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    className="text-emerald-600 hover:text-emerald-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                placeholder="Type custom skill..."
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(newSkill);
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => handleAddSkill(newSkill)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {/* Common skill suggestions */}
            <div className="mt-2.5 flex items-center gap-1 flex-wrap">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Suggested:</span>
              {COMMON_SKILLS.filter(cs => !skills.includes(cs)).slice(0, 8).map(cs => (
                <button
                  key={cs}
                  type="button"
                  onClick={() => handleAddSkill(cs)}
                  className="text-[10px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                >
                  + {cs}
                </button>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-500" /> Portfolio Website
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={e => setPortfolioUrl(e.target.value)}
                placeholder="https://myportfolio.dev"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-slate-800" /> GitHub URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5 text-blue-600" /> LinkedIn URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={e => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-101"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
