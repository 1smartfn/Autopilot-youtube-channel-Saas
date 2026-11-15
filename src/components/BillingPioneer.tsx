import React, { useState } from 'react';
import { 
  CreditCard, 
  Check, 
  Zap, 
  ShieldCheck, 
  FileText, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  Cpu, 
  Layers
} from 'lucide-react';
import { BillingState } from '../types';
import { ComponentTag } from './ComponentTag';

interface BillingPioneerProps {
  billing: BillingState;
  onUpgradeTier: (tier: 'free' | 'pro' | 'agency') => void;
}

export const BillingPioneer: React.FC<BillingPioneerProps> = ({
  billing,
  onUpgradeTier
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'agency'>(billing.currentTier);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutTarget, setCheckoutTarget] = useState<'free' | 'pro' | 'agency'>('pro');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const plans = [
    {
      id: 'free' as const,
      name: 'Starter Pilot',
      price: '$0',
      period: 'forever',
      description: 'Ideal for testing trend discovery and generating single preview clips.',
      slots: '1 concurrent GPU slot',
      quota: '5 videos / month',
      features: [
        '1 concurrent worker queue slot',
        '5 Google Veo video renders / mo',
        'Google Sheets manual sync',
        '720p HD synthetic preview',
        '5 GB AWS S3 storage vault',
        'Single YouTube channel connection'
      ],
      popular: false
    },
    {
      id: 'pro' as const,
      name: 'Pro Autopilot',
      price: '$49',
      period: 'per month',
      description: 'Full 24/7 autopilot for serious YouTube automation channels.',
      slots: '4 concurrent GPU slots',
      quota: '60 videos / month (2/day)',
      features: [
        '4 concurrent worker render slots',
        '60 Google Veo 3.1 AI video renders / mo',
        'Continuous 24/7 Autopilot scheduler',
        'Real-time two-way Google Sheets sync',
        'Direct YouTube 1-click & auto-publishing',
        '1080p 60fps cinematic renders',
        '100 GB AWS S3 secure vault',
        'Multi-channel support (up to 3 channels)'
      ],
      popular: true
    },
    {
      id: 'agency' as const,
      name: 'Agency Studio',
      price: '$199',
      period: 'per month',
      description: 'High-throughput cluster for media agencies running multiple channels.',
      slots: '16 concurrent GPU slots',
      quota: '300 videos / month',
      features: [
        '16 concurrent dedicated GPU slots (H100 & TPU)',
        '300 Google Veo video renders / mo',
        'Dedicated worker node priority',
        'Ultra-HD 4K Veo master outputs',
        '1 TB AWS S3 multi-tenant vault',
        'Unlimited YouTube channels & accounts',
        'Pioneer automated invoicing & custom SLA'
      ],
      popular: false
    }
  ];

  const handleStartCheckout = (planId: 'free' | 'pro' | 'agency') => {
    setCheckoutTarget(planId);
    setShowCheckoutModal(true);
    setCheckoutSuccess(false);
  };

  const handleExecutePioneerPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCheckoutSuccess(true);
      onUpgradeTier(checkoutTarget);
      setTimeout(() => {
        setShowCheckoutModal(false);
      }, 1500);
    }, 1800);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 sm:px-6 py-4 space-y-6 max-w-7xl mx-auto w-full">
      
      {/* Pioneer Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900 to-pink-950/30 p-6 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <ComponentTag id="SEC-BILLING-HEADER" name="Pioneer Gateway Header & Credentials" category="section" size="xs" />
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Pioneer Payment Gateway & Multi-Tenant Billing
                </h1>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  PCI-DSS Level 1 Compliant
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Automated subscription billing, concurrent render slots governor, and per-user quota allocation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5">
            <span className="text-zinc-500">Merchant: </span>
            <span className="text-pink-300 font-semibold">{billing.pioneerMerchantId}</span>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5">
            <span className="text-zinc-500">Active Tier: </span>
            <span className="text-amber-300 font-semibold uppercase">{billing.currentTier}</span>
          </div>
        </div>
      </div>

      {/* Subscription Quota Usage Card */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <ComponentTag id="CARD-BILLING-METRICS" name="Subscription Quota & Concurrency Cards" category="metric" size="xs" />
          <span className="text-[11px] font-mono text-zinc-400">Account Quota</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <span className="text-xs text-zinc-400">Monthly Video Quota</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{billing.quotaUsed}</span>
            <span className="text-xs text-zinc-500">/ {billing.quotaTotal} videos rendered</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div 
              className="h-full bg-pink-500 rounded-full" 
              style={{ width: `${(billing.quotaUsed / billing.quotaTotal) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <span className="text-xs text-zinc-400">Concurrent Render Slots</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan-400">{billing.concurrentLimit}</span>
            <span className="text-xs text-zinc-500">active parallel render workers</span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">Allows queuing multiple trend topics simultaneously</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <span className="text-xs text-zinc-400">Current Billing Cycle</span>
          <div className="mt-2 text-base font-bold text-white">
            Renews on {new Date(billing.currentPeriodEnd).toLocaleDateString()}
          </div>
          <p className="mt-1 text-[11px] text-emerald-400">Pioneer Auto-Debit Enabled</p>
        </div>
      </div>
      </div>

      {/* Pricing Plans Grid */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ComponentTag id="CARD-BILLING-TIERS" name="Pioneer Subscription Tier Selector Cards" category="card" size="xs" />
          <span className="text-[11px] font-mono text-zinc-400">Subscription Plans</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = billing.currentTier === plan.id;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between relative transition-all ${
                plan.popular
                  ? 'border-red-500/60 bg-gradient-to-b from-red-950/20 to-zinc-900 shadow-xl shadow-red-500/5'
                  : 'border-zinc-800 bg-zinc-900/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-red-500 to-amber-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                  Most Popular for Creators
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="mt-1 text-xs text-zinc-400">{plan.description}</p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-xs text-zinc-500">/{plan.period}</span>
                </div>

                <div className="mt-3 rounded-lg bg-zinc-950 border border-zinc-800/80 p-2.5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Worker Slots:</span>
                    <span className="font-semibold text-cyan-400">{plan.slots}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Render Limit:</span>
                    <span className="font-semibold text-emerald-400">{plan.quota}</span>
                  </div>
                </div>

                <ul className="mt-5 space-y-2 text-xs text-zinc-300">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full rounded-xl bg-zinc-800 py-2.5 text-xs font-semibold text-zinc-400 cursor-default flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Current Active Plan</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartCheckout(plan.id)}
                    className={`w-full rounded-xl py-2.5 text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-500/20'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                    }`}
                  >
                    <span>Upgrade via Pioneer</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </div>

      {/* Pioneer Invoice History */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ComponentTag id="CARD-BILLING-INVOICES" name="Pioneer Transaction & Invoice Ledger Table" category="card" size="xs" />
            <FileText className="h-4 w-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-white">Pioneer Transaction & Invoice Ledger</h3>
          </div>
          <span className="text-xs text-zinc-500">Auto-billed monthly</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Invoice ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Processor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-[11px]">
              {billing.invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-800/30">
                  <td className="px-4 py-3 text-zinc-300 font-semibold">{inv.id}</td>
                  <td className="px-4 py-3 text-zinc-400">{inv.date}</td>
                  <td className="px-4 py-3 text-white font-sans">{inv.plan}</td>
                  <td className="px-4 py-3 text-emerald-400 font-bold">{inv.amount}</td>
                  <td className="px-4 py-3 text-pink-300">{inv.processor}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                      PAID
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => alert(`Downloading Pioneer Tax Receipt for ${inv.id}`)}
                      className="text-zinc-400 hover:text-white underline text-[10px]"
                    >
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pioneer Simulated Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-4 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Pioneer Secure Checkout</h3>
                  <p className="text-[11px] text-zinc-400">256-Bit Encrypted Payment Flow</p>
                </div>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-zinc-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            {checkoutSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-white">Subscription Activated!</h4>
                <p className="text-xs text-zinc-400">
                  Pioneer has provisioned your new concurrency render slots and upgraded your quota.
                </p>
              </div>
            ) : (
              <div className="py-4 space-y-4 text-xs">
                <div className="rounded-xl bg-zinc-950 p-3 border border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">SELECTED TIER</span>
                    <span className="text-sm font-bold text-white uppercase">{checkoutTarget} Plan</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-400">
                    {checkoutTarget === 'pro' ? '$49.00' : checkoutTarget === 'agency' ? '$199.00' : '$0.00'}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-zinc-400">Pioneer Test Card Number</label>
                  <div className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-white font-mono flex items-center justify-between">
                    <span>4242 •••• •••• 4242</span>
                    <span className="text-zinc-500">12/28</span>
                  </div>
                </div>

                <div className="rounded-lg bg-pink-950/20 border border-pink-500/30 p-2.5 text-[11px] text-pink-300 flex items-center gap-2">
                  <Lock className="h-4 w-4 shrink-0" />
                  <span>Test mode active. No actual credit card charge will occur.</span>
                </div>

                <button
                  onClick={handleExecutePioneerPayment}
                  disabled={isProcessing}
                  className="w-full mt-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 py-3 text-xs font-bold text-white shadow-lg shadow-pink-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authorizing with Pioneer Gateway...</span>
                    </>
                  ) : (
                    <span>Confirm & Pay via Pioneer</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      </div>
    </div>
  );
};
