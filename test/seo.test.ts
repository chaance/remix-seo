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

describe("twitter config", () => {
	let seo = getSeo({
		title: "Cheese and Crackers",
		description: "A great website about eating delicious cheese and crackers.",
	});

	it("warns when an invalid URL is provided to twitter:image", () => {
		let warn = console.warn;
		console.warn = jest.fn();

		seo({
			twitter: {
				image: {
					url: "/fake-path.jpg",
					alt: "fake!",
				},
			},
		});
		expect(console.warn).toHaveBeenCalledTimes(1);

		console.warn = warn;
	});

	it("does not warn when a valid URL is provided to twitter:image", () => {
		let warn = console.warn;
		console.warn = jest.fn();

		seo({
			twitter: {
				image: {
					url: "https://somewhere.com/fake-path.jpg",
					alt: "fake!",
				},
			},
		});
		expect(console.warn).not.toHaveBeenCalled();

		console.warn = warn;
	});

	it("warns when an invalid card type is passed", () => {
		let warn = console.warn;
		console.warn = jest.fn();

		seo({
			twitter: {
				// @ts-expect-error
				card: "poop",
			},
		});
		expect(console.warn).toHaveBeenCalledTimes(1);
		console.warn = warn;
	});

	describe("when card is set to 'app'", () => {
		it("warns when image meta is provided", () => {
			let warn = console.warn;
			console.warn = jest.fn();

			seo({
				twitter: {
					card: "app",
					app: {
						name: "Hello",
						url: {
							iPhone: "https://a.com",
							iPad: "https://b.com",
							googlePlay: "https://c.com",
						},
						id: {
							iPhone: "1",
							iPad: "2",
							googlePlay: "3",
						},
					},
					image: {
						url: "https://somewhere.com/fake-path.jpg",
						alt: "fake!",
					},
				},
			});
			expect(console.warn).toHaveBeenCalledTimes(1);

			console.warn = warn;
		});

		it("warns when player meta is provided", () => {
			let warn = console.warn;
			console.warn = jest.fn();

			seo({
				twitter: {
					card: "app",
					app: {
						name: "Hello",
						url: {
							iPhone: "https://a.com",
							iPad: "https://b.com",
							googlePlay: "https://c.com",
						},
						id: {
							iPhone: "1",
							iPad: "2",
							googlePlay: "3",
						},
					},
					player: {
						url: "https://somewhere.com/fake-path.jpg",
					},
				},
			});
			expect(console.warn).toHaveBeenCalledTimes(1);

			console.warn = warn;
		});

		it("ignores image meta", () => {
			let [meta] = seo({
				twitter: {
					card: "app",
					app: {
						name: "Hello",
						url: {
							iPhone: "https://a.com",
							iPad: "https://b.com",
							googlePlay: "https://c.com",
						},
						id: {
							iPhone: "1",
							iPad: "2",
							googlePlay: "3",
						},
					},
					image: {
						url: "https://somewhere.com/fake-path.jpg",
						alt: "fake!",
					},
				},
			});
			expect(meta["twitter:image"]).toBe(undefined);
		});

		it("ignores player meta", () => {
			let [meta] = seo({
				twitter: {
					card: "app",
					app: {
						name: "Hello",
						url: {
							iPhone: "https://a.com",
							iPad: "https://b.com",
							googlePlay: "https://c.com",
						},
						id: {
							iPhone: "1",
							iPad: "2",
							googlePlay: "3",
						},
					},
					player: {
						url: "https://somewhere.com/fake-path.jpg",
					},
				},
			});
			expect(meta["twitter:player"]).toBe(undefined);
		});
	});

	describe("when player metadata is provided", () => {
		it("warns on invalid card type", () => {
			let warn = console.warn;
			console.warn = jest.fn();

			seo({
				twitter: {
					card: "summary",
					player: {
						url: "https://somewhere.com/fake-path.mp4",
					},
				},
			});
			expect(console.warn).toHaveBeenCalledTimes(1);

			console.warn = warn;
		});

		it("sets card type to 'player' if none is provided", () => {
			let [meta] = seo({
				twitter: {
					player: {
						url: "https://somewhere.com/fake-path.mp4",
					},
				},
			});
			expect(meta["twitter:card"]).toEqual("player");
		});
	});

	describe("when app metadata is provided", () => {
		it("sets card type to 'app' if none is provided", () => {
			let [meta] = seo({
				twitter: {
					app: {
						name: "Hello",
						url: {
							iPhone: "https://a.com",
							iPad: "https://b.com",
							googlePlay: "https://c.com",
						},
						id: {
							iPhone: "1",
							iPad: "2",
							googlePlay: "3",
						},
					},
				},
			});
			expect(meta["twitter:card"]).toEqual("app");
		});
	});
});
