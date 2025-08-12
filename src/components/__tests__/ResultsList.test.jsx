import { fireEvent, render, screen } from "@testing-library/react";
import ResultsList from "../ResultsList";

const items = [
	{ title: "R1", artist: "A1" },
	{ title: "R2", artist: "A2" },
	{ title: "R3", artist: "A3" },
];

describe("ResultsList", () => {
	it("renders items and highlights currentIndex", () => {
		const onPick = jest.fn();
		render(<ResultsList items={items} currentIndex={2} onPick={onPick} />);

		items.forEach((it) => {
			expect(screen.getByText(it.title)).toBeInTheDocument();
		});

		const highlighted = screen.getAllByText(/R3/)[0].closest("li");
		expect(highlighted).toHaveClass("bg-amber-100");

		fireEvent.click(screen.getByText("R1"));
		expect(onPick).toHaveBeenCalledWith(0);
	});

	it("shows placeholder when empty", () => {
		render(<ResultsList items={[]} currentIndex={0} onPick={() => {}} />);
		expect(screen.getByText(/no results yet/i)).toBeInTheDocument();
	});
});
