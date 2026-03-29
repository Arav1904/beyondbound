
import './trust.css'
import whoGmp from '../home/1 (1) 1.png'
import iso from '../home/iso 1.png'
import qualityBadge from '../home/Gemini_Generated_Image_iwrg9hiwrg9hiwrg (1) (14) 1.png'
import haccp from '../home/haccp 1.png'
import gmo from '../home/gmo 1.png'

const certifications = [
	{
		id: 'who-gmp',
		imageSrc: whoGmp,
		imageAlt: 'WHO-GMP certification',
		className: 'trust-icon--who',
	},
	{
		id: 'iso',
		imageSrc: iso,
		imageAlt: 'ISO certification',
		className: 'trust-icon--iso',
	},
	{
		id: 'quality-assured',
		imageSrc: qualityBadge,
		imageAlt: 'Premium quality certification badge',
		className: 'trust-icon--quality',
	},
	{
		id: 'haccp',
		imageSrc: haccp,
		imageAlt: 'HACCP certification',
		className: 'trust-icon--haccp',
	},
	{
		id: 'non-gmo',
		imageSrc: gmo,
		imageAlt: 'Non-GMO certified',
		className: 'trust-icon--gmo',
	},
]

function TrustStandards() {
	return (
		<section className="trust-section" aria-labelledby="trust-title">
			
				<div className="trust-grid" role="list">
					{certifications.map((cert) => (
						<div key={cert.id} className="trust-card" role="listitem">
							<img
								src={cert.imageSrc}
								alt={cert.imageAlt}
								className={`trust-icon ${cert.className}`}
								loading="lazy"
								decoding="async"
							/>
						</div>
					))}
				</div>
	
		</section>
	)
}

export default TrustStandards

