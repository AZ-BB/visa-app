"use client";

interface Step5CheckoutProps {
  onBack?: () => void;
}

export function Step5Checkout({ onBack }: Step5CheckoutProps) {
  return (
    <div className="rounded-xl border border-border-default bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-primary-copy mb-4">
        Checkout
      </h2>
      <p className="text-secondary-copy text-sm mb-6">
        Placeholder: review, payment, and submit application.
      </p>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border-2 border-border-default bg-white px-4 py-2 text-sm font-semibold text-primary-copy hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
      )}
    </div>
  );
}
