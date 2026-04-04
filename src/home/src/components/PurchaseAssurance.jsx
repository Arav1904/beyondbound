import '../css/purchaseAssurance.css'
import iconStar from '../../Icon (9).png'
import iconPromise from '../../Icon (2).png'
import iconShipping from '../../Icon (3).png'
import iconShield from '../../Icon (4).png'

const assurances = [
	{
		id: 'rating',
		title: '4.8/5 Rating',
		subtitle: '10,000+ Customers',
		iconSrc: iconStar,
		iconAlt: 'Star rating icon',
	},
	{
		id: 'checkout',
		title: 'Secure Pre-order',
		subtitle: '256-bit SSL Protected',
		iconSrc: iconShield,
		iconAlt: 'Secure pre-order icon',
	},
	{
		id: 'shipping',
		title: 'Fast Shipping',
		subtitle: 'Delivered in 3-5 Days',
		iconSrc: iconShipping,
		iconAlt: 'Fast shipping icon',
	},
	{
		id: 'promise',
		title: '30-Day Promise',
		subtitle: 'Full Satisfaction Guarantee',
		iconSrc: iconPromise,
		iconAlt: '30-day promise icon',
	},
]

function PurchaseAssurance() {
	return (
		<section className="pas-section" aria-label="Customer assurance highlights">
			<div className="pas-container" role="list">
				{assurances.map((item) => (
					<div key={item.id} className="pas-item" role="listitem">
						<div className="pas-icon-wrap">
							<img src={item.iconSrc} alt={item.iconAlt} className="pas-icon-image" loading="lazy" decoding="async" />
						</div>
						<div className="pas-copy">
							<p className="pas-title">{item.title}</p>
							<p className="pas-subtitle">{item.subtitle}</p>
						</div>
					</div>
				))}
			</div>
		</section>
	)
}

export default PurchaseAssurance
