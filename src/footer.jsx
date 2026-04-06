import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faFacebookF,
	faInstagram,
	faXTwitter,
	faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";

const quickLinks = ["About Us", "Products", "Science", "FAQ"];
const supportLinks = ["Contact", "Shipping", "Returns", "Privacy Policy"];

function Footer() {
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
								<li key={link}>
									<a
										href="#"
										className="text-sm text-slate-400 transition hover:text-slate-100"
									>
										{link}
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
								<li key={link}>
									<a
										href="#"
										className="text-sm text-slate-400 transition hover:text-slate-100"
									>
										{link}
									</a>
								</li>
							))}
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
								href="#"
								className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-400/30 bg-white/5 text-sm text-slate-300 transition hover:border-slate-100/60 hover:bg-white/10 hover:text-slate-100"
								aria-label="Facebook"
							>
								<FontAwesomeIcon icon={faFacebookF} />
							</a>
							<a
								href="#"
								className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-400/30 bg-white/5 text-sm text-slate-300 transition hover:border-slate-100/60 hover:bg-white/10 hover:text-slate-100"
								aria-label="Instagram"
							>
								<FontAwesomeIcon icon={faInstagram} />
							</a>
							<a
								href="#"
								className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-400/30 bg-white/5 text-sm text-slate-300 transition hover:border-slate-100/60 hover:bg-white/10 hover:text-slate-100"
								aria-label="X"
							>
								<FontAwesomeIcon icon={faXTwitter} />
							</a>
							<a
								href="#"
								className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-400/30 bg-white/5 text-sm text-slate-300 transition hover:border-slate-100/60 hover:bg-white/10 hover:text-slate-100"
								aria-label="LinkedIn"
							>
								<FontAwesomeIcon icon={faLinkedinIn} />
							</a>
						</div>
					</div>
				</div>

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
