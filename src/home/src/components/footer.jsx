import '../css/footer.css'
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

				<div className="site-footer__bottom">
					<p>© 2026 Beyond Bound. All rights reserved. Made with care for your wellness.</p>
				</div>
			</div>
		</footer>
	)
}

export default Footer