interface WelcomeGateProps {
	label: string;
	onStart: () => void;
}

/* The first-visit screen: the scene stands still behind a single button. The click
   on that button is the user gesture browsers insist on before any audio may play,
   which is the whole reason the scene waits here instead of starting on its own —
   it lets the animation and the music begin together rather than the music failing
   silently. */
export function WelcomeGate({ label, onStart }: WelcomeGateProps) {
	return (
		<div className='welcome-gate'>
			<button className='welcome-button' type='button' onClick={onStart}>
				{label}
			</button>
		</div>
	);
}
