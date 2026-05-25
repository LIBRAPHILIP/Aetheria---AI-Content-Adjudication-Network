import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
// import { api } from '../services/api';

const disputeSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  contentUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  escrowStake: z.number().min(10, 'Minimum stake is 10 tokens'),
});

type DisputeFormData = z.infer<typeof disputeSchema>;

interface FileDisputeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitMock?: (data: DisputeFormData) => void;
}

export default function FileDisputeModal({ open, onClose, onSubmitMock }: FileDisputeModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DisputeFormData>({
    resolver: zodResolver(disputeSchema),
    defaultValues: {
      title: '',
      description: '',
      contentUrl: '',
      escrowStake: 10,
    },
  });

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      closeButtonRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      previousFocusRef.current?.focus();
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const onSubmit = async (data: DisputeFormData) => {
    try {
      // Mock API call instead of using actual API since there's no backend
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (onSubmitMock) {
          onSubmitMock(data);
      }
      
      toast.success('Dispute filed successfully!');
      reset();
      onClose();
    } catch (error) {
      toast.error('Failed to file dispute. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto text-slate-100 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 id="modal-title" className="text-xl font-bold">File New Dispute</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="title" className="block mb-1.5 text-sm font-medium text-slate-400">Title <span className="text-red-400">*</span></label>
            <input 
                id="title" 
                {...register('title')} 
                placeholder="Brief title of the dispute" 
                className="w-full px-4 py-2 bg-[#1e293b] border border-[#334155] rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
             />
            {errors.title && <p className="text-red-400 text-xs mt-1" role="alert">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block mb-1.5 text-sm font-medium text-slate-400">Description <span className="text-red-400">*</span></label>
            <textarea 
                id="description" 
                {...register('description')} 
                rows={4} 
                placeholder="Describe the AI content and the reason for dispute" 
                className="w-full px-4 py-2 bg-[#1e293b] border border-[#334155] rounded-xl focus:outline-none focus:border-indigo-500 transition-colors resize-none"
             />
            {errors.description && <p className="text-red-400 text-xs mt-1" role="alert">{errors.description.message}</p>}
          </div>

          <div>
            <label htmlFor="contentUrl" className="block mb-1.5 text-sm font-medium text-slate-400">Content URL (optional)</label>
            <input 
                id="contentUrl" 
                {...register('contentUrl')} 
                placeholder="https://..." 
                className="w-full px-4 py-2 bg-[#1e293b] border border-[#334155] rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
             />
            {errors.contentUrl && <p className="text-red-400 text-xs mt-1" role="alert">{errors.contentUrl.message}</p>}
          </div>

          <div>
            <label htmlFor="escrowStake" className="block mb-1.5 text-sm font-medium text-slate-400">Escrow Stake (tokens) <span className="text-red-400">*</span></label>
            <input 
                type="number" 
                id="escrowStake" 
                {...register('escrowStake', { valueAsNumber: true })} 
                className="w-full px-4 py-2 bg-[#1e293b] border border-[#334155] rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
             />
            {errors.escrowStake && <p className="text-red-400 text-xs mt-1" role="alert">{errors.escrowStake.message}</p>}
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-[#1e293b]">
            <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2.5 bg-[#1e293b] hover:bg-[#334155] text-slate-200 rounded-xl transition-colors text-sm font-medium"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors disabled:opacity-50 text-sm font-bold shadow-[0_0_15px_rgba(79,70,229,0.2)]"
            >
              {isSubmitting ? 'Filing...' : 'Submit Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
