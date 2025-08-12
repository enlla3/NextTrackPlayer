import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import App from "../pages/App";

// Mock config so API_BASE_URL is defined in tests
jest.mock("../config", () => ({ API_BASE_URL: "http://test/api" }));

// Mock YouTubePlayer to a simple placeholder
jest.mock("../components/YouTubePlayer", () => () => (
	<div data-testid="yt-player">YT</div>
));

beforeEach(() => {
	sessionStorage.clear();
	// No fake timers — avoids React 19 static-flag internal error
	global.fetch = jest.fn();
});

afterEach(() => {
	jest.resetAllMocks();
});

describe("App integration - current selections modal", () => {
	it("shows 'My Current Selections' after recommendations arrive and opens the modal", async () => {
		// First fetch (initial recommendations)
		global.fetch
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					recommended_tracks: [
						{ title: "Rec1", artist: "A1" },
						{ title: "Rec2", artist: "A2" },
						{ title: "Rec3", artist: "A3" },
					],
				}),
			})
			// Prefetch loop: abort quickly
			.mockRejectedValueOnce(
				Object.assign(new Error("Abort"), { name: "AbortError" })
			);

		render(<App />);

		// Fill the TrackForm
		fireEvent.change(screen.getByPlaceholderText("Title"), {
			target: { value: "SeedSong" },
		});
		fireEvent.change(screen.getByPlaceholderText("Artist"), {
			target: { value: "SeedArtist" },
		});

		// Prefs (same_artist_only defaults to false via UI)
		fireEvent.change(
			screen.getByPlaceholderText("Favorite artists (comma-sep)"),
			{
				target: { value: "FavX, FavY" },
			}
		);
		fireEvent.change(
			screen.getByPlaceholderText("Preferred genres (comma-sep)"),
			{
				target: { value: "pop" },
			}
		);
		fireEvent.change(
			screen.getByPlaceholderText("Preferred languages (comma-sep)"),
			{
				target: { value: "english" },
			}
		);

		// Submit
		fireEvent.click(
			screen.getByRole("button", { name: /get recommendations/i })
		);

		// Wait for the navbar button to appear
		const openBtn = await screen.findByRole("button", {
			name: /my current selections/i,
		});
		expect(openBtn).toBeInTheDocument();

		// Open modal
		fireEvent.click(openBtn);

		// Query *inside* the dialog to avoid collisions with the navbar button text
		const dialog = await screen.findByRole("dialog");
		expect(dialog).toBeInTheDocument();

		// Confirm modal heading present (scoped)
		expect(
			within(dialog).getByRole("heading", {
				name: /my current selections/i,
			})
		).toBeInTheDocument();

		// The seed we entered
		expect(within(dialog).getByText("SeedSong")).toBeInTheDocument();
		expect(within(dialog).getByText("SeedArtist")).toBeInTheDocument();

		// Preferences we entered
		expect(within(dialog).getByText("FavX, FavY")).toBeInTheDocument();
		expect(within(dialog).getByText("pop")).toBeInTheDocument();
		expect(within(dialog).getByText("english")).toBeInTheDocument();

		// same_artist_only defaults to 'No' (scoped)
		expect(within(dialog).getByText("No")).toBeInTheDocument();

		// Close via Close button to ensure wiring
		fireEvent.click(within(dialog).getByRole("button", { name: /close/i }));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});
});
