import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const API_URL = 'https://oggpack-backend-production.up.railway.app';

// Get your publishable key from Stripe Dashboard
const stripePromise = loadStripe('pk_test_51SEllTG4B2dDVNjOjhRJG9ixpyNR8kPds53ypmPd0REfybQwCUGbFrf26QcHhV3BJLZvFZHv8hhBXacrImaDL9Us009ioChErM');

function CheckoutForm({ oggpackId, amount, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/social`,
      },
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message);
      setProcessing(false);
    } else {
      // Payment succeeded
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <div className="text-red-400 text-sm">{error}</div>
      )}
      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold"
        >
          {processing ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function BuyPackButton({ oggpackId, oggpackTitle, token }) {
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [amount, setAmount] = useState(0);
  const [owns, setOwns] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOwnership();
  }, [oggpackId]);

  const checkOwnership = async () => {
    try {
      const { data } = await axios.get(
        `${API_URL}/api/payment/check-ownership/${oggpackId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOwns(data.owns);
    } catch (err) {
      console.error('Failed to check ownership:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyClick = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${API_URL}/api/payment/create-payment-intent`,
        { oggpack_id: oggpackId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setClientSecret(data.clientSecret);
      setAmount(data.amount);
      setShowPayment(true);
    } catch (err) {
      console.error('Failed to create payment:', err);
      alert(err.response?.data?.error || 'Failed to start payment');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setShowPayment(false);
    setOwns(true);
    alert('Purchase successful! You now own this pack.');
  };

  const handleDownload = () => {
    // Download the .oggpack file
    window.open(`${API_URL}/uploads/oggpack/${oggpackId}.oggpack`, '_blank');
  };

  if (loading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  if (owns) {
    return (
      <button
        onClick={handleDownload}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center space-x-2"
      >
        <span>⬇</span>
        <span>Download Pack</span>
      </button>
    );
  }

  if (showPayment && clientSecret) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Purchase: {oggpackTitle}</h3>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            oggpackId={oggpackId}
            amount={amount}
            onSuccess={handleSuccess}
            onCancel={() => setShowPayment(false)}
          />
        </Elements>
      </div>
    );
  }

  return (
    <button
      onClick={handleBuyClick}
      disabled={loading}
      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold"
    >
      Buy Pack - $2.99
    </button>
  );
}