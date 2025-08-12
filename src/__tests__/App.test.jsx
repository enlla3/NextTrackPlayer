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

describe("App integration - current selections modal", () => {
	beforeEach(() => {
		sessionStorage.clear();
		global.fetch = jest.fn();
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it("shows 'My Current Selections' after recommendations arrive and opens the modal", async () => {
		// 1) Initial recommendations response (3 tracks)
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
			// 2) Any subsequent prefetch calls return empty list to end the loop quickly
			.mockResolvedValue({
				ok: true,
				json: async () => ({ recommended_tracks: [] }),
			});

		render(<App />);

		// Fill the Get Recommendations form
		fireEvent.change(screen.getByPlaceholderText("Title"), {
			target: { value: "SeedSong" },
		});
		fireEvent.change(screen.getByPlaceholderText("Artist"), {
			target: { value: "SeedArtist" },
		});

		// Preferences (optional)
		fireEvent.change(
			screen.getByPlaceholderText("Favorite artists (comma-sep)"),
			{ target: { value: "FavX, FavY" } }
		);
		fireEvent.change(
			screen.getByPlaceholderText("Preferred genres (comma-sep)"),
			{ target: { value: "pop" } }
		);
		fireEvent.change(
			screen.getByPlaceholderText("Preferred languages (comma-sep)"),
			{ target: { value: "english" } }
		);
		// leave "Same artist only" unchecked (default false)

		// Add the seed
		fireEvent.click(screen.getByRole("button", { name: /add track/i }));

		// Submit
		fireEvent.click(
			screen.getByRole("button", { name: /get recommendations/i })
		);

		// Player should render (YT placeholder)
		expect(await screen.findByTestId("yt-player")).toBeInTheDocument();

		// Wait for the navbar button to appear
		const openBtn = await screen.findByRole("button", {
			name: /my current selections/i,
		});
		expect(openBtn).toBeInTheDocument();

		// Open the modal
		fireEvent.click(openBtn);

		// Modal should show with the seeds & preferences we provided
		const dialog = await screen.findByRole("dialog");
		expect(dialog).toBeInTheDocument();

		// Check heading
		expect(
			within(dialog).getByRole("heading", {
				name: /my current selections/i,
			})
		).toBeInTheDocument();

		// Tracks list contains our seed
		expect(within(dialog).getByText("SeedSong")).toBeInTheDocument();
		expect(within(dialog).getByText("SeedArtist")).toBeInTheDocument();

		// Preferences we entered
		expect(within(dialog).getByText("FavX, FavY")).toBeInTheDocument();
		expect(within(dialog).getByText("pop")).toBeInTheDocument();
		expect(within(dialog).getByText("english")).toBeInTheDocument();

		// same_artist_only defaults to 'No'
		expect(within(dialog).getByText("No")).toBeInTheDocument();

		// Close via Close button to ensure wiring
		fireEvent.click(within(dialog).getByRole("button", { name: /close/i }));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});
});
