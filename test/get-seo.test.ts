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
		expect(meta).toEqual([
			{ name: "robots", content: "index,follow" },
			{ name: "googlebot", content: "index,follow" },
		]);
	});

	it("returns the correct title tags", () => {
		let meta = getSeo({ title: "Cheese and Crackers" });
		expect(meta).toEqual([
			{ title: "Cheese and Crackers" },
			{ property: "og:title", content: "Cheese and Crackers" },
			{ name: "robots", content: "index,follow" },
			{ name: "googlebot", content: "index,follow" },
		]);
	});

	it("returns the correct description tags", () => {
		let meta = getSeo({ description: "Cheese and Crackers" });
		expect(meta).toEqual([
			{ name: "description", content: "Cheese and Crackers" },
			{ property: "og:description", content: "Cheese and Crackers" },
			{ name: "robots", content: "index,follow" },
			{ name: "googlebot", content: "index,follow" },
		]);
	});

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
		expect(meta).toEqual([
			{ title: "Best website ever | Cool" },
			{
				name: "description",
				content: "This is a really great website ya dork",
			},
			{ tagName: "link", rel: "canonical", href: "https://somewhere.com" },
			{ property: "og:site_name", content: "Best website ever, yeah!" },
			{ property: "og:title", content: "Best website ever | Cool" },
			{
				property: "og:description",
				content: "This is a really great website ya dork",
			},
			{ property: "og:url", content: "https://somewhere.com" },
			{
				property: "og:image",
				content: "https://somewhere.com/fake-path.jpg",
			},
			{ property: "og:image:alt", content: "fake!" },
			{ property: "og:image:type", content: "jpg" },
			{ property: "og:image:height", content: "200" },
			{ name: "twitter:title", content: "Best website ever | Cool" },
			{
				name: "twitter:description",
				content: "This is a really great website ya dork",
			},
			{ name: "twitter:card", content: "summary" },
			{
				name: "twitter:image",
				content: "https://somewhere.com/fake-path.jpg",
			},
			{ name: "twitter:image:alt", content: "fake!" },
			{ property: "fb:app_id", content: "12345" },
			{ name: "robots", content: "noindex,nofollow" },
			{ name: "googlebot", content: "noindex,nofollow" },
		]);
	});
});

describe("init with default options", () => {
	let { getSeo } = initSeo({
		title: "Cheese and Crackers",
		description: "A great website about eating delicious cheese and crackers.",
		titleTemplate: "%s | Cheese and Crackers",
		canonical: "https://somewhere-a.com",
	});

	it("returns meta with defaults when called without arguments", () => {
		let meta = getSeo();
		expect(meta).toEqual([
			{ title: "Cheese and Crackers | Cheese and Crackers" },
			{
				name: "description",
				content: "A great website about eating delicious cheese and crackers.",
			},
			{
				tagName: "link",
				rel: "canonical",
				href: "https://somewhere-a.com",
			},
			{
				property: "og:title",
				content: "Cheese and Crackers | Cheese and Crackers",
			},
			{
				property: "og:description",
				content: "A great website about eating delicious cheese and crackers.",
			},
			{
				property: "og:url",
				content: "https://somewhere-a.com",
			},
			{ name: "robots", content: "index,follow" },
			{ name: "googlebot", content: "index,follow" },
		]);
	});

	it("returns the correct title tags", () => {
		let meta = getSeo({ title: "About Us" });
		expect(meta).toEqual([
			{ title: "About Us | Cheese and Crackers" },
			{
				name: "description",
				content: "A great website about eating delicious cheese and crackers.",
			},
			{
				tagName: "link",
				rel: "canonical",
				href: "https://somewhere-a.com",
			},
			{
				property: "og:title",
				content: "About Us | Cheese and Crackers",
			},
			{
				property: "og:description",
				content: "A great website about eating delicious cheese and crackers.",
			},
			{
				property: "og:url",
				content: "https://somewhere-a.com",
			},
			{ name: "robots", content: "index,follow" },
			{ name: "googlebot", content: "index,follow" },
		]);
	});

	it("returns the correct description tags", () => {
		let meta = getSeo({ description: "Let's talk about cheese" });
		expect(meta).toEqual([
			{ title: "Cheese and Crackers | Cheese and Crackers" },
			{
				name: "description",
				content: "Let's talk about cheese",
			},
			{
				tagName: "link",
				rel: "canonical",
				href: "https://somewhere-a.com",
			},
			{
				property: "og:title",
				content: "Cheese and Crackers | Cheese and Crackers",
			},
			{
				property: "og:description",
				content: "Let's talk about cheese",
			},
			{
				property: "og:url",
				content: "https://somewhere-a.com",
			},
			{ name: "robots", content: "index,follow" },
			{ name: "googlebot", content: "index,follow" },
		]);
	});
});

describe("twitter config", () => {
	let warn = console.warn;
	beforeEach(() => {
		console.warn = vi.fn();
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

	it("does not warn when detecting 'player' meta if twitter.card is set to 'player'", () => {
		getSeo({
			twitter: {
				card: "player",
				player: { url: "https://c.com" },
			},
		});
		expect(console.warn).not.toHaveBeenCalled();
	});

	it("warns when detecting 'player' meta if twitter.card is set to 'app'", () => {
		getSeo({
			twitter: {
				card: "app",
				player: { url: "https://c.com" },
			},
		});
		expect(console.warn).toHaveBeenCalledTimes(1);
	});

	it("warns when detecting 'player' meta if twitter.card is set to 'summary'", () => {
		getSeo({
			twitter: {
				card: "summary",
				player: { url: "https://c.com" },
			},
		});
		expect(console.warn).toHaveBeenCalledTimes(1);
	});

	it("warns when detecting 'player' meta if twitter.card is set to 'summary_large_image'", () => {
		getSeo({
			twitter: {
				card: "summary_large_image",
				player: { url: "https://c.com" },
			},
		});
		expect(console.warn).toHaveBeenCalledTimes(1);
	});

	it("does not warn when detecting 'app' meta if twitter.card is set to 'app'", () => {
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
