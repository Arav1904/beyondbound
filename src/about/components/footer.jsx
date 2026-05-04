import '../css/footer.css'
import useMenuStore from '../../useMenuStore'

const quickLinks = [
	{ label: 'Home', page: 'home' },
	{ label: 'About Us', page: 'about' },
	{ label: 'Products', page: 'products' },
	{ label: 'Science', page: 'science' },
	{ label: 'FAQ', page: 'home', scrollId: 'faq' },
]
const supportLinks = [
	{ label: 'Contact', page: 'contact' },
	
]

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
						<h3 className="site-footer__brand">BEYOND BOUND<sup>®</sup></h3>
						<p className="site-footer__text">
							Premium Ayurvedic supplements crafted with science-backed ingredients for your wellness journey.
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
										onClick={
											link.page
												? (event) => handleInternalNav(event, link.page)
												: undefined
										}
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
								<i className="fa-brands fa-facebook-f" aria-hidden="true" />
							</a>
							<a
								href="https://www.instagram.com/beyondbound_/"
								className="site-footer__social"
								aria-label="Instagram"
							>
								<i className="fa-brands fa-instagram" aria-hidden="true" />
							</a>
							<a
								href="https://x.com/"
								className="site-footer__social"
								aria-label="X"
							>
								<i className="fa-brands fa-x-twitter" aria-hidden="true" />
							</a>
							<a
								href="https://www.linkedin.com/company/beyond-bound/"
								className="site-footer__social"
								aria-label="LinkedIn"
							>
								<i className="fa-brands fa-linkedin-in" aria-hidden="true" />
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
