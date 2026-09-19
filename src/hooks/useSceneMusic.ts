import { useCallback, useEffect, useRef } from "react";

/* The tune that plays while the form is minimized and the scene has the stage.
   Drop the audio file at public/music/scene-theme.mp3; without it nothing plays.
   Public files are served under the app's base path (/cv-app-cloude/ on Pages),
   so the URL has to be built from BASE_URL rather than written as /music/... */
export const SCENE_MUSIC_URL = `${import.meta.env.BASE_URL}music/scene-theme.mp3`;

/* quiet enough to sit under whatever else is going on, loud enough to follow */
const VOLUME = 0.22;
const FADE_IN_S = 2.5;
const FADE_OUT_S = 1.8;

interface Player {
	element: HTMLAudioElement;
	context: AudioContext;
	gain: GainNode;
}

/* Fades go through a Web Audio gain node rather than element.volume: it ramps
   smoothly on its own clock, and iOS ignores element.volume altogether. */
export function useSceneMusic(src: string = SCENE_MUSIC_URL) {
	const player = useRef<Player | null>(null);
	const pauseTimer = useRef(0);

	const ensurePlayer = useCallback((): Player => {
		if (player.current) return player.current;
		const element = new Audio(src);
		element.loop = true;
		element.preload = "auto";
		const context = new AudioContext();
		const gain = context.createGain();
		gain.gain.value = 0;
		context.createMediaElementSource(element).connect(gain).connect(context.destination);
		player.current = { element, context, gain };
		return player.current;
	}, [src]);

	const rampTo = (gain: GainNode, context: AudioContext, value: number, seconds: number) => {
		const now = context.currentTime;
		gain.gain.cancelScheduledValues(now);
		/* start from wherever an unfinished fade left off */
		gain.gain.setValueAtTime(gain.gain.value, now);
		gain.gain.linearRampToValueAtTime(value, now + seconds);
	};

	/* must be called from the click itself, so the browser allows playback */
	const fadeIn = useCallback(() => {
		const { element, context, gain } = ensurePlayer();
		window.clearTimeout(pauseTimer.current);
		void context.resume();
		element.play().then(
			() => rampTo(gain, context, VOLUME, FADE_IN_S),
			/* no file, or playback refused: the scene simply stays silent */
			() => undefined,
		);
	}, [ensurePlayer]);

	const fadeOut = useCallback(() => {
		const current = player.current;
		if (!current) return;
		rampTo(current.gain, current.context, 0, FADE_OUT_S);
		window.clearTimeout(pauseTimer.current);
		pauseTimer.current = window.setTimeout(() => current.element.pause(), FADE_OUT_S * 1000 + 100);
	}, []);

	useEffect(
		() => () => {
			window.clearTimeout(pauseTimer.current);
			player.current?.element.pause();
			void player.current?.context.close();
			player.current = null;
		},
		[],
	);

	return { fadeIn, fadeOut };
}
