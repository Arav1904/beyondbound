import '../css/footer.css'
import { useMemo, useState } from 'react'
import useMenuStore from '../../../useMenuStore'

const quickLinks = [
	{ label: 'Home', page: 'home' },
	{ label: 'About Us', page: 'about' },
	{ label: 'Products', page: 'products' },
	{ label: 'Science', page: 'science' },
	{ label: 'FAQ', page: 'home', scrollId: 'faq' },
]
const supportLinks = [{ label: 'Contact', page: 'contact' }]

function Footer() {
	const setActivePage = useMenuStore((state) => state.setActivePage)
	const [isPolicyOpen, setIsPolicyOpen] = useState(false)
	const policyDate = useMemo(
		() =>
			new Date().toLocaleDateString('en-IN', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			}),
		[]
	)

	const handleInternalNav = (event, page, scrollId) => {
		event.preventDefault()

		if (page) {
			setActivePage(page)
		}

		window.requestAnimationFrame(() => {
			if (scrollId) {
				const target = document.getElementById(scrollId)
				if (target) {
					target.scrollIntoView({ behavior: 'smooth', block: 'start' })
					return
				}
			}

			window.scrollTo({ top: 0, behavior: 'smooth' })
		})
	}

	return (
		<footer className="site-footer">
			<div className="site-footer__inner">
				<div className="site-footer__grid">
					<div className="site-footer__col">
						<h3 className="site-footer__brand">BEYOND BOUND<span className="site-footer__brand-mark">©</span></h3>
						<p className="site-footer__text">
							Formulated with scientific rigour. Rooted in Ayurvedic intelligence.
						</p>
					</div>

					<div className="site-footer__col">
						<h4 className="site-footer__title">Quick Links</h4>
						<ul className="site-footer__list">
							{quickLinks.map((link) => (
								<li key={link.label}>
									<a
										href={link.scrollId ? `#${link.scrollId}` : '#'}
										onClick={(event) => handleInternalNav(event, link.page, link.scrollId)}
										className="site-footer__link"
									>
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</div>

					<div className="site-footer__col">
						<h4 className="site-footer__title">Support</h4>
						<ul className="site-footer__list">
							{supportLinks.map((link) => (
								<li key={link.label}>
									<a
										href="#"
										onClick={(event) => handleInternalNav(event, link.page)}
										className="site-footer__link"
									>
										{link.label}
									</a>
								</li>
							))}
							<li>
								<button
									type="button"
									className="site-footer__link text-left hover:text-white/90"
									onClick={() => setIsPolicyOpen((open) => !open)}
									aria-expanded={isPolicyOpen}
									aria-controls="footer-payment-policy"
								>
									Payment Policy
								</button>
							</li>
						</ul>
					</div>

					<div className="site-footer__col">
						<h4 className="site-footer__title">Stay Connected</h4>
						<p className="site-footer__text">
							Subscribe to our newsletter for updates and exclusive offers.
						</p>
						<div className="site-footer__socials" aria-label="Social links">
							<a
								href="https://www.facebook.com/"
								className="site-footer__social"
								aria-label="Facebook"
							>
								<svg viewBox="0 0 24 24" className="site-footer__social-icon" aria-hidden="true">
									<path d="M13.5 22V13.8H16.3L16.7 10.6H13.5V8.6C13.5 7.68 13.76 7.05 15.08 7.05H16.8V4.18C16.5 4.14 15.47 4.05 14.27 4.05C11.76 4.05 10.05 5.58 10.05 8.39V10.6H7.25V13.8H10.05V22H13.5Z" fill="currentColor" />
								</svg>
							</a>
							<a
								href="https://www.instagram.com/beyondbound_/"
								className="site-footer__social"
								aria-label="Instagram"
							>
								<svg viewBox="0 0 24 24" className="site-footer__social-icon" aria-hidden="true">
									<rect x="4" y="4" width="16" height="16" rx="4" ry="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
									<circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
									<circle cx="17.1" cy="6.9" r="1" fill="currentColor" />
								</svg>
							</a>
							<a
								href="https://x.com/"
								className="site-footer__social"
								aria-label="X"
							>
								<svg viewBox="0 0 24 24" className="site-footer__social-icon" aria-hidden="true">
									<path d="M4 4H8.4L12 9.1L15.9 4H19.1L13.5 11.2L20 20H15.6L11.6 14.5L7.4 20H4.2L10.1 12.4L4 4Z" fill="currentColor" />
								</svg>
							</a>
							<a
								href="https://www.linkedin.com/company/beyond-bound/"
								className="site-footer__social"
								aria-label="LinkedIn"
							>
								<svg viewBox="0 0 24 24" className="site-footer__social-icon" aria-hidden="true">
									<path d="M6.5 8.5C7.6 8.5 8.5 7.6 8.5 6.5C8.5 5.4 7.6 4.5 6.5 4.5C5.4 4.5 4.5 5.4 4.5 6.5C4.5 7.6 5.4 8.5 6.5 8.5Z" fill="currentColor" />
									<path d="M5 10H8V19H5V10Z" fill="currentColor" />
									<path d="M10 10H12.8V11.3H12.84C13.23 10.56 14.18 9.8 15.6 9.8C18.55 9.8 19.1 11.73 19.1 14.24V19H16.1V14.8C16.1 13.8 16.08 12.52 14.7 12.52C13.3 12.52 13.08 13.62 13.08 14.72V19H10V10Z" fill="currentColor" />
								</svg>
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

				<div className="site-footer__bottom">
					<p>© 2026 Beyond Bound. All rights reserved. Made with care for your wellness.</p>
				</div>
			</div>
		</footer>
	)
}

export default Footer