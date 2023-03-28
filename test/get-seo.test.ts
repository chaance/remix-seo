import { initSeo as _initSeo } from "../src/index";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

let initSeo = _initSeo;
if (import.meta.env.TEST_BUILD) {
	try {
		initSeo = require("../dist/index").initSeo;
	} catch (_) {
		initSeo = _initSeo;
	}
}

describe("init without default options", () => {
	let { getSeo } = initSeo();

	it("returns meta with directives for bots when called without arguments", () => {
		let meta = getSeo();
		expect(meta).toMatchInlineSnapshot(`
			[
			  {
			    "content": "index,follow",
			    "name": "robots",
			  },
			  {
			    "content": "index,follow",
			    "name": "googlebot",
			  },
			]
		`);
	});

	it("returns the correct title tags", () => {
		let meta = getSeo({ title: "Cheese and Crackers" });
		expect(meta).toMatchInlineSnapshot(`
			[
			  {
			    "title": "Cheese and Crackers",
			  },
			  {
			    "content": "Cheese and Crackers",
			    "property": "og:title",
			  },
			  {
			    "content": "Cheese and Crackers",
			    "name": "twitter:title",
			  },
			  {
			    "content": "index,follow",
			    "name": "robots",
			  },
			  {
			    "content": "index,follow",
			    "name": "googlebot",
			  },
			]
		`);
	});

	it("returns the correct description tags", () => {
		let meta = getSeo({ description: "Cheese and Crackers" });
		expect(meta).toMatchInlineSnapshot(`
			[
			  {
			    "content": "Cheese and Crackers",
			    "name": "description",
			  },
			  {
			    "content": "Cheese and Crackers",
			    "property": "og:description",
			  },
			  {
			    "content": "Cheese and Crackers",
			    "name": "twitter:description",
			  },
			  {
			    "content": "index,follow",
			    "name": "robots",
			  },
			  {
			    "content": "index,follow",
			    "name": "googlebot",
			  },
			]
		`);
	});

	// TODO: Figure out why we're logging a warning here
	it("returns corrent tags with a bunch of stuff", () => {
		let meta = getSeo({
			title: "Best website ever",
			description: "This is a really great website ya dork",
			titleTemplate: "%s | Cool",
			twitter: {
				image: {
					url: "https://somewhere.com/fake-path.jpg",
					alt: "fake!",
				},
			},
			bypassTitleTemplate: false,
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
		expect(meta).toMatchInlineSnapshot(`
			[
			  {
			    "title": "Best website ever | Cool",
			  },
			  {
			    "content": "This is a really great website ya dork",
			    "name": "description",
			  },
			  {
			    "href": "https://somewhere.com",
			    "rel": "canonical",
			    "tagName": "link",
			  },
			  {
			    "content": "Best website ever, yeah!",
			    "property": "og:site_name",
			  },
			  {
			    "content": "Best website ever | Cool",
			    "property": "og:title",
			  },
			  {
			    "content": "This is a really great website ya dork",
			    "property": "og:description",
			  },
			  {
			    "content": "https://somewhere.com",
			    "property": "og:url",
			  },
			  {
			    "content": "https://somewhere.com/fake-path.jpg",
			    "property": "og:image",
			  },
			  {
			    "content": "fake!",
			    "property": "og:image:alt",
			  },
			  {
			    "content": "jpg",
			    "property": "og:image:type",
			  },
			  {
			    "content": "200",
			    "property": "og:image:height",
			  },
			  {
			    "content": "Best website ever | Cool",
			    "name": "twitter:title",
			  },
			  {
			    "content": "This is a really great website ya dork",
			    "name": "twitter:description",
			  },
			  {
			    "content": "summary",
			    "name": "twitter:card",
			  },
			  {
			    "content": "https://somewhere.com/fake-path.jpg",
			    "name": "twitter:image",
			  },
			  {
			    "content": "fake!",
			    "name": "twitter:image:alt",
			  },
			  {
			    "content": "12345",
			    "property": "fb:app_id",
			  },
			  {
			    "content": "noindex,nofollow",
			    "name": "robots",
			  },
			  {
			    "content": "noindex,nofollow",
			    "name": "googlebot",
			  },
			]
		`);
	});
});

describe("init with default options", () => {
	let { getSeo } = initSeo({
		title: "Cheese and Crackers",
		description: "Eating cheese and crackers.",
		titleTemplate: "%s | Cheese and Crackers",
		canonical: "https://somewhere-a.com",
	});

	it("returns meta with defaults when called without arguments", () => {
		let meta = getSeo();
		expect(meta).toMatchInlineSnapshot(`
			[
			  {
			    "title": "Cheese and Crackers | Cheese and Crackers",
			  },
			  {
			    "content": "Eating cheese and crackers.",
			    "name": "description",
			  },
			  {
			    "href": "https://somewhere-a.com",
			    "rel": "canonical",
			    "tagName": "link",
			  },
			  {
			    "content": "Cheese and Crackers | Cheese and Crackers",
			    "property": "og:title",
			  },
			  {
			    "content": "Eating cheese and crackers.",
			    "property": "og:description",
			  },
			  {
			    "content": "https://somewhere-a.com",
			    "property": "og:url",
			  },
			  {
			    "content": "Cheese and Crackers | Cheese and Crackers",
			    "name": "twitter:title",
			  },
			  {
			    "content": "Eating cheese and crackers.",
			    "name": "twitter:description",
			  },
			  {
			    "content": "index,follow",
			    "name": "robots",
			  },
			  {
			    "content": "index,follow",
			    "name": "googlebot",
			  },
			]
		`);
	});

	it("returns the correct title tags", () => {
		let meta = getSeo({ title: "About Us" });
		expect(meta).toMatchInlineSnapshot(`
			[
			  {
			    "title": "About Us | Cheese and Crackers",
			  },
			  {
			    "content": "Eating cheese and crackers.",
			    "name": "description",
			  },
			  {
			    "href": "https://somewhere-a.com",
			    "rel": "canonical",
			    "tagName": "link",
			  },
			  {
			    "content": "About Us | Cheese and Crackers",
			    "property": "og:title",
			  },
			  {
			    "content": "Eating cheese and crackers.",
			    "property": "og:description",
			  },
			  {
			    "content": "https://somewhere-a.com",
			    "property": "og:url",
			  },
			  {
			    "content": "About Us | Cheese and Crackers",
			    "name": "twitter:title",
			  },
			  {
			    "content": "Eating cheese and crackers.",
			    "name": "twitter:description",
			  },
			  {
			    "content": "index,follow",
			    "name": "robots",
			  },
			  {
			    "content": "index,follow",
			    "name": "googlebot",
			  },
			]
		`);
	});

	it("returns the correct description tags", () => {
		let meta = getSeo({ description: "Let's talk about cheese" });
		expect(meta).toMatchInlineSnapshot(`
			[
			  {
			    "title": "Cheese and Crackers | Cheese and Crackers",
			  },
			  {
			    "content": "Let's talk about cheese",
			    "name": "description",
			  },
			  {
			    "href": "https://somewhere-a.com",
			    "rel": "canonical",
			    "tagName": "link",
			  },
			  {
			    "content": "Cheese and Crackers | Cheese and Crackers",
			    "property": "og:title",
			  },
			  {
			    "content": "Let's talk about cheese",
			    "property": "og:description",
			  },
			  {
			    "content": "https://somewhere-a.com",
			    "property": "og:url",
			  },
			  {
			    "content": "Cheese and Crackers | Cheese and Crackers",
			    "name": "twitter:title",
			  },
			  {
			    "content": "Let's talk about cheese",
			    "name": "twitter:description",
			  },
			  {
			    "content": "index,follow",
			    "name": "robots",
			  },
			  {
			    "content": "index,follow",
			    "name": "googlebot",
			  },
			]
		`);
	});
});

describe("twitter tags", () => {
	let warn = console.warn;
	beforeEach(() => {
		console.warn = vi.fn();
	});

	afterEach(() => {
		console.warn = warn;
	});

	it.only("bypasses title template when `bypassTitleTemplate: true`", () => {
		let { getSeo } = initSeo();
		let meta = getSeo({
			titleTemplate: "%s | Website",
			bypassTitleTemplate: true,
			title: "Hello",
			twitter: { title: "Hello Twitter" },
		});
		let twitterTitleContent = meta.find(
			(tag) => "name" in tag && tag.name === "twitter:title"
			// @ts-expect-error
		)?.content;
		expect(twitterTitleContent).toBe("Hello Twitter");
	});

	it("warns when an invalid URL is provided to twitter:image", () => {
		let { getSeo } = initSeo();
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
		let { getSeo } = initSeo();
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
		let { getSeo } = initSeo();
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
		let { getSeo } = initSeo();
		getSeo({
			twitter: {
				// @ts-expect-error
				card: "poop",
			},
		});
		expect(console.warn).toHaveBeenCalledTimes(1);
	});

	it("does not warn when detecting 'player' meta if twitter.card is set to 'player'", () => {
		let { getSeo } = initSeo();
		getSeo({
			twitter: {
				card: "player",
				player: { url: "https://c.com" },
			},
		});
		expect(console.warn).not.toHaveBeenCalled();
	});

	it("warns when detecting 'player' meta if twitter.card is set to 'app'", () => {
		let { getSeo } = initSeo();
		getSeo({
			twitter: {
				card: "app",
				player: { url: "https://c.com" },
			},
		});
		expect(console.warn).toHaveBeenCalledTimes(1);
	});

	it("warns when detecting 'player' meta if twitter.card is set to 'summary'", () => {
		let { getSeo } = initSeo();
		getSeo({
			twitter: {
				card: "summary",
				player: { url: "https://c.com" },
			},
		});
		expect(console.warn).toHaveBeenCalledTimes(1);
	});

	it("warns when detecting 'player' meta if twitter.card is set to 'summary_large_image'", () => {
		let { getSeo } = initSeo();
		getSeo({
			twitter: {
				card: "summary_large_image",
				player: { url: "https://c.com" },
			},
		});
		expect(console.warn).toHaveBeenCalledTimes(1);
	});

	it("does not warn when detecting 'app' meta if twitter.card is set to 'app'", () => {
		let { getSeo } = initSeo();
		getSeo({
			twitter: {
				card: "app",
				app: {
					name: "Hello",
					url: { iPad: "https://b.com" },
					id: { iPad: "2" },
				},
			},
		});
		expect(console.warn).not.toHaveBeenCalled();
	});

	it("warns when detecting 'app' meta if twitter.card is set to 'player'", () => {
		let { getSeo } = initSeo();
		getSeo({
			twitter: {
				card: "player",
				app: {
					name: "Hello",
					url: { iPad: "https://b.com" },
					id: { iPad: "2" },
				},
			},
		});
		expect(console.warn).toHaveBeenCalledTimes(1);
	});

	it("warns when detecting 'app' meta if twitter.card is set to 'summary'", () => {
		let { getSeo } = initSeo();
		getSeo({
			twitter: {
				card: "summary",
				app: {
					name: "Hello",
					url: { iPad: "https://b.com" },
					id: { iPad: "2" },
				},
			},
		});
		expect(console.warn).toHaveBeenCalledTimes(1);
	});

	it("warns when detecting 'app' meta if twitter.card is set to 'summary_large_image'", () => {
		let { getSeo } = initSeo();
		getSeo({
			twitter: {
				card: "summary_large_image",
				app: {
					name: "Hello",
					url: { iPad: "https://b.com" },
					id: { iPad: "2" },
				},
			},
		});
		expect(console.warn).toHaveBeenCalledTimes(1);
	});
});
