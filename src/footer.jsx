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
	const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
	const [isPrivacyAccepted, setIsPrivacyAccepted] = useState(false);
	const [isEntityOpen, setIsEntityOpen] = useState(false);
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

	const openPrivacyPolicy = () => {
		setIsPrivacyOpen(true);
		setIsPrivacyAccepted(false);
	};

	return (
		<footer className="relative border-t border-slate-600/30 bg-[#122849] text-slate-300">
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
									onClick={openPrivacyPolicy}
									aria-expanded={isPrivacyOpen}
									aria-controls="footer-privacy-policy"
								>
									Privacy Policy
								</button>
							</li>
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

				<div className="absolute bottom-4 right-4 z-10 sm:bottom-6 sm:right-6">
					<button
						type="button"
						className="inline-flex items-center gap-2 rounded-full border border-slate-300/40 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-100 transition hover:border-slate-200/70 hover:bg-white/20"
						onClick={() => setIsEntityOpen((open) => !open)}
						aria-expanded={isEntityOpen}
						aria-controls="official-entity-card"
					>
						Official Entity
					</button>
				</div>

				{isEntityOpen ? (
					<div
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
						onClick={() => setIsEntityOpen(false)}
						role="presentation"
					>
						<section
							id="official-entity-card"
							className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 text-left font-['Times_New_Roman'] text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.25)]"
							role="dialog"
							aria-label="Official entity"
							onClick={(event) => event.stopPropagation()}
						>
							<div className="flex items-start justify-between gap-4">
								<div>
									<p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
										Company
									</p>
									<p className="mt-2 text-sm font-semibold text-slate-900">
										Ayurhelix pvt ltd
									</p>
								</div>
								<button
									type="button"
									className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
									onClick={() => setIsEntityOpen(false)}
									aria-label="Close official entity"
								>
									X
								</button>
							</div>
							<p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
								GST Number
							</p>
							<p className="mt-2 text-sm font-semibold text-slate-900">
								05ABDCA5612K1ZU
							</p>
						</section>
					</div>
				) : null}

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
								We offer secure and convenient payment options through our payment partner PayU.
								Customers can complete transactions using:
							</p>
								<ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-600 sm:text-base">
								<li>UPI (Google Pay, Paytm, BHIM, etc.)</li>
								<li>Debit Cards / Credit Cards (Visa, MasterCard, RuPay)</li>
								<li>Net Banking</li>
								<li>Wallets (subject to PayU availability)</li>
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

				{isPrivacyOpen ? (
					<div
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
						onClick={() => setIsPrivacyOpen(false)}
						role="presentation"
					>
						<section
							id="footer-privacy-policy"
							className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.28)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
							aria-label="Privacy policy"
							onClick={(event) => event.stopPropagation()}
						>
							<div className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 px-5 py-4 backdrop-blur sm:px-6 lg:px-8">
								<div className="flex items-center justify-between gap-3">
									<h4 className="text-base font-semibold text-slate-900 sm:text-lg">
										Terms, Privacy, and Policies
									</h4>
									<button
										type="button"
										className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
										onClick={() => setIsPrivacyOpen(false)}
										aria-label="Close privacy policy"
									>
										X
									</button>
								</div>
							</div>
							<div className="px-5 pb-6 pt-4 sm:px-6 lg:px-8">
								<p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400 sm:text-sm">
									Effective Date: {policyDate}
								</p>

								<section className="mt-4" aria-labelledby="terms-conditions">
									<h5 id="terms-conditions" className="text-sm font-semibold text-slate-800 sm:text-base">
										Terms and Conditions
									</h5>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										Welcome to BeyondBound. These Terms and Conditions outline the rules and regulations for the
										use of BeyondBound's website. By accessing this website, we assume you accept these terms and
										conditions in full. Do not continue to use BeyondBound's website if you do not accept all of the
										terms and conditions stated on this page. This website is managed by AYURHELIX PRIVATE LIMITED.
									</p>
								</section>

								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h6 className="text-sm font-semibold text-slate-800 sm:text-base">1. Intellectual Property Rights</h6>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										Unless otherwise stated, BeyondBound and/or its licensors own the intellectual property rights
										for all material on this website. All intellectual property rights are reserved. You may view
										and/or print pages from https://www.beyondbound.info/ for your own personal use subject to
										restrictions set in these terms and conditions.
									</p>
									<p className="mt-2 text-sm font-semibold text-slate-700 sm:text-base">You must not:</p>
									<ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-600 sm:text-base">
										<li>Republish material from this website.</li>
										<li>Sell, rent, or sub-license material from the website.</li>
										<li>Reproduce, duplicate, or copy material from the website.</li>
										<li>Redistribute content from BeyondBound (unless content is specifically made for redistribution).</li>
									</ul>
								</div>

								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h6 className="text-sm font-semibold text-slate-800 sm:text-base">2. User Content</h6>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										In these Terms and Conditions, "Your Content" shall mean any audio, video, text, images, or
										other material you choose to display on this website. By displaying Your Content, you grant
										BeyondBound a non-exclusive, worldwide, irrevocable, royalty-free license to use, reproduce,
										adapt, publish, translate, and distribute it in any and all media.
									</p>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										Your Content must be your own and must not be infringing on any third party's rights. BeyondBound
										reserves the right to remove any of Your Content from this website at any time, and for any reason,
										without notice.
									</p>
								</div>

								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h6 className="text-sm font-semibold text-slate-800 sm:text-base">3. Privacy Policy</h6>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										Please refer to our Privacy Policy below for information on how we collect, use, and disclose
										information from our users. Your use of the website signifies your acknowledgment of and agreement
										to our Privacy Policy.
									</p>
								</div>

								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h6 className="text-sm font-semibold text-slate-800 sm:text-base">4. Limitation of Liability</h6>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										In no event shall BeyondBound, nor any of its officers, directors, and employees, be liable to you
										for anything arising out of or in any way connected with your use of this website, whether such
										liability is under contract, tort, or otherwise. BeyondBound, including its officers, directors,
										and employees, shall not be liable for any indirect, consequential, or special liability arising
										out of or in any way related to your use of this website.
									</p>
								</div>

								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h6 className="text-sm font-semibold text-slate-800 sm:text-base">5. Indemnification</h6>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										You hereby indemnify to the fullest extent BeyondBound from and against any and all liabilities,
										costs, demands, causes of action, damages, and expenses (including reasonable attorney's fees)
										arising out of or in any way related to your breach of any of the provisions of these Terms.
									</p>
								</div>

								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h6 className="text-sm font-semibold text-slate-800 sm:text-base">6. Severability</h6>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										If any provision of these Terms is found to be unenforceable or invalid under any applicable law,
										such unenforceability or invalidity shall not render these Terms unenforceable or invalid as a
										whole, and such provisions shall be deleted without affecting the remaining provisions herein.
									</p>
								</div>

								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h6 className="text-sm font-semibold text-slate-800 sm:text-base">7. Variation of Terms</h6>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										BeyondBound is permitted to revise these Terms at any time as it sees fit, and by using this
										website you are expected to review such Terms on a regular basis to ensure you understand all
										terms and conditions governing the use of this website.
									</p>
								</div>

								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h6 className="text-sm font-semibold text-slate-800 sm:text-base">8. Governing Law &amp; Jurisdiction</h6>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										These Terms will be governed by and construed in accordance with the laws of the jurisdiction in
										which BeyondBound operates, and you submit to the non-exclusive jurisdiction of India.
									</p>
								</div>

								<section className="mt-6 border-t border-slate-200/80 pt-4" aria-labelledby="privacy-policy">
									<h5 id="privacy-policy" className="text-sm font-semibold text-slate-800 sm:text-base">
										Privacy Policy
									</h5>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										At BeyondBound, accessible from https://www.beyondbound.info/, one of our main priorities is the
										privacy of our visitors. This Privacy Policy document contains types of information that is
										collected and recorded by BeyondBound and how we use it.
									</p>
								</section>

								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h6 className="text-sm font-semibold text-slate-800 sm:text-base">1. Information We Collect</h6>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										The personal information that you are asked to provide, and the reasons why you are asked to
										provide it, will be made clear to you at the point we ask you to provide your personal information.
									</p>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										Direct Information: If you contact us directly via our email (official@beyondbound.info), we may
										receive additional information about you such as your name, email address, phone number, the
										contents of the message and/or attachments you may send us, and any other information you may
										choose to provide.
									</p>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										Account Information: If you register for an account, we may ask for your contact information,
										including items such as name, company name, address, email address, and telephone number.
									</p>
								</div>

								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h6 className="text-sm font-semibold text-slate-800 sm:text-base">2. How We Use Your Information</h6>
									<ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-600 sm:text-base">
										<li>Provide, operate, and maintain our website.</li>
										<li>Improve, personalize, and expand our website.</li>
										<li>Understand and analyze how you use our website.</li>
										<li>Develop new products, services, features, and functionality.</li>
										<li>
											Communicate with you, either directly or through one of our partners, including for customer
											service, to provide you with updates and other information relating to the website, and for
											marketing and promotional purposes.
										</li>
										<li>Send you emails.</li>
										<li>Find and prevent fraud.</li>
									</ul>
								</div>

								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h6 className="text-sm font-semibold text-slate-800 sm:text-base">3. Log Files</h6>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										BeyondBound follows a standard procedure of using log files. These files log visitors when they
										visit websites. The information collected by log files includes internet protocol (IP) addresses,
										browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and
										possibly the number of clicks. These are not linked to any information that is personally
										identifiable.
									</p>
								</div>

								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h6 className="text-sm font-semibold text-slate-800 sm:text-base">4. Cookies and Web Beacons</h6>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										Like any other website, BeyondBound uses "cookies". These cookies are used to store information
										including visitors' preferences, and the pages on the website that the visitor accessed or visited.
										The information is used to optimize the users' experience by customizing our web page content
										based on visitors' browser type and/or other information.
									</p>
								</div>

								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h6 className="text-sm font-semibold text-slate-800 sm:text-base">5. Third-Party Privacy Policies</h6>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										BeyondBound's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising
										you to consult the respective Privacy Policies of these third-party ad servers for more detailed
										information. It may include their practices and instructions about how to opt-out of certain options.
									</p>
								</div>

								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h6 className="text-sm font-semibold text-slate-800 sm:text-base">6. GDPR Data Protection Rights (For EU Users)</h6>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										We would like to make sure you are fully aware of all of your data protection rights. Every user is
										entitled to the following:
									</p>
									<ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-600 sm:text-base">
										<li>The right to access - You have the right to request copies of your personal data.</li>
										<li>The right to rectification - You have the right to request that we correct any information you believe is inaccurate.</li>
										<li>The right to erasure - You have the right to request that we erase your personal data, under certain conditions.</li>
										<li>The right to restrict processing - You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
									</ul>
								</div>

								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h6 className="text-sm font-semibold text-slate-800 sm:text-base">7. Children's Information</h6>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										Another part of our priority is adding protection for children while using the internet. We
										encourage parents and guardians to observe, participate in, and/or monitor and guide their online
										activity. BeyondBound does not knowingly collect any Personal Identifiable Information from children
										under the age of 13.
									</p>
								</div>

								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h6 className="text-sm font-semibold text-slate-800 sm:text-base">8. Consent</h6>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										By using our website, you hereby consent to our Privacy Policy and agree to its terms.
									</p>
								</div>

								<div className="mt-6 border-t border-slate-200/80 pt-4">
									<h6 className="text-sm font-semibold text-slate-800 sm:text-base">Shipping Policy</h6>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										All orders will be delivered within 5-7 business days.
									</p>
								</div>

								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h6 className="text-sm font-semibold text-slate-800 sm:text-base">Refund Policy</h6>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										We do not provide any kind of refund due to the nature of business.
									</p>
								</div>

								<div className="mt-5 border-t border-slate-200/80 pt-4">
									<h6 className="text-sm font-semibold text-slate-800 sm:text-base">Contact Us</h6>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										If you have additional questions or require more information about our Privacy Policy, do not
										hesitate to contact us at:
									</p>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
										Email: official@beyondbound.info
									</p>
								</div>

								<div className="mt-6 border-t border-slate-200/80 pt-4">
									<label className="flex items-start gap-3 text-sm text-slate-600 sm:text-base">
										<input
											type="checkbox"
											className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900"
											checked={isPrivacyAccepted}
											onChange={(event) => setIsPrivacyAccepted(event.target.checked)}
										/>
										<span>
											I have read and accept the Terms and Conditions and Privacy Policy.
										</span>
									</label>
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
