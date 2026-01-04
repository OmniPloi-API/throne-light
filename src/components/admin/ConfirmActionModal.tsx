import { Loader2, Power, RotateCcw, AlertTriangle } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  couponCode: string;
  isActive: boolean;
}

interface ConfirmActionModalProps {
  action: { type: 'deactivate' | 'reactivate' | 'delete'; partner: Partner };
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmActionModal({
  action,
  loading,
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) {
  const config = {
    deactivate: {
      title: 'Deactivate Partner Campaign',
      message: `Are you sure you want to deactivate ${action.partner.name}'s campaign?`,
      description: 'This will stop their coupon code from working. Their link will still track visits but won\'t apply discounts. You can reactivate this campaign later to reuse the same coupon code.',
      confirmText: 'Deactivate Campaign',
      confirmColor: 'bg-yellow-600 hover:bg-yellow-700',
      icon: <Power className="w-6 h-6" />,
      iconColor: 'text-yellow-400',
    },
    reactivate: {
      title: 'Reactivate Partner Campaign',
      message: `Reactivate ${action.partner.name}'s campaign?`,
      description: 'This will make their coupon code active again and resume normal tracking.',
      confirmText: 'Reactivate Campaign',
      confirmColor: 'bg-green-600 hover:bg-green-700',
      icon: <RotateCcw className="w-6 h-6" />,
      iconColor: 'text-green-400',
    },
    delete: {
      title: 'Permanently Delete Partner',
      message: `Are you sure you want to permanently delete ${action.partner.name}?`,
      description: 'This action CANNOT be undone. All tracking data, commission history, and partner information will be permanently deleted. If you want to temporarily disable this campaign, use Deactivate instead.',
      confirmText: 'Yes, Delete Permanently',
      confirmColor: 'bg-red-600 hover:bg-red-700',
      icon: <AlertTriangle className="w-6 h-6" />,
      iconColor: 'text-red-400',
    },
  };

  const c = config[action.type];

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-[#333] rounded-xl max-w-md w-full p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-full bg-${action.type === 'delete' ? 'red' : action.type === 'deactivate' ? 'yellow' : 'green'}-900/30 ${c.iconColor}`}>
            {c.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{c.title}</h3>
            <p className="text-gray-300 mb-2">{c.message}</p>
            <p className="text-sm text-gray-400">{c.description}</p>
          </div>
        </div>

        {action.type === 'deactivate' && (
          <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3 mb-4">
            <p className="text-sm text-blue-300">
              <strong>💡 Tip:</strong> Deactivating allows you to reuse the coupon code <code className="text-gold">{action.partner.couponCode}</code> for a new campaign type (e.g., switching from Flat Fee to Revenue Share).
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-[#222] hover:bg-[#333] disabled:bg-[#111] text-white rounded transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-3 ${c.confirmColor} disabled:opacity-50 text-white rounded transition font-medium flex items-center justify-center gap-2`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              c.confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
