import { MUSIC } from "@/services/music";
import type { Translation } from "@/shared/i18n";

const AUTHOR = "Ihor Korenets";
const EMAIL = "vik753@gmail.com";
const YEAR = 2026;

interface AppFooterProps {
	t: Translation;
}

export function AppFooter({ t }: AppFooterProps) {
	return (
		<footer className='app-footer'>
			<p className='footer-author'>
				<span>{AUTHOR}</span>
				<a href={`mailto:${EMAIL}`}>{EMAIL}</a>
				<span>{YEAR}</span>
			</p>
			{/* the recording is not ours: name the track, the performer and where it plays from */}
			<p className='footer-credit'>
				{t.musicCredit}{" "}
				<a href={MUSIC.url} target='_blank' rel='noreferrer'>
					{MUSIC.title}
				</a>{" "}
				—{" "}
				<a href={MUSIC.artistUrl} target='_blank' rel='noreferrer'>
					{MUSIC.artist}
				</a>
				. {t.musicSource}
			</p>
		</footer>
	);
}
