import React from 'react';
import { ShieldCheck, FileText, ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';

interface LegalPageProps {
  type: 'privacy' | 'terms';
  onNavigate: (page: string) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type, onNavigate }) => {
  return (
    <div id="legal-page" className="min-h-screen bg-neutral-950 text-neutral-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="p-8 sm:p-12 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              {type === 'privacy' ? <Lock className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold font-serif text-white">
                {type === 'privacy' ? 'Privacy & Data Protection Policy' : 'Studio Terms & Booking Agreement'}
              </h1>
              <p className="text-xs text-amber-400 font-semibold">Ashish Wedding Film Studio • Jhumri Telaiya, Jharkhand</p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-neutral-300 leading-relaxed pt-4 border-t border-neutral-800">
            {type === 'terms' ? (
              <>
                <section className="space-y-2">
                  <h3 className="text-base font-bold text-white">1. Booking Confirmation & Advance Deposit</h3>
                  <p>
                    All event dates are locked on a first-come, first-served basis upon receipt of a minimum 30% advance deposit. The studio guarantees exclusive crew and equipment allotment once the booking receipt is issued.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-white">2. Delivery Timelines</h3>
                  <p>
                    Same-day / next-day teaser reels are delivered within 48 hours for social media sharing. Complete edited 4K master films and custom Karizma Velvet albums are delivered within 15–20 working days following final photo selection by the client.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-white">3. Cancellation & Rescheduling</h3>
                  <p>
                    In case of unforeseen event date changes due to weather or family circumstances, we permit one complimentary date transfer subject to crew availability on the revised date.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-white">4. Drone & Aerial Clearances</h3>
                  <p>
                    Aerial drone videography is executed by DGCA compliant operators and is subject to local weather conditions and no-fly zone restrictions.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-2">
                  <h3 className="text-base font-bold text-white">1. Secure Data Handling</h3>
                  <p>
                    At Ashish Wedding Film Studio, we respect your family's personal moments. All photographs, raw 4K videos, contact details, and payment transactions are stored securely with strict confidentiality.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-white">2. Media Rights & Client Privacy</h3>
                  <p>
                    We value client discretion. If a family requests private non-public archiving without website or social media exhibition, our studio respects and honors non-disclosure agreements unconditionally.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-white">3. Contact Inquiries</h3>
                  <p>
                    For questions regarding data removal, raw footage backup copies, or privacy inquiries, contact us directly at <strong>ashishweddingfilm@gmail.com</strong> or visit our studio in Gumo, Kharitand, Jhumri Telaiya, Jharkhand.
                  </p>
                </section>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
