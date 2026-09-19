import React, { useState } from 'react';
import { BotStatus } from '../../types.js';
import { LandingNavbar } from './LandingNavbar.js';
import { LandingHero } from './LandingHero.js';
import { InteractiveShowcase } from './InteractiveShowcase.js';
import { BentoFeatures } from './BentoFeatures.js';
import { LandingCommands } from './LandingCommands.js';
import { LiveStatusSection } from './LiveStatusSection.js';
import { PricingSection } from './PricingSection.js';
import { FAQSection } from './FAQSection.js';
import { LandingCta } from './LandingCta.js';
import { LandingFooter } from './LandingFooter.js';
import { InviteModal } from './InviteModal.js';
import { LegalModal } from './LegalModal.js';
import { ScrollControls } from './ScrollControls.js';

interface LandingPageProps {
  status: BotStatus | null;
  onOpenDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  status,
  onOpenDashboard,
}) => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'terms' | 'privacy'>('terms');

  const handleOpenLegal = (tab: 'terms' | 'privacy') => {
    setLegalTab(tab);
    setLegalModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Scroll Controls (Progress indicator bar & floating back-to-top button) */}
      <ScrollControls />

      {/* Navigation */}
      <LandingNavbar
        status={status}
        onOpenDashboard={onOpenDashboard}
        onOpenInvite={() => setInviteModalOpen(true)}
      />

      {/* Hero Section */}
      <LandingHero
        status={status}
        onOpenInvite={() => setInviteModalOpen(true)}
        onOpenDashboard={onOpenDashboard}
      />

      {/* Interactive Showcase (Moderation Console, Anti-Nuke Simulator, Rank Card Builder) */}
      <InteractiveShowcase
        onOpenDashboard={onOpenDashboard}
      />

      {/* Bento Grid Feature Overview */}
      <BentoFeatures
        onOpenDashboard={onOpenDashboard}
        onOpenInvite={() => setInviteModalOpen(true)}
      />

      {/* Commands Suite */}
      <LandingCommands />

      {/* Live Cluster Status & Telemetry */}
      <LiveStatusSection status={status} />

      {/* Transparent Perks & Tiers */}
      <PricingSection onOpenInvite={() => setInviteModalOpen(true)} />

      {/* Frequently Asked Questions */}
      <FAQSection />

      {/* High-Impact CTA Banner */}
      <LandingCta
        onOpenInvite={() => setInviteModalOpen(true)}
        onOpenDashboard={onOpenDashboard}
      />

      {/* Footer */}
      <LandingFooter
        status={status}
        onOpenDashboard={onOpenDashboard}
        onOpenInvite={() => setInviteModalOpen(true)}
        onOpenLegal={handleOpenLegal}
      />

      {/* Interactive Discord Invite Modal */}
      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        clientId={status?.id || '1550746964151242793'}
      />

      {/* Terms & Privacy Compliance Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        initialTab={legalTab}
        onClose={() => setLegalModalOpen(false)}
      />
    </div>
  );
};
