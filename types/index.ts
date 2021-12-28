// Dependencies
import type { HtmlLinkDescriptor } from "@remix-run/react/links";
import type { HtmlMetaDescriptor } from "@remix-run/react/routeModules";
import type { RouteData } from "@remix-run/react/routeData";
import type { Location } from "history";
import type { Params } from "react-router-dom";
import type { AppData } from "remix";

interface FacebookMeta {
	appId?: string;
}

interface LanguageAlternate {
	hrefLang: string;
	href: string;
}

interface MobileAlternate {
	media: string;
	href: string;
}

interface OpenGraphArticle {
	authors?: string[];
	expirationTime?: string;
	modifiedTime?: string;
	publishedTime?: string;
	section?: string;
	tags?: string[];
}

interface OpenGraphBook {
	authors?: string[];
	isbn?: string;
	releaseDate?: string;
	tags?: string[];
}

interface OpenGraphMedia {
	alt: string;
	height?: number;
	secureUrl?: string;
	type?: string;
	url: string;
	width?: number;
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

interface OpenGraphVideo {
	actors?: OpenGraphVideoActors[];
	directors?: string[];
	duration?: number;
	releaseDate?: string;
	series?: string;
	tags?: string[];
	writers?: string[];
}

interface OpenGraphVideoActors {
	profile: string;
	role?: string;
}

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
	maxImagePreview?: "none" | "standard" | "large";
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

/**
 * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
 */
interface TwitterMeta {
	/**
	 * The card type. Used with all cards.
	 */
	card?: TwitterCardType;
	/**
	 * The @username of content creator, which may be different than the @username
	 * of the site itself. Used with `summary_large_image` cards.
	 */
	creator?: string | { id: string };
	/**
	 * Description of content (maximum 200 characters). Used with `summary`,
	 * `summary_large_image`, and `player` cards.
	 */
	description?: string;
	/**
	 * The @username of the website. Used with `summary`, `summary_large_image`,
	 * `app`, and `player` cards
	 */
	site?: string | { id: string };
	/**
	 * Title of content (max 70 characters). Used with `summary`, `summary_large_image`, and `player` cards
	 */
	title?: string;
	/**
	 * The image to use in the card. Images must be less than 5MB in size. JPG,
	 * PNG, WEBP and GIF formats are supported. Only the first frame of an
	 * animated GIF will be used. SVG is not supported. Used with `summary`,
	 * `summary_large_image`, and `player` cards.
	 */
	image?: TwitterImageMeta;
	/**
	 * The video player to use in the card. Used with the `player` card.
	 */
	player?: TwitterPlayerMeta;
	/**
	 * Meta used with the `app` card.
	 */
	app?: TwitterAppMeta;
}

type TwitterCardType = "app" | "player" | "summary" | "summary_large_image";

interface TwitterImageMeta {
	/**
	 * The URL of the image to use in the card. This must be an absolute URL,
	 * *not* a relative path.
	 */
	url: string;
	/**
	 * A text description of the image conveying the essential nature of an image
	 * to users who are visually impaired. Maximum 420 characters.
	 */
	alt: string;
}

interface TwitterPlayerMeta {
	/**
	 * The URL to the player iframe. This must be an absolute URL, *not* a
	 * relative path.
	 */
	url: string;
	/**
	 * The URL to raw video or audio stream. This must be an absolute URL, *not* a
	 * relative path.
	 */
	stream?: string;
	/**
	 * Height of the player iframe in pixels.
	 */
	height?: number;
	/**
	 * Width of the player iframe in pixels.
	 */
	width?: number;
}

interface TwitterAppMeta {
	name: string | { iPhone?: string; iPad?: string; googlePlay?: string };
	id: { iPhone?: string; iPad?: string; googlePlay?: string };
	url: { iPhone?: string; iPad?: string; googlePlay?: string };
}

interface SeoConfig {
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

interface RouteArgs {
	data: AppData;
	parentsData: RouteData;
	params: Params<string>;
	location: Location;
}

interface SeoBaseFunction<Return> {
	(config?: SeoConfig): Return;
	(
		config: SeoConfig | ((routeArgs?: RouteArgs) => SeoConfig),
		routeArgs: RouteArgs
	): Return;
}

interface SeoFunction
	extends SeoBaseFunction<[HtmlMetaDescriptor, HtmlLinkDescriptor[]]> {}

interface SeoMetaFunction extends SeoBaseFunction<HtmlMetaDescriptor> {}

interface SeoLinksFunction extends SeoBaseFunction<HtmlLinkDescriptor[]> {}

export type {
	RouteArgs,
	SeoConfig,
	SeoFunction,
	SeoLinksFunction,
	SeoMetaFunction,
	TwitterAppMeta,
	TwitterCardType,
	TwitterImageMeta,
	TwitterMeta,
	TwitterPlayerMeta,
};
