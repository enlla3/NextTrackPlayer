import { fireEvent, render, screen } from "@testing-library/react";
import SelectionModal from "../SelectionModal";

const query = {
	track_ids: [
		{ title: "Song A", artist: "Artist A" },
		{ title: "Song B", artist: "Artist B" },
	],
	preferences: {
		favorite_artists: ["Fav1", "Fav2"],
		preferred_genres: ["pop", "rock"],
		preferred_languages: ["english"],
		same_artist_only: true,
	},
};

describe("SelectionModal", () => {
	it("renders nothing when closed", () => {
		const { container } = render(
			<SelectionModal isOpen={false} onClose={() => {}} query={query} />
		);
		expect(container).toBeEmptyDOMElement();
	});

	it("shows tracks and preferences when open", () => {
		render(
			<SelectionModal isOpen={true} onClose={() => {}} query={query} />
		);

		expect(screen.getByRole("dialog")).toBeInTheDocument();
		expect(screen.getByText(/my current selections/i)).toBeInTheDocument();

		// tracks
		expect(screen.getByText("Song A")).toBeInTheDocument();
		expect(screen.getByText("Artist A")).toBeInTheDocument();
		expect(screen.getByText("Song B")).toBeInTheDocument();
		expect(screen.getByText("Artist B")).toBeInTheDocument();

		// preferences
		expect(screen.getByText("Fav1, Fav2")).toBeInTheDocument();
		expect(screen.getByText("pop, rock")).toBeInTheDocument();
		expect(screen.getByText("english")).toBeInTheDocument();
		expect(screen.getByText("Yes")).toBeInTheDocument(); // same_artist_only: true
	});

	it("closes when clicking Close and backdrop", () => {
		const onClose = jest.fn();
		const { container, rerender } = render(
			<SelectionModal isOpen={true} onClose={onClose} query={query} />
		);

		fireEvent.click(screen.getByRole("button", { name: /close/i }));
		expect(onClose).toHaveBeenCalled();

		// reopen and click backdrop
		rerender(
			<SelectionModal isOpen={true} onClose={onClose} query={query} />
		);
		const backdrop = container.querySelector(".absolute.inset-0");
		fireEvent.click(backdrop);
		expect(onClose).toHaveBeenCalledTimes(2);
	});
});
