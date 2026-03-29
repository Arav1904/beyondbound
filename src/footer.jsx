
import './footer.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebookF, faInstagram, faXTwitter, faLinkedinIn } from '@fortawesome/free-brands-svg-icons'

const quickLinks = ['About Us', 'Products', 'Science', 'FAQ']
const supportLinks = ['Contact', 'Shipping', 'Returns', 'Privacy Policy']

function Footer() {
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
								<li key={link}>
									<a href="#" className="site-footer__link">{link}</a>
								</li>
							))}
						</ul>
					</div>

					<div className="site-footer__col">
						<h4 className="site-footer__title">Support</h4>
						<ul className="site-footer__list">
							{supportLinks.map((link) => (
								<li key={link}>
									<a href="#" className="site-footer__link">{link}</a>
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
							<a href="#" className="site-footer__social" aria-label="Facebook">
								<FontAwesomeIcon icon={faFacebookF} />
							</a>
							<a href="#" className="site-footer__social" aria-label="Instagram">
								<FontAwesomeIcon icon={faInstagram} />
							</a>
							<a href="#" className="site-footer__social" aria-label="X">
								<FontAwesomeIcon icon={faXTwitter} />
							</a>
							<a href="#" className="site-footer__social" aria-label="LinkedIn">
								<FontAwesomeIcon icon={faLinkedinIn} />
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
