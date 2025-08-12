// Simple cache for {title, artist} → videoId (or null), with TTL + sessionStorage
const MEM = new Map(); // key → { ts, val }
const TTL_MS = 24 * 60 * 60 * 1000; // 24h
const PREFIX = "vidcache:";
const SEP = "|||";

const now = () => Date.now();
const keyOf = (title, artist) =>
	`${(title || "").trim().toLowerCase()}${SEP}${(artist || "")
		.trim()
		.toLowerCase()}`;

function readStorage(key) {
	try {
		const raw = sessionStorage.getItem(PREFIX + key);
		if (!raw) return null;
		const obj = JSON.parse(raw);
		if (!obj || typeof obj.ts !== "number") return null;
		if (now() - obj.ts > TTL_MS) {
			sessionStorage.removeItem(PREFIX + key);
			return null;
		}
		return obj.val; // videoId (string) or null
	} catch {
		return null;
	}
}

function writeStorage(key, val) {
	try {
		sessionStorage.setItem(
			PREFIX + key,
			JSON.stringify({ ts: now(), val })
		);
	} catch {
		// ignore quota errors
	}
}

export function cacheGet(title, artist) {
	const k = keyOf(title, artist);
	const inMem = MEM.get(k);
	if (inMem && now() - inMem.ts <= TTL_MS) return inMem.val;

	const fromStorage = readStorage(k);
	if (fromStorage !== null) {
		MEM.set(k, { ts: now(), val: fromStorage });
		return fromStorage;
	}
	return undefined; // "no cache"
}

export function cacheSet(title, artist, videoId /* string|null */) {
	const k = keyOf(title, artist);
	const entry = { ts: now(), val: videoId };
	MEM.set(k, entry);
	writeStorage(k, videoId);
}

// Best-effort prefetch for a list of tracks using a provided fetcher
export async function prefetchVideoIds(tracks, fetcher) {
	const MAX = 6; // prefetch first N only
	const slice = tracks.slice(0, MAX);
	for (const t of slice) {
		const cached = cacheGet(t.title, t.artist);
		if (cached !== undefined) continue;
		try {
			const vid = await fetcher(t.title, t.artist);
			cacheSet(t.title, t.artist, vid ?? null);
		} catch {
			// ignore
		}
	}
}
