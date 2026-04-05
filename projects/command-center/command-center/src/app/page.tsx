'use client';

import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Eye, 
  MessageCircle,
  CheckCircle2,
  Calendar,
  Wallet,
  Heart,
  Headset,
  Mail,
  Hash
} from 'lucide-react';

// Metric card component
function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = 'positive',
  icon: Icon 
}: { 
  title: string; 
  value: string; 
  change?: string; 
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 transition-colors hover:border-[var(--border-default)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
          {change && (
            <div className={`mt-2 flex items-center gap-1 text-sm ${changeType === 'positive' ? 'text-[var(--positive)]' : changeType === 'negative' ? 'text-[var(--negative)]' : 'text-[var(--text-tertiary)]'}`}>
              {changeType === 'positive' ? <TrendingUp size={14} /> : changeType === 'negative' ? <TrendingDown size={14} /> : null}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-muted)] text-[var(--accent)]">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Quick Stats</h2>
          <p className="text-sm text-[var(--text-tertiary)]">Last 7 days</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Revenue"
            value="$12,847"
            change="+12.5%"
            changeType="positive"
            icon={DollarSign}
          />
          <MetricCard
            title="Subscribers"
            value="2,847"
            change="+8.2%"
            changeType="positive"
            icon={Users}
          />
          <MetricCard
            title="Page Views"
            value="48.2K"
            change="+23.1%"
            changeType="positive"
            icon={Eye}
          />
          <MetricCard
            title="Support Tickets"
            value="23"
            change="-15.3%"
            changeType="positive"
            icon={Headset}
          />
        </div>
      </section>

      {/* Revenue by Platform */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Revenue by Platform</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Stripe"
            value="$8,234"
            change="+18.2%"
            changeType="positive"
            icon={DollarSign}
          />
          <MetricCard
            title="Mercury"
            value="$3,421"
            change="+5.4%"
            changeType="positive"
            icon={Wallet}
          />
          <MetricCard
            title="Revolut"
            value="$1,192"
            change="-2.1%"
            changeType="negative"
            icon={Wallet}
          />
        </div>
      </section>

      {/* X / Twitter */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">X / Twitter</h2>
          <a 
            href="https://x.com/bornesystems" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            @bornesystems →
          </a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Followers"
            value="1,247"
            change="+12.4%"
            changeType="positive"
            icon={Users}
          />
          <MetricCard
            title="Following"
            value="892"
            change="+3.2%"
            changeType="positive"
            icon={Users}
          />
          <MetricCard
            title="Tweets"
            value="3,421"
            change="+28 new"
            changeType="neutral"
            icon={MessageCircle}
          />
          <MetricCard
            title="Impressions"
            value="45.2K"
            change="+18.7%"
            changeType="positive"
            icon={Eye}
          />
        </div>
      </section>

      {/* Social & Marketing */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Social & Marketing</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="YouTube"
            value="124K"
            change="+31.2%"
            changeType="positive"
            icon={Eye}
          />
          <MetricCard
            title="Instagram"
            value="8.4K"
            change="+12.8%"
            changeType="positive"
            icon={Users}
          />
          <MetricCard
            title="Kit (Email)"
            value="1,247"
            change="+5.1%"
            changeType="positive"
            icon={Mail}
          />
        </div>
      </section>

      {/* Tasks & Fitness */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Tasks & Fitness</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="ClickUp Tasks"
            value="47"
            change="12 completed"
            changeType="neutral"
            icon={CheckCircle2}
          />
          <MetricCard
            title="Calendar Events"
            value="8"
            change="This week"
            changeType="neutral"
            icon={Calendar}
          />
          <MetricCard
            title="Whoop Strain"
            value="14.2"
            change="+0.8"
            changeType="positive"
            icon={Heart}
          />
        </div>
      </section>
    </div>
  );
}