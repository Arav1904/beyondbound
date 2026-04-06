import '../css/meetGlycomicsShowcase.css'
import productShowcaseImage from '../../bottles.png'

const ingredients = [
	'Karela',
	'Berberine',
	'Gurmar',
	'Vijaysar',
	'Jambu seeds',
	'Haridra',
	'Amakali',
]

const loopIngredients = [...ingredients, ingredients[0]]

function MeetGlycomicsShowcase() {
	return (
		<section className="mgs-section" aria-labelledby="mgs-title">
			<div className="mgs-frame">
				<div className="mgs-title-wrap">
					<h2 id="mgs-title" className="mgs-title">Meet Glycomics</h2>
				</div>

				<div className="mgs-content">
					<div className="mgs-left">
						<div className="mgs-copy">
							<h3 className="mgs-heading">
								We use all natural products
							</h3>

							<div
								className="w-full max-w-[420px] h-7 overflow-hidden relative"
								aria-label="Ingredients"
							>
								<div className="flex flex-col gap-2 animate-scrollUp" aria-hidden="true">
									{loopIngredients.map((ingredient, index) => (
										<p 
											key={`${ingredient}-${index}`} 
											className="m-0 pl-2 w-full h-7 font-['Bree_Serif'] font-normal text-2xl leading-7 text-zinc-600 whitespace-nowrap flex items-center justify-start"
										>
											{ingredient}
										</p>
									))}
								</div>
							</div>

							<div className="mgs-paragraph-group">
								<p className="mgs-paragraph mgs-paragraph--primary">
									Glycomics is a <strong>clinically-informed Ayurvedic formulation</strong>
									  <br />designed to support healthy glucose metabolism in adults.
								</p>
								<p className="mgs-paragraph mgs-paragraph--secondary">
									It combines standardized botanical extracts with modern analytical
									validation to ensure consistency, purity, and responsible daily support.
								</p>
							</div>
						</div>
					</div>

					<div className="mgs-right">
						<img
							src={productShowcaseImage}
							alt="Glycomics bottle product showcase"
							className="mgs-image"
							loading="lazy"
							decoding="async"
						/>
					</div>
				</div>
			</div>
		</section>
	)
}

export default MeetGlycomicsShowcase