import { fireEvent, render, screen } from "@testing-library/react";
import logo from "../../assets/logo.png";
import NavBar from "../NavBar";

describe("NavBar", () => {
	it("renders logo, title, and Reset button", () => {
		const onReset = jest.fn();
		render(<NavBar onReset={onReset} />);

		// Logo image
		const img = screen.getByAltText("NextTrack Logo");
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute("src", logo);

		// Title
		expect(screen.getByText("NextTrack")).toBeInTheDocument();

		// Reset button
		const btn = screen.getByRole("button", { name: /reset/i });
		expect(btn).toBeInTheDocument();
		fireEvent.click(btn);
		expect(onReset).toHaveBeenCalledTimes(1);
	});
});
