import { useCallback, useEffect, useRef, useState } from 'react'

const GOOGLE_GSI_SCRIPT = 'https://accounts.google.com/gsi/client'

function decodeCredential(credential) {
	try {
		const payload = credential.split('.')[1]
		if (!payload) {
			return null
		}

		const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
		const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
		const json = atob(padded)
		const normalized = decodeURIComponent(
			json
				.split('')
				.map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
				.join(''),
		)

		return JSON.parse(normalized)
	} catch {
		return null
	}
}

function GoogleSignIn({
	onUserChange,
	initialUser = null,
	className = '',
	buttonOptions = {},
}) {
	const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
	const buttonRef = useRef(null)
	const [localUser, setLocalUser] = useState(null)
	const user = initialUser ?? localUser
	const buttonTheme = buttonOptions.theme ?? 'outline'
	const buttonSize = buttonOptions.size ?? 'large'
	const buttonShape = buttonOptions.shape ?? 'pill'
	const buttonText = buttonOptions.text ?? 'signin_with'
	const buttonWidth = buttonOptions.width

	const handleCredentialResponse = useCallback(
		(response) => {
			if (!response?.credential) {
				return
			}

			const claims = decodeCredential(response.credential)
			const nextUser = {
				name: claims?.name ?? 'Google User',
				email: claims?.email ?? '',
				picture: claims?.picture ?? '',
				credential: response.credential,
			}

			setLocalUser(nextUser)
			onUserChange?.(nextUser)
		},
		[onUserChange],
	)

	useEffect(() => {
		if (!clientId || !buttonRef.current) {
			return undefined
		}

		let isCancelled = false

		const initializeButton = () => {
			if (isCancelled || !window.google?.accounts?.id || !buttonRef.current) {
				return
			}

			const containerWidth = Math.floor(buttonRef.current.getBoundingClientRect().width)
			const resolvedWidth =
				typeof buttonWidth === 'number'
					? buttonWidth
					: Math.max(200, Math.min(380, containerWidth || 320))

			window.google.accounts.id.initialize({
				client_id: clientId,
				callback: handleCredentialResponse,
			})

			buttonRef.current.innerHTML = ''
			window.google.accounts.id.renderButton(buttonRef.current, {
				theme: buttonTheme,
				size: buttonSize,
				shape: buttonShape,
				text: buttonText,
				width: resolvedWidth,
			})
		}

		if (window.google?.accounts?.id) {
			initializeButton()
			return () => {
				isCancelled = true
			}
		}

		const existingScript = document.querySelector(`script[src="${GOOGLE_GSI_SCRIPT}"]`)

		if (existingScript) {
			existingScript.addEventListener('load', initializeButton)
			return () => {
				isCancelled = true
				existingScript.removeEventListener('load', initializeButton)
			}
		}

		const script = document.createElement('script')
		script.src = GOOGLE_GSI_SCRIPT
		script.async = true
		script.defer = true
		script.onload = initializeButton
		document.head.appendChild(script)

		return () => {
			isCancelled = true
			script.onload = null
		}
	}, [
		buttonShape,
		buttonSize,
		buttonText,
		buttonTheme,
		buttonWidth,
		clientId,
		handleCredentialResponse,
	])

	const handleSignOut = () => {
		window.google?.accounts?.id?.disableAutoSelect?.()
		if (user?.email) {
			window.google?.accounts?.id?.revoke?.(user.email, () => {})
		}

		setLocalUser(null)
		onUserChange?.(null)
	}

	if (!clientId) {
		return (
			<p className="google-signin-missing">
				Set <code>VITE_GOOGLE_CLIENT_ID</code> in your <code>.env.local</code> to enable Google Sign-In.
			</p>
		)
	}

	if (user) {
		return (
			<div className="google-user-state">
				<div className="google-user-summary">
					{user.picture ? (
						<img src={user.picture} alt={user.name} className="google-user-avatar" referrerPolicy="no-referrer" />
					) : (
						<span className="google-user-avatar google-user-avatar--fallback" aria-hidden="true">
							{user.name?.slice(0, 1) ?? 'G'}
						</span>
					)}
					<div>
						<p className="google-user-name">{user.name}</p>
						{user.email ? <p className="google-user-email">{user.email}</p> : null}
					</div>
				</div>
				<button type="button" className="google-signout-btn" onClick={handleSignOut}>
					Sign out
				</button>
			</div>
		)
	}

	return <div ref={buttonRef} className={`google-signin-button ${className}`.trim()} />
}

export default GoogleSignIn
