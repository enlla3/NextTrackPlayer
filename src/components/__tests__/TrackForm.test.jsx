import { fireEvent, render, screen } from "@testing-library/react";
import TrackForm from "../TrackForm";

describe("TrackForm", () => {
	it("submits only non-empty tracks and parses comma lists", () => {
		const onSubmit = jest.fn();
		render(<TrackForm onSubmit={onSubmit} />);

		// Fill in one track
		fireEvent.change(screen.getByPlaceholderText("Title"), {
			target: { value: "My Song" },
		});
		fireEvent.change(screen.getByPlaceholderText("Artist"), {
			target: { value: "Me" },
		});

		// Add preferences
		fireEvent.change(
			screen.getByPlaceholderText("Favorite artists (comma-sep)"),
			{ target: { value: "Me,You" } }
		);
		fireEvent.change(
			screen.getByPlaceholderText("Preferred genres (comma-sep)"),
			{ target: { value: "pop,rock" } }
		);
		fireEvent.change(
			screen.getByPlaceholderText("Preferred languages (comma-sep)"),
			{ target: { value: "english" } }
		);

		// Submit
		fireEvent.click(
			screen.getByRole("button", { name: /get recommendations/i })
		);
		expect(onSubmit).toHaveBeenCalledWith({
			track_ids: [{ title: "My Song", artist: "Me" }],
			preferences: {
				favorite_artists: ["Me", "You"],
				preferred_genres: ["pop", "rock"],
				preferred_languages: ["english"],
			},
		});
	});
});
