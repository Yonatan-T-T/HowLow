import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Image as ImageIcon, 
  Sparkles, 
  AlertCircle
} from 'lucide-react';
import type { CreateAuctionPayload } from '../types/auction';
import { api } from '../services/api';

interface PresetTemplate {
  title: string;
  description: string;
  imageUrl: string;
  retailValue: number;
  registrationFee: number;
}

const DEMO_PRESETS: PresetTemplate[] = [
  {
    title: 'Apple iPad Pro 13" M4 OLED - Space Black',
    description: 'Ultra Retina XDR display featuring breakthrough tandem OLED technology. Powered by the groundbreaking Apple M4 chip with 10-core CPU and hardware-accelerated ray tracing.',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1000&q=80',
    retailValue: 1299.00,
    registrationFee: 6.00,
  },
  {
    title: 'Fujifilm X100VI Digital Camera - Silver',
    description: 'The iconic street photography camera with 40.2MP X-Trans CMOS 5 HR sensor, 5-axis in-body image stabilization, and legendary Film Simulation modes.',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
    retailValue: 1599.00,
    registrationFee: 7.50,
  },
  {
    title: 'Nintendo Switch OLED - Mario Red Edition',
    description: 'Vibrant 7-inch OLED screen, wide adjustable stand, enhanced audio, and 64GB internal storage in a special Mario-themed red chassis.',
    imageUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1000&q=80',
    retailValue: 349.99,
    registrationFee: 2.00,
  },
];

export const AdminCreateAuction: React.FC = () => {
  const navigate = useNavigate();

  // Calculate default end time: 2 hours from now formatted for datetime-local input
  const getDefaultEndTime = () => {
    const d = new Date(Date.now() + 2 * 3600 * 1000);
    // Format to YYYY-MM-DDTHH:mm local
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localIso = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    return localIso;
  };

  const [formData, setFormData] = useState<CreateAuctionPayload>({
    title: '',
    description: '',
    imageUrl: '',
    registrationFee: 5.00,
    retailValue: 999.00,
    endTime: getDefaultEndTime(),
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  // Quick preset loader
  const applyPreset = (preset: PresetTemplate) => {
    setFormData((prev) => ({
      ...prev,
      title: preset.title,
      description: preset.description,
      imageUrl: preset.imageUrl,
      retailValue: preset.retailValue,
      registrationFee: preset.registrationFee,
    }));
  };

  // Quick Duration Setter
  const setDurationFromNow = (minutes: number) => {
    const target = new Date(Date.now() + minutes * 60 * 1000);
    const tzOffset = target.getTimezoneOffset() * 60000;
    const localIso = new Date(target.getTime() - tzOffset).toISOString().slice(0, 16);
    setFormData((prev) => ({ ...prev, endTime: localIso }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Form Validations
    if (!formData.title.trim()) {
      setErrorMsg('Auction Title is required.');
      return;
    }
    if (!formData.description.trim()) {
      setErrorMsg('Description is required.');
      return;
    }
    if (!formData.imageUrl.trim()) {
      setErrorMsg('Image URL is required.');
      return;
    }
    if (formData.retailValue <= 0) {
      setErrorMsg('Retail Value must be greater than $0.00.');
      return;
    }
    if (formData.registrationFee < 0) {
      setErrorMsg('Registration Fee cannot be negative.');
      return;
    }

    const selectedEndDate = new Date(formData.endTime);
    if (selectedEndDate.getTime() <= Date.now()) {
      setErrorMsg('End Date & Time must be set in the future.');
      return;
    }

    try {
      setIsSubmitting(true);
      // Convert to ISO string in UTC for the API
      const payload: CreateAuctionPayload = {
        ...formData,
        endTime: selectedEndDate.toISOString(),
      };

      const created = await api.createAuction(payload);
      navigate(`/auction/${created.id}`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create auction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Dashboard</span>
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Plus className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Create New Lowest Unique Bid Auction</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Define item details, registration fee, countdown expiration, and verified retail value.
          </p>
        </div>
      </div>

      {/* Preset Quick Fill Buttons */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 mb-8">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
          Quick Demo Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {DEMO_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700/60 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{preset.title.split('-')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/50 border border-rose-800/60 text-xs sm:text-sm text-rose-300 flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5 uppercase tracking-wide">
              Auction Item Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Sony PlayStation 5 Pro 2TB Console"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white text-sm transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5 uppercase tracking-wide">
              Description & Specifications *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe the condition, key specs, warranty, and prize features..."
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white text-sm transition-all resize-none"
            />
          </div>

          {/* Image URL & Live Preview */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 block uppercase tracking-wide">
              Item Image URL *
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="flex-1 w-full">
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white text-sm font-mono transition-all"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Provide a direct, high-resolution image link.
                </span>
              </div>

              {/* Preview Thumbnail */}
              <div className="w-28 h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 flex items-center justify-center">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80';
                    }}
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-700" />
                )}
              </div>
            </div>
          </div>

          {/* Financials: Retail Value & Registration Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 uppercase tracking-wide">
                Retail Value (USD $) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">$</span>
                <input
                  type="number"
                  name="retailValue"
                  step="0.01"
                  min="0.01"
                  value={formData.retailValue}
                  onChange={handleChange}
                  required
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white font-mono text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 uppercase tracking-wide">
                Registration / Entry Fee (USD $) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">$</span>
                <input
                  type="number"
                  name="registrationFee"
                  step="0.01"
                  min="0"
                  value={formData.registrationFee}
                  onChange={handleChange}
                  required
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white font-mono text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* End Date & Time Picker */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5 uppercase tracking-wide">
              Auction Countdown End Date & Time *
            </label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white font-mono text-sm transition-all"
            />

            {/* Quick Duration Shortcuts */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">Quick expiration buttons:</span>
              <button
                type="button"
                onClick={() => setDurationFromNow(2)}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-mono transition-colors"
              >
                +2 Mins (Fast Demo)
              </button>
              <button
                type="button"
                onClick={() => setDurationFromNow(15)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
              >
                +15 Mins
              </button>
              <button
                type="button"
                onClick={() => setDurationFromNow(120)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
              >
                +2 Hours
              </button>
              <button
                type="button"
                onClick={() => setDurationFromNow(1440)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
              >
                +24 Hours
              </button>
              <button
                type="button"
                onClick={() => setDurationFromNow(4320)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
              >
                +3 Days
              </button>
            </div>
          </div>

        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            to="/admin"
            className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-900/40 flex items-center gap-2"
          >
            {isSubmitting ? (
              <span>Deploying Auction...</span>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Publish Auction Live</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
