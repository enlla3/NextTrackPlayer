import { fireEvent, render, screen } from "@testing-library/react";
import NavBar from "../NavBar";

describe("NavBar", () => {
	it("does NOT show 'My Current Selections' when hasRecs=false", () => {
		render(
			<NavBar
				hasRecs={false}
				onReset={() => {}}
				onShowSelections={() => {}}
			/>
		);
		expect(screen.queryByText(/my current selections/i)).toBeNull();
	});

	it("shows 'My Current Selections' when hasRecs=true and calls onShowSelections", () => {
		const onShowSelections = jest.fn();
		render(
			<NavBar
				hasRecs={true}
				onReset={() => {}}
				onShowSelections={onShowSelections}
			/>
		);
		const btn = screen.getByRole("button", {
			name: /my current selections/i,
		});
		expect(btn).toBeInTheDocument();

		fireEvent.click(btn);
		expect(onShowSelections).toHaveBeenCalledTimes(1);
	});

	it("calls onReset when Reset clicked", () => {
		const onReset = jest.fn();
		render(
			<NavBar
				hasRecs={true}
				onReset={onReset}
				onShowSelections={() => {}}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: /reset/i }));
		expect(onReset).toHaveBeenCalledTimes(1);
	});
});
