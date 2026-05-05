import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faFacebookF,
	faInstagram,
	faXTwitter,
	faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";
import useMenuStore from "./useMenuStore";

const quickLinks = [
	{ label: "Home", page: "home" },
	{ label: "About Us", page: "about" },
	{ label: "Products", page: "products" },
	{ label: "Science", page: "science" },
	{ label: "FAQ", page: "home", scrollId: "faq" },
];
const supportLinks = [
	{ label: "Contact", page: "contact" },
];

function Footer() {
	const setActivePage = useMenuStore((state) => state.setActivePage);
	const [isPolicyOpen, setIsPolicyOpen] = useState(false);
	const policyDate = useMemo(
		() =>
			new Date().toLocaleDateString("en-IN", {
				year: "numeric",
				month: "long",
				day: "numeric",
			}),
		[]
	);

	const handleInternalNav = (event, page, scrollId) => {
		event.preventDefault();

		if (page) {
			setActivePage(page);
		}

		window.requestAnimationFrame(() => {
			if (scrollId) {
				const target = document.getElementById(scrollId);
				if (target) {
					target.scrollIntoView({ behavior: "smooth", block: "start" });
					return;
				}
			}

			window.scrollTo({ top: 0, behavior: "smooth" });
		});
	};

	return (
		<footer className="border-t border-slate-600/30 bg-[#122849] text-slate-300">
			<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
				<div className="grid grid-cols-2 gap-8 md:grid-cols-2 xl:grid-cols-[1.25fr_1fr_1fr_1.15fr]">
					<div className="col-span-2 xl:col-span-1">
						<h3 className="text-lg font-semibold tracking-tight text-slate-100">
							BEYOND BOUND
							<sup className="relative -top-2 ml-1 text-[10px] font-medium">®</sup>
						</h3>
						<p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
							Premium Ayurvedic supplements crafted with science-backed
							ingredients for your wellness journey.
						</p>
					</div>

					<div>
						<h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-100">
							Quick Links
						</h4>
						<ul className="mt-4 space-y-2.5">
							{quickLinks.map((link) => (
								<li key={link.label}>
									<a
										href={link.scrollId ? `#${link.scrollId}` : "#"}
										onClick={(event) =>
											handleInternalNav(event, link.page, link.scrollId)
										}
										className="text-sm text-slate-400 transition hover:text-slate-100"
									>
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-100">
							Support
						</h4>
						<ul className="mt-4 space-y-2.5">
							{supportLinks.map((link) => (
								<li key={link.label}>
									<a
										href="#"
										onClick={
											link.page
												? (event) => handleInternalNav(event, link.page)
												: undefined
										}
										className="text-sm text-slate-400 transition hover:text-slate-100"
									>
										{link.label}
									</a>
								</li>
							))}
							<li>
								<button
									type="button"
									className="text-left text-sm text-slate-400 transition hover:text-slate-100"
									onClick={() => setIsPolicyOpen((open) => !open)}
									aria-expanded={isPolicyOpen}
									aria-controls="footer-payment-policy"
								>
									Payment Policy
								</button>
							</li>
						</ul>
					</div>

					  <div className="col-span-2 xl:col-span-1">
						<h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-100">
							Stay Connected
						</h4>
						<p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
							Subscribe to our newsletter for updates and exclusive offers.
						</p>

						<div className="mt-5 flex flex-wrap gap-2.5" aria-label="Social links">
							<a
								href="https://www.facebook.com/"
								className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-400/30 bg-white/5 text-sm text-slate-300 transition hover:border-slate-100/60 hover:bg-white/10 hover:text-slate-100"
								aria-label="Facebook"
							>
								<FontAwesomeIcon icon={faFacebookF} />
							</a>
							<a
								href="https://www.instagram.com/beyondbound_/"
								className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-400/30 bg-white/5 text-sm text-slate-300 transition hover:border-slate-100/60 hover:bg-white/10 hover:text-slate-100"
								aria-label="Instagram"
							>
								<FontAwesomeIcon icon={faInstagram} />
							</a>
							<a
								href="https://x.com/"
								className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-400/30 bg-white/5 text-sm text-slate-300 transition hover:border-slate-100/60 hover:bg-white/10 hover:text-slate-100"
								aria-label="X"
							>
								<FontAwesomeIcon icon={faXTwitter} />
							</a>
							<a
								href="https://www.linkedin.com/company/beyond-bound/"
								className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-400/30 bg-white/5 text-sm text-slate-300 transition hover:border-slate-100/60 hover:bg-white/10 hover:text-slate-100"
								aria-label="LinkedIn"
							>
								<FontAwesomeIcon icon={faLinkedinIn} />
							</a>
						</div>
					</div>
				</div>

				{isPolicyOpen ? (
					<div
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
						onClick={() => setIsPolicyOpen(false)}
						role="presentation"
					>
						<section
							id="footer-payment-policy"
							className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.28)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
							aria-label="Payment policy"
							onClick={(event) => event.stopPropagation()}
						>
							<div className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 px-5 py-4 backdrop-blur sm:px-6 lg:px-8">
								<div className="flex items-center justify-between gap-3">
									<h4 className="text-base font-semibold text-slate-900 sm:text-lg">
										Payment Policy - Beyond Bound
									</h4>
									<button
										type="button"
										className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
										onClick={() => setIsPolicyOpen(false)}
										aria-label="Close payment policy"
									>
									X
									</button>
								</div>
							</div>
							<div className="px-5 pb-6 pt-4 sm:px-6 lg:px-8">
								<p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400 sm:text-sm">
									Effective Date: {policyDate}
								</p>
								<p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
								Welcome to Beyond Bound. This Payment Policy outlines the terms and conditions related
								to payments made on our website (www.beyondbound.info). By placing an order, you agree
								to the terms mentioned below.
							</p>
								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h5 className="text-sm font-semibold text-slate-800 sm:text-base">1. Accepted Payment Methods</h5>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
								We offer secure and convenient payment options through our payment partner PhonePe.
								Customers can complete transactions using:
							</p>
								<ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-600 sm:text-base">
								<li>UPI (Google Pay, PhonePe, Paytm, BHIM, etc.)</li>
								<li>Debit Cards / Credit Cards (Visa, MasterCard, RuPay)</li>
								<li>Net Banking</li>
								<li>Wallets (if available via PhonePe)</li>
							</ul>
								</div>
								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h5 className="text-sm font-semibold text-slate-800 sm:text-base">2. Payment Security</h5>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
								All transactions are processed through secure and encrypted payment gateways. Beyond Bound
								does not store any card or payment details on its servers. Payments are handled by trusted
								third-party providers to ensure safety and compliance.
							</p>
								</div>
								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h5 className="text-sm font-semibold text-slate-800 sm:text-base">3. Order Confirmation</h5>
									<ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-600 sm:text-base">
								<li>Once the payment is successfully completed, you will receive an order confirmation via SMS/email.</li>
								<li>
									If payment fails but the amount is debited, it is usually reversed automatically within 5-7
									working days by your bank or payment provider.
								</li>
							</ul>
								</div>
								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h5 className="text-sm font-semibold text-slate-800 sm:text-base">4. Pricing &amp; Taxes</h5>
									<ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-600 sm:text-base">
								<li>All prices listed on the website are in INR (Rs.) and inclusive/exclusive of applicable taxes (GST), as mentioned.</li>
								<li>Beyond Bound reserves the right to update pricing at any time without prior notice.</li>
							</ul>
								</div>
								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h5 className="text-sm font-semibold text-slate-800 sm:text-base">5. Failed or Pending Transactions</h5>
									<ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-600 sm:text-base">
								<li>If your payment is unsuccessful, please retry after checking your balance or payment method.</li>
								<li>In case of double payment or technical errors, please contact our support team with transaction details.</li>
							</ul>
								</div>
								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h5 className="text-sm font-semibold text-slate-800 sm:text-base">6. Refund Policy</h5>
									<ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-600 sm:text-base">
								<li>Refunds (if applicable) will be processed to the original payment method within 7-10 working days after approval.</li>
								<li>Refund eligibility depends on our Return &amp; Cancellation Policy.</li>
							</ul>
								</div>
								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h5 className="text-sm font-semibold text-slate-800 sm:text-base">7. Cancellation Policy</h5>
									<ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-600 sm:text-base">
								<li>Orders can be cancelled before dispatch.</li>
								<li>Once the order is shipped, cancellation may not be possible.</li>
							</ul>
								</div>
								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h5 className="text-sm font-semibold text-slate-800 sm:text-base">8. Fraudulent Transactions</h5>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
								Beyond Bound reserves the right to cancel any order if fraud or unauthorized activity is suspected.
								Necessary legal action may be taken in such cases.
							</p>
								</div>
								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h5 className="text-sm font-semibold text-slate-800 sm:text-base">9. Contact Information</h5>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
								For any payment-related queries, please contact:
							</p>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
								Beyond Bound Support Team<br />
								Email: beyondbound889@gmail.com<br />
								Phone: +91 6396190643
							</p>
								<p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
								Note: By making a payment on our website, you agree to abide by this Payment Policy.
							</p>
								</div>
							</div>
						</section>
					</div>
				) : null}

				<div className="mt-8 border-t border-slate-500/25 pt-5 text-center sm:mt-10">
					<p className="text-xs text-slate-400 sm:text-sm">
						© 2026 Beyond Bound. All rights reserved. Made with care for your
						wellness.
					</p>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
