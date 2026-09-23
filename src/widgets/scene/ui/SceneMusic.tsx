import { MUSIC } from "@/shared/config";
import { useDraggableCard } from "@/widgets/scene/model/useDraggableCard";
import { useEffect, useRef, useState } from "react";

/* The tune that plays while the form is minimized and the scene has the stage.
   It is streamed through YouTube's own embedded player rather than a file of our
   own: nothing copyrighted lives in this repo and the plays count for the artist.
   YouTube's terms require that player to stay visible and at least 200x200, so it
   appears as a small card above the badge instead of playing invisibly. */
const VIDEO_ID = MUSIC.videoId;

/* quiet enough to sit under whatever else is going on, loud enough to follow */
const VOLUME = 22;
const FADE_IN_MS = 2500;
const FADE_OUT_MS = 1800;
const FADE_STEP_MS = 80;

interface YouTubePlayer {
	playVideo(): void;
	pauseVideo(): void;
	setVolume(volume: number): void;
	destroy(): void;
}

interface PlayerOptions {
	videoId: string;
	playerVars: Record<string, number | string>;
	events: { onReady: () => void };
}

interface YouTubeApi {
	Player: new (host: HTMLElement, options: PlayerOptions) => YouTubePlayer;
}

declare global {
	interface Window {
		YT?: YouTubeApi;
		onYouTubeIframeAPIReady?: () => void;
	}
}

/* the API script is loaded once and shared by every mount */
let apiPromise: Promise<YouTubeApi> | null = null;

const loadYouTubeApi = (): Promise<YouTubeApi> => {
	apiPromise ??= new Promise<YouTubeApi>((resolve) => {
		if (window.YT?.Player) {
			resolve(window.YT);
			return;
		}
		const previous = window.onYouTubeIframeAPIReady;
		window.onYouTubeIframeAPIReady = () => {
			previous?.();
			if (window.YT) resolve(window.YT);
		};
		const script = document.createElement("script");
		script.src = "https://www.youtube.com/iframe_api";
		document.head.appendChild(script);
	});
	return apiPromise;
};

interface SceneMusicProps {
	/* true while the form is minimized */
	playing: boolean;
	label: string;
	/* the accessible name of the grab handle */
	dragLabel: string;
}

export function SceneMusic({ playing, label, dragLabel }: SceneMusicProps) {
	/* the card outlives `playing` by one fade, so the music can bow out gently */
	const [mounted, setMounted] = useState(false);
	const host = useRef<HTMLDivElement>(null);
	const player = useRef<YouTubePlayer | null>(null);
	const fade = useRef(0);
	const unmountTimer = useRef(0);
	/* the card can be pushed out of the way of the sun, the moon and the birds, which
	   all fly through the corner it sits in; only while it is on stage, because the
	   exit keyframe owns the card's movement during the fade */
	const { cardRef, handle } = useDraggableCard(playing);

	/* minimizing brings the card back immediately; React allows this render-phase
	   update and it avoids a second render from an effect */
	if (playing && !mounted) setMounted(true);

	/* creates the player on the first minimize and tears it down with the card */
	useEffect(() => {
		if (!mounted) return;
		let cancelled = false;
		void loadYouTubeApi().then((api) => {
			if (cancelled || !host.current || player.current) return;
			player.current = new api.Player(host.current, {
				videoId: VIDEO_ID,
				/* autoplay rides on the click that minimized the form; browsers that
				   refuse it simply leave the play button for the viewer */
				playerVars: { autoplay: 1, playsinline: 1, rel: 0, loop: 1, playlist: VIDEO_ID },
				events: {
					onReady: () => {
						player.current?.setVolume(0);
						player.current?.playVideo();
					},
				},
			});
		});
		return () => {
			cancelled = true;
			window.clearInterval(fade.current);
			player.current?.destroy();
			player.current = null;
		};
	}, [mounted]);

	/* YouTube has no volume ramp of its own, so the fade is stepped by hand */
	useEffect(() => {
		if (!mounted) return;
		const duration = playing ? FADE_IN_MS : FADE_OUT_MS;
		const target = playing ? VOLUME : 0;
		const startedAt = Date.now();
		let from: number | null = null;
		window.clearInterval(fade.current);
		fade.current = window.setInterval(() => {
			if (!player.current) return;
			from ??= playing ? 0 : VOLUME;
			const progress = Math.min(1, (Date.now() - startedAt) / duration);
			player.current.setVolume(Math.round(from + (target - from) * progress));
			if (progress < 1) return;
			window.clearInterval(fade.current);
			if (!playing) player.current.pauseVideo();
		}, FADE_STEP_MS);
		return () => window.clearInterval(fade.current);
	}, [mounted, playing]);

	useEffect(() => {
		if (playing || !mounted) return;
		unmountTimer.current = window.setTimeout(() => setMounted(false), FADE_OUT_MS + 400);
		return () => window.clearTimeout(unmountTimer.current);
	}, [playing, mounted]);

	if (!mounted) return null;

	return (
		/* on its way out the card is already unreachable by pointer, and `inert` says the
		   same to the keyboard: without it the iframe holds the first tab stop for the
		   whole exit fade, and Tab lands inside YouTube's player instead of the toolbar */
		<div ref={cardRef} className={`scene-music${playing ? "" : " leaving"}`} aria-label={label} inert={!playing}>
			{/* the drag listens here and not on the card: the iframe is cross-origin, so
			    the moment the pointer crosses into it the events belong to YouTube and the
			    gesture dies. A strip of our own keeps it */}
			<button type='button' className='scene-music-grab' aria-label={dragLabel} {...handle} />
			<div ref={host} className='scene-music-player' />
		</div>
	);
}
