import merge from "just-merge";

// TODO: Use the correct types exported from Remix. Blocked for now b/c of
// internal type issues due to breaking changes in history. Should be fixed in
// the next Remix release that uses RR v6 stable.

// import type { HtmlLinkDescriptor } from "@remix-run/react/links";
// import { MetaDescriptor } from "@remix-run/react/routeModules";

interface HtmlLinkDescriptor {
	/**
	 * Address of the hyperlink
	 */
	href: string;
	/**
	 * How the element handles crossorigin requests
	 */
	crossOrigin?: "anonymous" | "use-credentials";
	/**
	 * Relationship between the document containing the hyperlink and the destination resource
	 */
	rel:
		| "alternate"
		| "dns-prefetch"
		| "icon"
		| "manifest"
		| "modulepreload"
		| "next"
		| "pingback"
		| "preconnect"
		| "prefetch"
		| "preload"
		| "prerender"
		| "search"
		| "stylesheet"
		| string;
	/**
	 * Applicable media: "screen", "print", "(max-width: 764px)"
	 */
	media?: string;
	/**
	 * Integrity metadata used in Subresource Integrity checks
	 */
	integrity?: string;
	/**
	 * Language of the linked resource
	 */
	hrefLang?: string;
	/**
	 * Hint for the type of the referenced resource
	 */
	type?: string;
	/**
	 * Referrer policy for fetches initiated by the element
	 */
	referrerPolicy?:
		| ""
		| "no-referrer"
		| "no-referrer-when-downgrade"
		| "same-origin"
		| "origin"
		| "strict-origin"
		| "origin-when-cross-origin"
		| "strict-origin-when-cross-origin"
		| "unsafe-url";
	/**
	 * Sizes of the icons (for rel="icon")
	 */
	sizes?: string;
	/**
	 * Images to use in different situations, e.g., high-resolution displays, small monitors, etc. (for rel="preload")
	 */
	imagesrcset?: string;
	/**
	 * Image sizes for different page layouts (for rel="preload")
	 */
	imagesizes?: string;
	/**
	 * Potential destination for a preload request (for rel="preload" and rel="modulepreload")
	 */
	as?:
		| "audio"
		| "audioworklet"
		| "document"
		| "embed"
		| "fetch"
		| "font"
		| "frame"
		| "iframe"
		| "image"
		| "manifest"
		| "object"
		| "paintworklet"
		| "report"
		| "script"
		| "serviceworker"
		| "sharedworker"
		| "style"
		| "track"
		| "video"
		| "worker"
		| "xslt"
		| string;
	/**
	 * Color to use when customizing a site's icon (for rel="mask-icon")
	 */
	color?: string;
	/**
	 * Whether the link is disabled
	 */
	disabled?: boolean;
	/**
	 * The title attribute has special semantics on this element: Title of the link; CSS style sheet set name.
	 */
	title?: string;
}

interface MetaDescriptor {
	[name: string]: string | string[];
}

// TODO: Delete the types above when we can import them from Remix

/**
 * A function for setting default SEO meta for Remix sites and returns a new
 * function to use on the site's routes.
 *
 * @param defaultConfig - The default configuration object. The returned
 * function will merge its own config with the default config when called on a
 * specific route.
 */
export function getSeo(defaultConfig?: SeoConfig): SeoFunction {
	return function seo(cfg = {}) {
		let meta: MetaDescriptor = {};
		let links: HtmlLinkDescriptor[] = [];

		let config: SeoConfig = defaultConfig ? merge(defaultConfig, cfg) : cfg;
		let title = getSeoTitle(config);
		let {
			canonical,
			description,
			facebook,
			languageAlternates = [],
			mobileAlternate,
			omitGoogleBotMeta = false,
			openGraph,
			robots = {},
			twitter,
		} = config;

		if (title) {
			meta.title = title;
		}

		if (description) {
			meta.description = description;
		}

		// Robots
		let {
			maxImagePreview,
			maxSnippet,
			maxVideoPreview,
			noArchive,
			noFollow,
			noImageIndex,
			noIndex,
			noSnippet,
			noTranslate,
			unavailableAfter,
		} = robots;

		let robotsParams = [
			noArchive && "noarchive",
			noImageIndex && "noimageindex",
			noSnippet && "nosnippet",
			noTranslate && `notranslate`,
			maxImagePreview && `max-image-preview:${maxImagePreview}`,
			maxSnippet && `max-snippet:${maxSnippet}`,
			maxVideoPreview && `max-video-preview:${maxVideoPreview}`,
			unavailableAfter && `unavailable_after:${unavailableAfter}`,
		];

		let robotsParam =
			(noIndex ? "noindex" : "index") +
			"," +
			(noFollow ? "nofollow" : "follow");

		for (let param of robotsParams) {
			if (param) {
				robotsParam += `,${param}`;
			}
		}

		meta.robots = robotsParam;
		if (!omitGoogleBotMeta) {
			meta.googlebot = meta.robots;
		}

		// <link rel="alternate">
		if (mobileAlternate) {
			if (!mobileAlternate.media || !mobileAlternate.href) {
				warn(
					"`mobileAlternate` requires both the `media` and `href` attributes for it to generate the correct link tags. This config setting currently has no effect. Either add the missing keys or remove `mobileAlternate` from your config to dismiss this warning." +
						// TODO: See if we can find a better description of this tag w/o all
						// the marketing junk. MDN is a bit scant here.
						"\n\nSee https://www.contentkingapp.com/academy/link-rel/#mobile-lok for a description of the tag this option generates."
				);
			} else {
				links.push({
					rel: "alternate",
					media: mobileAlternate.media,
					href: mobileAlternate.href,
				});
			}
		}

		if (languageAlternates.length > 0) {
			for (let languageAlternate of languageAlternates) {
				if (!languageAlternate.hrefLang || !languageAlternate.href) {
					warn(
						"Items in `languageAlternates` requires both the `hrefLang` and `href` attributes for it to generate the correct link tags. One of your items in this config setting is missing an attribute and was skipped. Either add the missing keys or remove the incomplete object from the `languageAlternate` key in your config to dismiss this warning." +
							// TODO: See if we can find a better description of this tag w/o all
							// the marketing junk. MDN is a bit scant here.
							"\n\nSee https://www.contentkingapp.com/academy/link-rel/#hreflang-look-like for a description of the tag this option generates."
					);
				} else {
					links.push({
						rel: "alternate",
						hrefLang: languageAlternate.hrefLang,
						href: languageAlternate.href,
					});
				}
			}
		}

		// OG: Twitter
		if (twitter) {
			if (twitter.title || title) {
				meta["twitter:title"] = twitter.title || title;
			}

			if (twitter.description || openGraph?.description || description) {
				meta["twitter:description"] =
					twitter.description || openGraph?.description || description!;
			}

			if (twitter.card) {
				meta["twitter:card"] = twitter.card;
			}

			if (twitter.site) {
				meta["twitter:site"] = twitter.site;
			}

			if (twitter.creator) {
				meta["twitter:creator"] = twitter.creator;
			}

			if (twitter.image && twitter.image.url) {
				warnIfInvalidUrl(
					twitter.image.url,
					`The Twitter image tag must be a valid, absolute URL. Relative paths will not work as expected. Check the config's \`twitter.image.url\` value.`
				);
				meta["twitter:image"] = twitter.image.url;
				if (twitter.image.alt) {
					meta["twitter:image:alt"] = twitter.image.url;
				} else {
					warn(
						"A Twitter image should use alt text that describes the image. This is important for users who are visually impaired. Please add a text value to the `alt` key of the `twitter.image` config option to dismiss this warning."
					);
				}

				if (!meta["twitter:card"]) {
					meta["twitter:card"] = "summary";
				}
			}
		}

		// OG: Facebook
		if (facebook) {
			if (facebook.appId) {
				meta["fb:app_id"] = facebook.appId;
			}
		}

		// OG: Other stuff
		if (openGraph?.title || config.title) {
			meta["og:title"] = openGraph?.title || title;
		}

		if (openGraph?.description || description) {
			meta["og:description"] = openGraph?.description || description!;
		}

		if (openGraph) {
			if (openGraph.url || canonical) {
				if (openGraph.url) {
					warnIfInvalidUrl(
						openGraph.url,
						`The og:url tag must be a valid, absolute URL. Relative paths will not work as expected. Check the config's \`openGraph.url\` value.`
					);
				}
				if (canonical) {
					warnIfInvalidUrl(
						canonical,
						`The og:url tag must be a valid, absolute URL. Relative paths will not work as expected. Check the config's \`canonical\` value.`
					);
				}

				meta["og:url"] = openGraph.url || canonical!;
			}

			if (openGraph.type) {
				const ogType = openGraph.type.toLowerCase();

				meta["og:type"] = ogType;

				if (ogType === "profile" && openGraph.profile) {
					if (openGraph.profile.firstName) {
						meta["profile:first_name"] = openGraph.profile.firstName;
					}

					if (openGraph.profile.lastName) {
						meta["profile:last_name"] = openGraph.profile.lastName;
					}

					if (openGraph.profile.username) {
						meta["profile:username"] = openGraph.profile.username;
					}

					if (openGraph.profile.gender) {
						meta["profile:gender"] = openGraph.profile.gender;
					}
				} else if (ogType === "book" && openGraph.book) {
					if (openGraph.book.authors && openGraph.book.authors.length) {
						for (let author of openGraph.book.authors) {
							if (Array.isArray(meta["book:author"])) {
								meta["book:author"].push(author);
							} else {
								meta["book:author"] = [author];
							}
						}
					}

					if (openGraph.book.isbn) {
						meta["book:isbn"] = openGraph.book.isbn;
					}

					if (openGraph.book.releaseDate) {
						meta["book:release_date"] = openGraph.book.releaseDate;
					}

					if (openGraph.book.tags && openGraph.book.tags.length) {
						for (let tag of openGraph.book.tags) {
							if (Array.isArray(meta["book:tag"])) {
								meta["book:tag"].push(tag);
							} else {
								meta["book:tag"] = [tag];
							}
						}
					}
				} else if (ogType === "article" && openGraph.article) {
					if (openGraph.article.publishedTime) {
						meta["article:published_time"] = openGraph.article.publishedTime;
					}

					if (openGraph.article.modifiedTime) {
						meta["article:modified_time"] = openGraph.article.modifiedTime;
					}

					if (openGraph.article.expirationTime) {
						meta["article:expiration_time"] = openGraph.article.expirationTime;
					}

					if (openGraph.article.authors && openGraph.article.authors.length) {
						for (let author of openGraph.article.authors) {
							if (Array.isArray(meta["article:author"])) {
								meta["article:author"].push(author);
							} else {
								meta["article:author"] = [author];
							}
						}
					}

					if (openGraph.article.section) {
						meta["article:section"] = openGraph.article.section;
					}

					if (openGraph.article.tags && openGraph.article.tags.length) {
						for (let tag of openGraph.article.tags) {
							if (Array.isArray(meta["article:tag"])) {
								meta["article:tag"].push(tag);
							} else {
								meta["article:tag"] = [tag];
							}
						}
					}
				} else if (
					(ogType === "video.movie" ||
						ogType === "video.episode" ||
						ogType === "video.tv_show" ||
						ogType === "video.other") &&
					openGraph.video
				) {
					if (openGraph.video.actors && openGraph.video.actors.length) {
						for (let actor of openGraph.video.actors) {
							if (actor.profile) {
								meta["video:actor"] = actor.profile;
							}

							if (actor.role) {
								meta["video:actor:role"] = actor.role;
							}
						}
					}

					if (openGraph.video.directors && openGraph.video.directors.length) {
						for (let director of openGraph.video.directors) {
							meta["video:director"] = director;
						}
					}

					if (openGraph.video.writers && openGraph.video.writers.length) {
						for (let writer of openGraph.video.writers) {
							meta["video:writer"] = writer;
						}
					}

					if (openGraph.video.duration) {
						meta["video:duration"] = openGraph.video.duration.toString();
					}

					if (openGraph.video.releaseDate) {
						meta["video:release_date"] = openGraph.video.releaseDate;
					}

					if (openGraph.video.tags && openGraph.video.tags.length) {
						for (let tag of openGraph.video.tags) {
							meta["video:tag"] = tag;
						}
					}

					if (openGraph.video.series) {
						meta["video:series"] = openGraph.video.series;
					}
				}
			}

			if (openGraph.images && openGraph.images.length) {
				for (let image of openGraph.images) {
					warnIfInvalidUrl(
						image.url,
						`The og:image tag must be a valid, absolute URL. Relative paths will not work as expected. Check each \`url\` value in the config's \`openGraph.images\` array.`
					);
					meta["og:image"] = image.url;
					if (image.alt) {
						meta["og:image:alt"] = image.alt;
					} else {
						warn(
							"OpenGraph images should use alt text that describes the image. This is important for users who are visually impaired. Please add a text value to the `alt` key of all `openGraph.images` config options to dismiss this warning."
						);
					}

					if (image.secureUrl) {
						warnIfInvalidUrl(
							image.secureUrl,
							`The og:image:secure_url tag must be a valid, absolute URL. Relative paths will not work as expected. Check each \`secureUrl\` value in the config's \`openGraph.images\` array.`
						);
						meta["og:image:secure_url"] = image.secureUrl.toString();
					}

					if (image.type) {
						meta["og:image:type"] = image.type.toString();
					}

					if (image.width) {
						meta["og:image:width"] = image.width.toString();
					}

					if (image.height) {
						meta["og:image:height"] = image.height.toString();
					}
				}
			}

			if (openGraph.videos && openGraph.videos.length) {
				for (let video of openGraph.videos) {
					warnIfInvalidUrl(
						video.url,
						`The og:video tag must be a valid, absolute URL. Relative paths will not work as expected. Check each \`url\` value in the config's \`openGraph.videos\` array.`
					);
					meta["og:video"] = video.url;
					if (video.alt) {
						meta["og:video:alt"] = video.alt;
					}

					if (video.secureUrl) {
						warnIfInvalidUrl(
							video.secureUrl,
							`The og:video:secure_url tag must be a valid, absolute URL. Relative paths will not work as expected. Check each \`secureUrl\` value in the config's \`openGraph.videos\` array.`
						);
						meta["og:video:secure_url"] = video.secureUrl.toString();
					}

					if (video.type) {
						meta["og:video:type"] = video.type.toString();
					}

					if (video.width) {
						meta["og:video:width"] = video.width.toString();
					}

					if (video.height) {
						meta["og:video:height"] = video.height.toString();
					}
				}
			}

			if (openGraph.locale) {
				meta["og:locale"] = openGraph.locale;
			}

			if (openGraph.siteName) {
				meta["og:site_name"] = openGraph.siteName;
			}
		}

		if (canonical) {
			warnIfInvalidUrl(
				canonical,
				`The canonical link tag must have an \`href\` with a valid, absolute URL. Relative paths will not work as expected. Check the config's \`canonical\` value.`
			);
			links.push({
				rel: "canonical",
				href: canonical,
			});
		}

		return [meta, links];
	};
}

export default getSeo;

function getSeoTitle(config: SeoConfig): string {
	let bypassTemplate = config.bypassTemplate || false;
	let templateTitle = config.titleTemplate || "";
	let updatedTitle = "";
	if (config.title) {
		updatedTitle = config.title;
		if (templateTitle && !bypassTemplate) {
			updatedTitle = templateTitle.replace(/%s/g, () => updatedTitle);
		}
	} else if (config.defaultTitle) {
		updatedTitle = config.defaultTitle;
	}
	return updatedTitle;
}

function warn(message: string): void {
	if (typeof console !== "undefined") console.warn(message);
	try {
		// This error is thrown as a convenience so you can more easily
		// find the source for a warning that appears in the console by
		// enabling "pause on exceptions" in your JavaScript debugger.
		throw new Error(message);
	} catch (e) {}
}

function warnIfInvalidUrl(str: string, warning: string) {
	try {
		new URL(str);
	} catch (_) {
		warn("remix-seo: " + warning);
	}
}

interface OpenGraphMedia {
	alt: string;
	height?: number;
	secureUrl?: string;
	type?: string;
	url: string;
	width?: number;
}

interface OpenGraphVideoActors {
	profile: string;
	role?: string;
}

interface OpenGraphMeta {
	article?: OpenGraphArticle;
	book?: OpenGraphBook;
	defaultImageHeight?: number;
	defaultImageWidth?: number;
	description?: string;
	images?: OpenGraphMedia[];
	locale?: string;
	profile?: OpenGraphProfile;
	siteName?: string;
	title?: string;
	type?: string;
	url?: string;
	video?: OpenGraphVideo;
	videos?: OpenGraphMedia[];
}

interface OpenGraphProfile {
	firstName?: string;
	lastName?: string;
	gender?: string;
	username?: string;
}

interface OpenGraphBook {
	authors?: string[];
	isbn?: string;
	releaseDate?: string;
	tags?: string[];
}

interface OpenGraphArticle {
	authors?: string[];
	expirationTime?: string;
	modifiedTime?: string;
	publishedTime?: string;
	section?: string;
	tags?: string[];
}

interface OpenGraphVideo {
	actors?: OpenGraphVideoActors[];
	directors?: string[];
	duration?: number;
	releaseDate?: string;
	series?: string;
	tags?: string[];
	writers?: string[];
}

interface TwitterMeta {
	card?: string;
	creator?: string;
	description?: string;
	site?: string;
	title?: string;
	image?: {
		url: string;
		alt: string;
	};
}

interface FacebookMeta {
	appId?: string;
}

interface MobileAlternate {
	media: string;
	href: string;
}

interface LanguageAlternate {
	hrefLang: string;
	href: string;
}

type ImagePrevSize = "none" | "standard" | "large";

/**
 * @see https://developers.google.com/search/docs/advanced/robots/robots_meta_tag
 */
interface RobotsOptions {
	/**
	 * Set the maximum size of an image preview for this page in a search results.
	 *
	 * If false, Google may show an image preview of the default size.
	 *
	 * Accepted values are:
	 *
	 * - **none:** No image preview is to be shown.
	 * - **standard:** A default image preview may be shown.
	 * - **large:** A larger image preview, up to the width of the viewport, may
	 *   be shown.
	 *
	 * This applies to all forms of search results (such as Google web search,
	 * Google Images, Discover, Assistant). However, this limit does not apply in
	 * cases where a publisher has separately granted permission for use of
	 * content. For instance, if the publisher supplies content in the form of
	 * in-page structured data (such as AMP and canonical versions of an article)
	 * or has a license agreement with Google, this setting will not interrupt
	 * those more specific permitted uses.
	 *
	 * If you don't want Google to use larger thumbnail images when their AMP
	 * pages and canonical version of an article are shown in Search or Discover,
	 * provide a value of `"standard"` or `"none"`.
	 */
	maxImagePreview?: ImagePrevSize;
	/**
	 * The maximum of number characters to use as a textual snippet for a search
	 * result. (Note that a URL may appear as multiple search results within a
	 * search results page.)
	 *
	 * This does **not** affect image or video previews. This applies to all forms
	 * of search results (such as Google web search, Google Images, Discover,
	 * Assistant). However, this limit does not apply in cases where a publisher
	 * has separately granted permission for use of content. For instance, if the
	 * publisher supplies content in the form of in-page structured data or has a
	 * license agreement with Google, this setting does not interrupt those more
	 * specific permitted uses. This directive is ignored if no parseable value is
	 * specified.
	 *
	 * Special values:
	 * - 0: No snippet is to be shown. Equivalent to nosnippet.
	 * - 1: Google will choose the snippet length that it believes is most
	 *   effective to help users discover your content and direct users to your
	 *   site.
	 *
	 * To specify that there's no limit on the number of characters that can be
	 * shown in the snippet, `maxSnippet` should be set to `-1`.
	 */
	maxSnippet?: number;
	/**
	 * The maximum number of seconds for videos on this page to show in search
	 * results.
	 *
	 * If false, Google may show a video snippet in search results and will decide
	 * how long the preview may be.
	 *
	 * Special values:
	 *
	 * - 0: At most, a static image may be used, in accordance to the
	 *   `maxImagePreview` setting.
	 * - 1: There is no limit.
	 *
	 * This applies to all forms of search results (at Google: web search, Google
	 * Images, Google Videos, Discover, Assistant).
	 */
	maxVideoPreview?: number;
	/**
	 * Do not show a cached link in search results.
	 *
	 * If false, Google may generate a cached page and users may access it through
	 * the search results.
	 */
	noArchive?: boolean;
	/**
	 * Do not follow the links on this page.
	 *
	 * If false, Google may use the links on the page to discover those linked
	 * pages.
	 *
	 * @see https://developers.google.com/search/docs/advanced/guidelines/qualify-outbound-links
	 */
	noFollow?: boolean;
	/**
	 * Do not index images on this page.
	 *
	 * If false, images on the page may be indexed and shown in search results.
	 */
	noImageIndex?: boolean;
	/**
	 * Do not show this page, media, or resource in search results.
	 *
	 * If false, the page, media, or resource may be indexed and shown in search
	 * results.
	 */
	noIndex?: boolean;
	/**
	 * Do not show a text snippet or video preview in the search results for this
	 * page. A static image thumbnail (if available) may still be visible, when it
	 * results in a better user experience. This applies to all forms of search
	 * results (at Google: web search, Google Images, Discover).
	 *
	 * If false, Google may generate a text snippet and video preview based on
	 * information found on the page.
	 */
	noSnippet?: boolean;
	/**
	 * Do not offer translation of this page in search results.
	 *
	 * If false, Google may show a link next to the result to help users view
	 * translated content on your page.
	 */
	noTranslate?: boolean;
	/**
	 * Do not show this page in search results after the specified date/time.
	 *
	 * The date/time must be specified in a widely adopted format including, but
	 * not limited to [RFC 822](http://www.ietf.org/rfc/rfc0822.txt), [RFC
	 * 850](http://www.ietf.org/rfc/rfc0850.txt), and [ISO
	 * 8601](https://www.iso.org/iso-8601-date-and-time-format.html). The
	 * directive is ignored if no valid date/time is specified.
	 *
	 * By default there is no expiration date for content.
	 */
	unavailableAfter?: string;
}

export interface SeoConfig {
	bypassTemplate?: boolean;
	canonical?: string;
	defaultTitle?: string;
	description?: string;
	facebook?: FacebookMeta;
	languageAlternates?: LanguageAlternate[];
	mobileAlternate?: MobileAlternate;
	omitGoogleBotMeta?: boolean;
	openGraph?: OpenGraphMeta;
	robots?: RobotsOptions;
	title?: string;
	titleTemplate?: string;
	twitter?: TwitterMeta;
}

export type SeoFunction = (
	config?: SeoConfig
) => [MetaDescriptor, HtmlLinkDescriptor[]];
