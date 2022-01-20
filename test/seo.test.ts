import { initSeo as _initSeo } from "../src/index";

let initSeo = _initSeo;
try {
	// @ts-ignore
	initSeo = require("../dist/index").initSeo;
} catch (_) {}

describe("init without default options", () => {
	let { getSeo, getSeoLinks, getSeoMeta } = initSeo();

	describe("getSeo", () => {
		describe("without an SEO config", () => {
			it("returns meta with *only* directives for bots", () => {
				let [meta] = getSeo();
				expect(meta).toEqual({
					googlebot: "index,follow",
					robots: "index,follow",
				});
			});
			it("returns no links", () => {
				let [, links] = getSeo();
				expect(links).toEqual([]);
			});
		});

		it("returns the correct title tags", () => {
			let [meta, links] = getSeo({ title: "Cheese and Crackers" });
			expect(meta).toEqual({
				title: "Cheese and Crackers",
				"og:title": "Cheese and Crackers",
				googlebot: "index,follow",
				robots: "index,follow",
			});
			expect(links).toEqual([]);
		});

		it("fucks", () => {
			let seo = getSeo({
				title: "Best website ever",
				description: "This is a really great website ya dork",
				titleTemplate: "%s | Cool",
				twitter: {
					image: {
						url: "https://somewhere.com/fake-path.jpg",
						alt: "fake!",
					},
				},
				bypassTemplate: false,
				robots: {
					noIndex: true,
					noFollow: true,
				},
				canonical: "https://somewhere.com",
				facebook: {
					appId: "12345",
				},
				openGraph: {
					siteName: "Best website ever, yeah!",
					url: "https://somewhere.com",
					images: [
						{
							url: "https://somewhere.com/fake-path.jpg",
							alt: "fake!",
							height: 200,
							type: "jpg",
						},
					],
				},
			});

			// meta
			expect(seo[0]).toMatchInlineSnapshot(`
			Object {
			  "description": "This is a really great website ya dork",
			  "fb:app_id": "12345",
			  "googlebot": "noindex,nofollow",
			  "og:description": "This is a really great website ya dork",
			  "og:image": "https://somewhere.com/fake-path.jpg",
			  "og:image:alt": "fake!",
			  "og:image:height": "200",
			  "og:image:type": "jpg",
			  "og:site_name": "Best website ever, yeah!",
			  "og:title": "Best website ever | Cool",
			  "og:url": "https://somewhere.com",
			  "robots": "noindex,nofollow",
			  "title": "Best website ever | Cool",
			  "twitter:card": "summary",
			  "twitter:description": "This is a really great website ya dork",
			  "twitter:image": "https://somewhere.com/fake-path.jpg",
			  "twitter:image:alt": "fake!",
			  "twitter:title": "Best website ever | Cool",
			}
		`);

			// links
			expect(seo[1]).toMatchInlineSnapshot(`
			Array [
			  Object {
			    "href": "https://somewhere.com",
			    "rel": "canonical",
			  },
			]
		`);
		});
	});

	describe("getSeoMeta", () => {
		describe("without an SEO config", () => {
			it("returns an object with *only* directives for bots", () => {
				let meta = getSeoMeta();
				expect(meta).toEqual({
					googlebot: "index,follow",
					robots: "index,follow",
				});
			});
		});
	});

	describe("getSeoLinks", () => {
		describe("without an SEO config", () => {
			it("returns an empty array", () => {
				let links = getSeoLinks();
				expect(links).toEqual([]);
			});
		});
	});
});

describe("init with default options", () => {
	let { getSeo, getSeoMeta, getSeoLinks } = initSeo({
		title: "Cheese and Crackers",
		description: "A great website about eating delicious cheese and crackers.",
		titleTemplate: "%s | Cheese and Crackers",
		canonical: "https://somewhere-a.com",
	});

	describe("getSeo", () => {
		describe("without an SEO config", () => {
			let [meta, links] = getSeo();
			it("returns meta based on default config", () => {
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
			it("returns links based on default config", () => {
				expect(links).toEqual([
					{
						rel: "canonical",
						href: "https://somewhere-a.com",
					},
				]);
			});
		});

		it("overrides the title tags", () => {
			let [meta, links] = getSeo({ title: "About us" });
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
			expect(links).toEqual([
				{
					rel: "canonical",
					href: "https://somewhere-a.com",
				},
			]);
		});
	});

	describe("getSeoMeta", () => {
		describe("without an SEO config", () => {
			let meta = getSeoMeta();
			it("returns meta based on default config", () => {
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
		});

		it("overrides the title tags", () => {
			let meta = getSeoMeta({ title: "About us" });
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
		});
	});

	describe("getSeoLinks", () => {
		describe("without an SEO config", () => {
			let links = getSeoLinks();
			it("returns links based on default config", () => {
				expect(links).toEqual([
					{
						rel: "canonical",
						href: "https://somewhere-a.com",
					},
				]);
			});
		});

		it("overrides the default canonical link", () => {
			let links = getSeoLinks({ canonical: "https://somewhere-b.com" });
			expect(links).toEqual([
				{
					rel: "canonical",
					href: "https://somewhere-b.com",
				},
			]);
		});
	});
});

describe("init with default options based on route data", () => {
	let { getSeo, getSeoMeta, getSeoLinks } = initSeo({
		title: "Cheese and Crackers",
		description: "A great website about eating delicious cheese and crackers.",
		titleTemplate: "%s | Cheese and Crackers",
		canonical: "https://somewhere-a.com",
	});

	describe("getSeo", () => {
		describe("without an SEO config", () => {
			let [meta, links] = getSeo();
			it("returns meta based on default config", () => {
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
			it("returns links based on default config", () => {
				expect(links).toEqual([
					{
						rel: "canonical",
						href: "https://somewhere-a.com",
					},
				]);
			});
		});

		it("overrides the title tags", () => {
			let [meta, links] = getSeo({ title: "About us" });
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
			expect(links).toEqual([
				{
					rel: "canonical",
					href: "https://somewhere-a.com",
				},
			]);
		});
	});

	describe("getSeoMeta", () => {
		describe("without an SEO config", () => {
			let meta = getSeoMeta();
			it("returns meta based on default config", () => {
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
		});

		it("overrides the title tags", () => {
			let meta = getSeoMeta({ title: "About us" });
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
		});
	});

	describe("getSeoLinks", () => {
		describe("without an SEO config", () => {
			let links = getSeoLinks();
			it("returns links based on default config", () => {
				expect(links).toEqual([
					{
						rel: "canonical",
						href: "https://somewhere-a.com",
					},
				]);
			});
		});

		it("overrides the default canonical link", () => {
			let links = getSeoLinks({ canonical: "https://somewhere-b.com" });
			expect(links).toEqual([
				{
					rel: "canonical",
					href: "https://somewhere-b.com",
				},
			]);
		});
	});
});

describe("twitter config", () => {
	let warn = console.warn;
	beforeEach(() => {
		console.warn = jest.fn();
	});

	afterEach(() => {
		console.warn = warn;
	});

	let { getSeo } = initSeo({
		title: "Cheese and Crackers",
		description: "A great website about eating delicious cheese and crackers.",
	});

	it("warns when an invalid URL is provided to twitter:image", () => {
		getSeo({
			twitter: {
				image: {
					url: "/fake-path.jpg",
					alt: "fake!",
				},
			},
		});
		expect(console.warn).toHaveBeenCalledTimes(1);
	});

	it("warns when alt text isn't provided to twitter:image", () => {
		getSeo({
			twitter: {
				// @ts-expect-error
				image: {
					url: "https://somewhere.com/fake-path.jpg",
				},
			},
		});
		expect(console.warn).toHaveBeenCalledTimes(1);
	});

	it("does not warn when a valid URL is provided to twitter:image", () => {
		getSeo({
			twitter: {
				image: {
					url: "https://somewhere.com/fake-path.jpg",
					alt: "fake!",
				},
			},
		});
		expect(console.warn).not.toHaveBeenCalled();
	});

	it("warns when an invalid card type is passed", () => {
		getSeo({
			twitter: {
				// @ts-expect-error
				card: "poop",
			},
		});
		expect(console.warn).toHaveBeenCalledTimes(1);
	});

	describe("when card is set to 'app'", () => {
		it("warns when image meta is provided", () => {
			getSeo({
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
		});

		it("warns when player meta is provided", () => {
			getSeo({
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
		});

		it("ignores image meta", () => {
			let [meta] = getSeo({
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
			let [meta] = getSeo({
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
			getSeo({
				twitter: {
					card: "summary",
					player: {
						url: "https://somewhere.com/fake-path.mp4",
					},
				},
			});
			expect(console.warn).toHaveBeenCalledTimes(1);
		});

		it("sets card type to 'player' if none is provided", () => {
			let [meta] = getSeo({
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
			let [meta] = getSeo({
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
