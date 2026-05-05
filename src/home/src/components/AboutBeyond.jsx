import '../css/aboutBeyond.css'
import aboutImage from '../../imglogo.jpeg'
import useMenuStore from '../../../useMenuStore'

function AboutBeyond() {
	const setActivePage = useMenuStore((state) => state.setActivePage)

	const handleLearnMore = () => {
		setActivePage('science')
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	return (
		<section className="about-section" aria-labelledby="about-beyond-title">
			<div className="about-solution">
				<div className="about-image-wrap">
					<img
						src={aboutImage}
						alt="Beyond Bound emblem with natural wood background"
						className="about-main-image"
						loading="lazy"
						decoding="async"
					/>
				</div>

				<div className="about-right-frame">
					<div className="about-copy-stack">
						<div className="about-pill">
						<span className="about-pill-text">100% Natural</span>
					</div>

						<div className="about-text-block">
							<h2 id="about-beyond-title" className="about-title">About Beyond Bound</h2>
							<p className="about-description">
								Beyond Bound is formulated with premium Ayurvedic herbs, carefully selected for
								their ability to support your body&apos;s natural balance. Each ingredient is sourced
								from trusted suppliers and undergoes rigorous quality testing.
							</p>
						</div>

						<button type="button" className="about-learn-btn" onClick={handleLearnMore}>
							Learn more →
						</button>
					</div>
				</div>
			</div>
		</section>
	)
}

export default AboutBeyond