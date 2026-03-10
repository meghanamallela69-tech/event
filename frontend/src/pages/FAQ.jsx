import { useState } from "react";

export default function FAQ() {
  const [open, setOpen] = useState(null);
  const items = [
    { q: "How do I book an event?", a: "Create an account or login, browse events or services, and click Book Now to complete your booking." },
    { q: "How can merchants create events?", a: "Merchants access the Merchant Dashboard to create, edit, and manage events, bookings, and payments." },
    { q: "How does payment work?", a: "Payments are processed securely. You’ll receive confirmations and invoices in your dashboard and via email." },
    { q: "Can I cancel a booking?", a: "Yes. Cancellation policies vary by event or vendor. Check the event page or contact support for assistance." },
  ];
  const toggle = (i) => setOpen(open === i ? null : i);
  return (
    <>
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-200 px-8 py-12 text-center">
            <h1 className="text-3xl md:text-5xl font-semibold text-gray-900">Frequently Asked Questions</h1>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Find quick answers to common questions about booking, vendors, payments, and more.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-4">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={it.q} className="rounded-2xl bg-white ring-1 ring-gray-200 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                >
                  <span className="font-medium text-gray-900">{it.q}</span>
                  <span className="ml-3 inline-flex h-6 w-6 items-center justify-center rounded-md bg-gray-100 text-gray-600">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                <div
                  id={`faq-panel-${i}`}
                  className="px-5 overflow-hidden transition-all duration-300"
                  style={{ maxHeight: isOpen ? 200 : 0 }}
                >
                  <div className="pb-5 text-gray-700">{it.a}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
