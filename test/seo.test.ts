import { getSeo } from "../src/index";

describe("without default options", () => {
	let seo = getSeo();

	describe("without an SEO config", () => {
		let [meta, links] = seo();
		it("returns basic meta", () => {
			expect(meta).toEqual({
				googlebot: "index,follow",
				robots: "index,follow",
			});
		});
		it("returns no links", () => {
			expect(links).toEqual([]);
		});
	});

	it("returns the correct title tags", () => {
		let [meta, links] = seo({ title: "Cheese and Crackers" });
		expect(meta).toEqual({
			title: "Cheese and Crackers",
			"og:title": "Cheese and Crackers",
			googlebot: "index,follow",
			robots: "index,follow",
		});
		expect(links).toEqual([]);
	});
});

describe("with default options", () => {
	let seo = getSeo({
		title: "Cheese and Crackers",
		description: "A great website about eating delicious cheese and crackers.",
		titleTemplate: "%s | Cheese and Crackers",
	});

	describe("without an SEO config", () => {
		let [meta, links] = seo();
		it("returns default meta", () => {
			expect(meta).toEqual({
				title: "Cheese and Crackers | Cheese and Crackers",
				"og:title": "Cheese and Crackers | Cheese and Crackers",
				description:
					"A great website about eating delicious cheese and crackers.",
				"og:description":
					"A great website about eating delicious cheese and crackers.",
				googlebot: "index,follow",
				robots: "index,follow",
			});
		});
		it("returns default links", () => {
			expect(links).toEqual([]);
		});
	});

	it("overrides the title tags", () => {
		let [meta, links] = seo({ title: "About us" });
		expect(meta).toEqual({
			title: "About us | Cheese and Crackers",
			"og:title": "About us | Cheese and Crackers",
			description:
				"A great website about eating delicious cheese and crackers.",
			"og:description":
				"A great website about eating delicious cheese and crackers.",
			googlebot: "index,follow",
			robots: "index,follow",
		});
		expect(links).toEqual([]);
	});
});
