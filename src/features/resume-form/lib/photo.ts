/* The photo is stored in localStorage inside the draft, and the whole draft is one
   value: a phone picture of a few megabytes, base64-encoded, is past the ~5 MB quota,
   and from then on every keystroke fails to save — the draft included, silently. The
   résumé shows the photo at 82px, so it is shrunk on the way in to a size nobody can
   tell apart from the original there, and that costs tens of kilobytes. */
export const PHOTO_MAX_SIDE = 400;
const PHOTO_QUALITY = 0.85;

/* the size that fits within a square of `max`, never enlarged */
export const fitWithin = (width: number, height: number, max: number) => {
	const scale = Math.min(1, max / Math.max(width, height));
	return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
};

/* Decoding through an <img> rather than reading bytes also applies the camera's EXIF
   orientation, which browsers honour on images by default, so a portrait shot is not
   stored on its side. Rejects when the file is not an image the browser can decode. */
export const shrinkPhoto = (file: Blob): Promise<string> =>
	new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const image = new Image();
		image.onload = () => {
			URL.revokeObjectURL(url);
			const { width, height } = fitWithin(image.naturalWidth, image.naturalHeight, PHOTO_MAX_SIDE);
			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			const context = canvas.getContext("2d");
			if (!context) {
				reject(new Error("No 2D canvas context"));
				return;
			}
			/* JPEG has no transparency; a transparent PNG would otherwise turn black */
			context.fillStyle = "#ffffff";
			context.fillRect(0, 0, width, height);
			context.drawImage(image, 0, 0, width, height);
			resolve(canvas.toDataURL("image/jpeg", PHOTO_QUALITY));
		};
		image.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error("The file is not an image this browser can read"));
		};
		image.src = url;
	});
