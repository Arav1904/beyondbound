import { useState } from 'react'
import '../css/faq.css'

const faqs = [
	{
		question: 'Is this for diabetics?',
		answer:
			'Beyond Bound is designed for metabolic wellness support and early intervention in those with prediabetic markers or insulin resistance. It is not intended to replace diabetes medication. If you have diagnosed diabetes or take glucose-lowering medication, consult your physician before use.',
	},
	{
		question: 'Can I take this with my current medication?',
		answer:
			'While our formulas use natural botanical ingredients, we recommend consulting your healthcare provider before combining with any prescription medication, especially blood-thinners or hormone therapies.',
	},
	{
		question: 'How long before I see results?',
		answer:
			'Most users report noticeable changes within 4–6 weeks of consistent use. Optimal results are typically observed after 90 days when used alongside a balanced diet and regular activity.',
	},
	{
		question: 'Is this safe for long-term use?',
		answer:
			'Yes. All ingredients are clinically studied for long-term safety. Our products are free from synthetic additives, heavy metals, and banned substances, and are manufactured in GMP-certified facilities.',
	},
	{
		question: 'Is this AYUSH compliant?',
		answer:
			'Yes. Beyond Bound products comply with AYUSH guidelines and are manufactured under strict quality standards with full traceability of botanical sourcing.',
	},
]

function FAQ() {
	const [openIndices, setOpenIndices] = useState(new Set([0]))

	const toggle = (i) => {
		setOpenIndices((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(i)) {
				newSet.delete(i)
			} else {
				newSet.add(i)
			}
			return newSet
		})
	}

	return (
		<section className="faq-section">
			<div className="faq-inner">
				<div className="faq-header">
					<h2 className="faq-title">Frequently asked questions</h2>
					<p className="faq-subtitle">Everything you need to know about Beyond Bound</p>
				</div>

				<div className="faq-list">
					{faqs.map((faq, i) => (
						<div
							key={faq.question}
							className={`faq-item${openIndices.has(i) ? ' faq-item--open' : ''}`}
						>
							<button
								type="button"
								className="faq-question"
								onClick={() => toggle(i)}
								aria-expanded={openIndices.has(i)}
							>
								{faq.question}
								<i className="fa-solid fa-chevron-down faq-icon" aria-hidden="true" />
							</button>
							<div className="faq-answer-container">
								<p className="faq-answer">{faq.answer}</p>
							</div>
						</div>
					))}
				</div>

				<div className="faq-footer">
					<i className="fa-regular fa-comment faq-footer-icon" aria-hidden="true" />
					<p className="faq-footer-text">Still have questions?</p>
					<button type="button" className="faq-footer-btn">Contact expert</button>
				</div>
			</div>
		</section>
	)
}

export default FAQ

