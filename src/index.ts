import merge from "just-merge";
import type {
	V2_MetaDescriptor as MetaDescriptor,
	V2_MetaArgs as MetaArgs,
} from "@remix-run/react";

/**
 * A function for setting default SEO meta for Remix sites.
 *
 * @param initConfig - The initial configuration object. Each of the returned
 * functions will merge their own config with the initial config when called on
 * a specific route.
 * @returns An object with methods to use for getting SEO metadata tags tags for
 * the site's routes.
 */
function initSeo(initConfig?: SeoInitConfig): {
	getSeo: SeoFunction;
} {
	const getSeo: SeoFunction = (
		config?: SeoConfig | ((routeArgs?: MetaArgs) => SeoConfig),
		metaArgs?: MetaArgs
	) => {
		let resolvedConfig = resolveConfig(initConfig, config, metaArgs);
		let meta = getMeta(resolvedConfig, metaArgs);
		return meta;
	};
	return { getSeo };
}

function getMeta(config: SeoResolvedConfig, metaArgs?: MetaArgs) {
	let meta: MetaDescriptor[] = [];
	let {
		title,
		twitter: twitterTitle,
		openGraph: openGraphTitle,
	} = getPageTitles(config);
	let {
		canonical,
		description,
		facebook = {},
		google = {},
		languageAlternates = [],
		mobileAlternate,
		openGraph = {},
		robots = {},
		twitter = {},
		silenceWarnings = false,
	} = config;

	if (title != null) {
		meta.push({ title });
	}

	if (description != null) {
		meta.push({ name: "description", content: description });
	}

	// <link rel="canonical">
	if (canonical != null) {
		warning(
			isValidUrl(canonical),
			"The canonical URL must be a valid, absolute URL. Relative paths will not " +
				"work as expected. Check the config's `canonical` value."
		);
		meta.push({ tagName: "link", rel: "canonical", href: canonical });
	}

	// <link rel="alternate">
	if (mobileAlternate) {
		warning(
			mobileAlternate.media != null && mobileAlternate.href != null,
			"`mobileAlternate` requires both the `media` and `href` attributes in order to " +
				"generate the correct link tags. This config setting currently has no effect. " +
				"Either add the missing keys or remove `mobileAlternate` from your config to " +
				"dismiss this warning.\n\n" +
				// TODO: See if we can find a better description of this tag w/o all
				// the marketing junk. MDN is a bit scant here.
				"See https://www.contentkingapp.com/academy/link-rel/#mobile-lok for a description of the tag this option generates."
		);

		meta.push({
			tagName: "link",
			rel: "alternate",
			media: mobileAlternate.media,
			href: mobileAlternate.href,
		});
	}

	for (let languageAlternate of languageAlternates) {
		warning(
			languageAlternate.hrefLang != null && languageAlternate.href != null,
			"Items in `languageAlternates` requires both the `hrefLang` and `href` " +
				"attributes in order to generate the correct link tags. One of your items " +
				"in this config setting is missing an attribute and was skipped. Either " +
				"add the missing keys or remove the incomplete object from the " +
				"`languageAlternate` key in your config to dismiss this warning.\n\n" +
				// TODO: See if we can find a better description of this tag w/o all
				// the marketing junk. MDN is a bit scant here.
				"See https://www.contentkingapp.com/academy/link-rel/#hreflang-look-like for a description of the tag this option generates."
		);
		meta.push({
			tagName: "link",
			rel: "alternate",
			hrefLang: languageAlternate.hrefLang,
			href: languageAlternate.href,
		});
	}

	if (openGraph) {
		// OpenGraph tags
		if (openGraph.siteName != null) {
			meta.push({ property: "og:site_name", content: openGraph.siteName });
		}

		if (openGraphTitle != null) {
			meta.push({ property: "og:title", content: openGraphTitle });
		}

		let ogDescription = openGraph.description ?? description;
		if (ogDescription != null) {
			meta.push({ property: "og:description", content: ogDescription });
		}

		if (openGraph.url != null) {
			warning(
				isValidUrl(openGraph.url),
				"The `og:url` tag must be a valid, absolute URL. Relative paths will " +
					"not work as expected. Check the config's `openGraph.url` value."
			);
		}
		let ogUrl = openGraph.url ?? canonical;
		if (ogUrl != null) {
			meta.push({ property: "og:url", content: ogUrl });
		}

		if (openGraph.type != null) {
			let ogType = openGraph.type.toLowerCase();
			meta.push({ property: "og:type", content: ogType });

			// https://ogp.me/#types
			switch (ogType) {
				// https://ogp.me/#type_music
				case "music.song": {
					let {
						duration,
						albums = [],
						musicians = [],
					} = (openGraph.music as OpenGraphMusicSong) || {};
					if (duration != null) {
						meta.push({ property: "music:duration", content: duration });
					}

					for (let album of albums) {
						if (album == null) continue;
						if (isString(album)) {
							meta.push({ property: "music:album", content: album });
							continue;
						}

						let { url, disc, track } = album || {};
						if (url != null) {
							meta.push({ property: "music:album", content: url });
						}
						if (disc != null) {
							meta.push({ property: "music:album:disc", content: disc });
						}
						if (track != null) {
							meta.push({ property: "music:album:track", content: disc });
						}
					}

					for (let musician of musicians) {
						if (musician == null) continue;
						if (isString(musician)) {
							meta.push({ property: "music:musician", content: musician });
						} else if (isObject(musician)) {
							if (musician.url != null) {
								meta.push({
									property: "music:musician",
									content: musician.url,
								});
							}
						}
					}

					break;
				}

				case "music.album": {
					let {
						musicians = [],
						releaseDate,
						songs = [],
					} = (openGraph.music as OpenGraphMusicAlbum) || {};

					for (let song of songs) {
						if (song == null) continue;
						if (isString(song)) {
							meta.push({ property: "music:song", content: song });
						} else if (isObject(song)) {
							let { url, disc, track } = song || {};
							if (url != null) {
								meta.push({ property: "music:song", content: url });
							}
							if (disc != null) {
								meta.push({ property: "music:song:disc", content: disc });
							}
							if (track != null) {
								meta.push({ property: "music:song:track", content: track });
							}
						}
					}

					for (let musician of musicians) {
						if (musician == null) continue;
						if (isString(musician)) {
							meta.push({ property: "music:musician", content: musician });
						} else if (isObject(musician)) {
							if (musician.url != null) {
								meta.push({
									property: "music:musician",
									content: musician.url,
								});
							}
						}
					}

					if (releaseDate != null) {
						meta.push({
							property: "music:release_date",
							content: isDate(releaseDate)
								? releaseDate.toISOString()
								: releaseDate,
						});
					}

					break;
				}

				case "music.playlist": {
					let { creators = [], songs = [] } =
						(openGraph.music as OpenGraphMusicPlaylist) || {};

					for (let creator of creators) {
						if (creator == null) continue;
						if (isString(creator)) {
							meta.push({ property: "music:creators", content: creator });
						} else if (isObject(creator)) {
							let { url } = creator;
							if (url != null) {
								meta.push({ property: "music:creators", content: url });
							}
						}
					}

					for (let song of songs) {
						if (song == null) continue;
						if (isString(song)) {
							meta.push({ property: "music:song", content: song });
						} else if (isObject(song)) {
							let { url, disc, track } = song || {};
							if (url != null) {
								meta.push({ property: "music:song", content: url });
							}
							if (disc != null) {
								meta.push({ property: "music:song:disc", content: disc });
							}
							if (track != null) {
								meta.push({ property: "music:song:track", content: track });
							}
						}
					}

					break;
				}

				case "music.radio_station": {
					let { creators = [] } =
						(openGraph.music as OpenGraphMusicRadioStation) || {};

					for (let creator of creators) {
						if (creator == null) continue;
						if (isString(creator)) {
							meta.push({ property: "music:creators", content: creator });
						} else if (isObject(creator)) {
							let { url } = creator;
							if (url != null) {
								meta.push({ property: "music:creators", content: url });
							}
						}
					}

					break;
				}

				// https://ogp.me/#type_video
				case "video.movie":
				case "video.episode":
				case "video.tv_show":
				case "video.other": {
					let {
						actors = [],
						directors = [],
						duration,
						releaseDate,
						series,
						tags = [],
						writers = [],
					} = openGraph.video || {};

					for (let actor of actors) {
						if (actor == null) continue;
						if (isString(actor)) {
							meta.push({ property: "video:actor", content: actor });
						} else if (isObject(actor)) {
							let { url, role } = actor;
							if (url != null) {
								meta.push({ property: "video:actor", content: url });
							}
							if (role != null) {
								meta.push({ property: "video:actor:role", content: role });
							}
						}
					}

					for (let director of directors) {
						if (director == null) continue;
						if (isString(director)) {
							meta.push({ property: "video:director", content: director });
						} else if (isObject(director)) {
							let { url } = director;
							if (url != null) {
								meta.push({ property: "video:director", content: url });
							}
						}
					}

					for (let writer of writers) {
						if (writer == null) continue;
						if (isString(writer)) {
							meta.push({ property: "video:writer", content: writer });
						} else if (isObject(writer)) {
							let { url } = writer;
							if (url != null) {
								meta.push({ property: "video:writer", content: url });
							}
						}
					}

					if (duration != null) {
						meta.push({ property: "video:duration", content: duration });
					}

					if (releaseDate != null) {
						meta.push({
							property: "video:release_date",
							content: isDate(releaseDate)
								? releaseDate.toISOString()
								: releaseDate,
						});
					}

					for (let tag of tags) {
						if (tag != null) {
							meta.push({ property: "video:tag", content: tag });
						}
					}

					if (series != null) {
						meta.push({ property: "video:series", content: series });
					}
					break;
				}

				// https://ogp.me/#no_vertical
				// https://ogp.me/#type_article
				case "article": {
					let {
						authors = [],
						publishedTime,
						modifiedTime,
						expirationTime,
						section,
						tags = [],
					} = openGraph.article || {};

					for (let author of authors) {
						if (author != null) {
							meta.push({ property: "article:author", content: author });
						}
					}

					if (publishedTime != null) {
						meta.push({
							property: "article:published_time",
							content: publishedTime,
						});
					}

					if (modifiedTime != null) {
						meta.push({
							property: "article:modified_time",
							content: modifiedTime,
						});
					}

					if (expirationTime != null) {
						meta.push({
							property: "article:expiration_time",
							content: expirationTime,
						});
					}

					if (section != null) {
						meta.push({ property: "article:section", content: section });
					}

					for (let tag of tags) {
						if (tag != null) {
							meta.push({ property: "article:tag", content: tag });
						}
					}

					break;
				}

				// https://ogp.me/#type_book
				case "book": {
					let {
						authors = [],
						isbn,
						releaseDate,
						tags = [],
					} = openGraph.book || {};
					for (let author of authors) {
						if (author != null) {
							meta.push({ property: "book:author", content: author });
						}
					}

					if (isbn != null) {
						meta.push({ property: "book:isbn", content: isbn });
					}

					if (releaseDate != null) {
						meta.push({
							property: "book:release_date",
							content: isDate(releaseDate)
								? releaseDate.toISOString()
								: releaseDate.toString(),
						});
					}

					for (let tag of tags) {
						if (tag != null) {
							meta.push({ property: "book:tag", content: tag });
						}
					}

					break;
				}

				// https://ogp.me/#type_profile
				case "profile": {
					let { firstName, lastName, username, gender } =
						openGraph.profile || {};
					if (firstName != null) {
						meta.push({ property: "profile:first_name", content: firstName });
					}

					if (lastName != null) {
						meta.push({ property: "profile:last_name", content: lastName });
					}

					if (username != null) {
						meta.push({ property: "profile:username", content: username });
					}

					if (gender != null) {
						meta.push({ property: "profile:gender", content: gender });
					}
					break;
				}

				// https://ogp.me/#type_website
				case "website": {
					break;
				}

				default:
					// unknown type, check the config for a custom type key and allow
					// arbitrary values
					break;
			}
		}

		if (openGraph.images?.length) {
			for (let image of openGraph.images) {
				if (image == null) continue;
				warning(
					!isValidUrl(image.url),
					"The og:image tag must be a valid, absolute URL. Relative paths will not " +
						"work as expected. Check each `url` value in the config's " +
						"openGraph.images` array."
				);
				warning(
					image.alt != null,
					"OpenGraph images should use alt text that describes the image. This is " +
						"important for users who are visually impaired. Please add a text " +
						"value to the `alt` key of all `openGraph.images` in your config to " +
						"dismiss this warning."
				);

				meta.push({ property: "og:image", content: image.url });
				if (image.alt != null) {
					meta.push({ property: "og:image:alt", content: image.alt });
				}

				if (image.secureUrl != null) {
					warning(
						!isValidUrl(image.secureUrl),
						"The og:image:secure_url tag must be a valid, absolute URL. Relative paths will " +
							"not work as expected. Check each `secureUrl` value in the config's " +
							"openGraph.images` array."
					);
					meta.push({
						property: "og:image:secure_url",
						content: image.secureUrl,
					});
				}

				if (image.type != null) {
					meta.push({ property: "og:image:type", content: image.type });
				}

				if (image.width != null) {
					meta.push({
						property: "og:image:width",
						content: String(image.width),
					});
				}

				if (image.height != null) {
					meta.push({
						property: "og:image:height",
						content: String(image.height),
					});
				}
			}
		}

		if (openGraph.videos && openGraph.videos.length) {
			for (let video of openGraph.videos) {
				warning(
					!isValidUrl(video.url),
					"The `og:video` tag tag must be a valid, absolute URL. Relative paths will " +
						"not work as expected. Check each `url` value in the config's " +
						"`openGraph.videos` array."
				);
				meta.push({ property: "og:video", content: video.url });
				if (video.alt != null) {
					meta.push({ property: "og:video:alt", content: video.alt });
				}

				if (video.secureUrl != null) {
					warning(
						!isValidUrl(video.url),
						"The `og:video:secure_url` tag tag must be a valid, absolute URL. Relative paths will " +
							"not work as expected. Check each `secureUrl` value in the config's " +
							"`openGraph.videos` array."
					);
					meta.push({
						property: "og:video:secure_url",
						content: video.secureUrl,
					});
				}

				if (video.type != null) {
					meta.push({ property: "og:video:type", content: video.type });
				}

				if (video.width != null) {
					meta.push({
						property: "og:video:width",
						content: String(video.width),
					});
				}

				if (video.height != null) {
					meta.push({
						property: "og:video:height",
						content: String(video.height),
					});
				}
			}
		}

		if (openGraph.locale != null) {
			meta.push({ property: "og:locale", content: openGraph.locale });
		}
	}

	// https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started#started
	if (twitter) {
		let twitterCardIsSet = false;
		if (twitterTitle != null) {
			meta.push({ name: "twitter:title", content: twitterTitle });
		}

		let twitterDesc =
			twitter.description ?? openGraph?.description ?? description;
		if (twitterDesc != null) {
			meta.push({ name: "twitter:description", content: twitterDesc });
		}

		let twitterSite = isObject(twitter.site) ? twitter.site.id : twitter.site;
		if (twitterSite != null) {
			meta.push({ name: "twitter:site", content: twitterSite });
		}

		let twitterCreator = isObject(twitter.creator)
			? twitter.creator.id
			: twitter.creator;
		if (twitterCreator != null) {
			meta.push({ name: "twitter:creator", content: twitterCreator });
		}

		warning(
			twitter.card == null || isValidTwitterCardType(twitter.card),
			"The `twitter.card` config value must be one of the following: " +
				`'summary', 'summary_large_image', 'app', or 'player'. Received: ` +
				`'${twitter.card}'.`
		);

		if (hasTwitterImageMeta(twitter)) {
			let twitterCard = twitter.card ?? "summary";
			meta.push({ name: "twitter:card", content: twitterCard });
			twitterCardIsSet = true;
			warning(
				twitterCard === "summary" || twitterCard === "summary_large_image",
				"The `twitter` config contains image data, but the `twitter.card` " +
					"value is set to `" +
					twitterCard +
					"`. This may produce unexpected " +
					"results with link previews on Twitter. Set the `twitter.card` " +
					"value to `summary` or `summary_large_image` to dismiss this warning."
			);

			warning(
				isValidUrl(twitter.image.url),
				"The twitter:image tag must be a valid, absolute URL. Relative paths " +
					"will not work as expected. Check the config's `twitter.image.url` value."
			);
			warning(
				twitter.image.alt != null,
				"A Twitter image should use alt text that describes the image. This is " +
					"important for users who are visually impaired. Please add a text " +
					"value to the `alt` key of the `twitter.image` config option to " +
					"dismiss this warning."
			);

			meta.push({ name: "twitter:image", content: twitter.image.url });
			if (twitter.image.alt) {
				meta.push({ name: "twitter:image:alt", content: twitter.image.alt });
			}
		}

		if (hasTwitterPlayerMeta(twitter)) {
			let twitterCard = twitter.card ?? "player";
			meta.push({ name: "twitter:card", content: twitterCard });
			twitterCardIsSet = true;
			warning(
				twitterCard === "player",
				"The `twitter` config contains player data, but the `twitter.card` " +
					"value is set to `" +
					twitterCard +
					"`. This may produce unexpected " +
					"results with link previews on Twitter. Set the `twitter.card` " +
					"value to `player` to dismiss this warning."
			);

			if (twitter.player.url != null) {
				warning(
					isValidUrl(twitter.player.url),
					"The `twitter:player` tag must be a valid, absolute URL. Relative " +
						"paths will not work as expected. Check the config's " +
						"`twitter.player.url` value."
				);
				meta.push({ name: "twitter:player", content: twitter.player.url });
			}
			if (twitter.player.stream != null) {
				warning(
					isValidUrl(twitter.player.stream),
					"The `twitter:player:stream` tag must be a valid, absolute URL. " +
						"Relative paths will not work as expected. Check the config's " +
						"`twitter.player.stream` value."
				);
				meta.push({
					name: "twitter:player:stream",
					content: twitter.player.stream,
				});
			}

			if (twitter.player.height != null) {
				meta.push({
					name: "twitter:player:height",
					content: String(twitter.player.height),
				});
			}

			if (twitter.player.width != null) {
				meta.push({
					name: "twitter:player:width",
					content: String(twitter.player.width),
				});
			}
		}

		if (hasTwitterAppMeta(twitter)) {
			let twitterCard = twitter.card ?? "app";
			meta.push({ name: "twitter:card", content: twitterCard });
			twitterCardIsSet = true;
			warning(
				twitterCard === "app",
				"The `twitter` config contains app data, but the `twitter.card` " +
					"value is set to `" +
					twitterCard +
					"`. This may produce unexpected " +
					"results with link previews on Twitter. Set the `twitter.card` " +
					"value to `app` to dismiss this warning."
			);

			let twitterDevices = ["iPhone", "iPad", "googlePlay"] as const;
			if (isObject(twitter.app.name)) {
				for (const device of twitterDevices) {
					let content = twitter.app.name[device];
					if (content != null) {
						let name = `twitter:app:name:${device.toLowerCase()}`;
						meta.push({ name, content });
					}
				}
			} else {
				let content = twitter.app.name;
				meta.push({ name: "twitter:app:name:iphone", content });
				meta.push({ name: "twitter:app:name:ipad", content });
				meta.push({ name: "twitter:app:name:googleplay", content });
			}

			if (isObject(twitter.app.id)) {
				for (const device of twitterDevices) {
					let content = twitter.app.id[device];
					if (content != null) {
						let name = `twitter:app:id:${device.toLowerCase()}`;
						meta.push({ name, content });
					}
				}
			}

			if (isObject(twitter.app.url)) {
				for (const device of twitterDevices) {
					let content = twitter.app.url[device];
					if (content != null) {
						let name = `twitter:app:url:${device.toLowerCase()}`;
						meta.push({ name, content });
					}
				}
			}
		}

		if (!twitterCardIsSet && hasOpenGraphImageMeta(config.openGraph)) {
			let firstImage = config.openGraph.images?.find(
				(image) => image.url != null
			)!;
			meta.push({ name: "twitter:card", content: "summary_large_image" });
			meta.push({ name: "twitter:image", content: firstImage.url });
			if (firstImage.alt) {
				meta.push({ name: "twitter:image:alt", content: firstImage.alt });
			}
			twitterCardIsSet = true;
		}
	}

	// Facebook App ID
	if (facebook) {
		if (facebook.appId != null) {
			meta.push({ property: "fb:app_id", content: facebook.appId });
		}
	}

	// Robots
	if (!isObject(robots)) {
		// TODO: Warn?
		robots = {};
	}

	let robotsContent = resolveRobotsContent(robots);
	if (robotsContent != null) {
		meta.push({ name: "robots", content: robotsContent });
	}

	// https://developers.google.com/search/docs/crawling-indexing/special-tags
	if (google) {
		let {
			noPageReadAloud,
			noSiteLinksSearchBox,
			robots: googleRobotsOverride,
			siteVerification,
		} = google;

		let googleRobotsContent =
			googleRobotsOverride != null
				? resolveRobotsContent(googleRobotsOverride)
				: robotsContent;
		if (googleRobotsContent != null) {
			meta.push({ name: "googlebot", content: googleRobotsContent });
		}

		if (noPageReadAloud === true) {
			meta.push({ name: "google", content: "nopagereadaloud" });
		}

		if (noSiteLinksSearchBox === true) {
			meta.push({ name: "google", content: "nositelinkssearchbox" });
		}

		if (siteVerification != null) {
			meta.push({
				name: "google-site-verification",
				content: siteVerification,
			});
		}
	}

	return meta;

	function warning(condition: boolean, message: string): void {
		if (!silenceWarnings && !condition) {
			warn(message);
		}
	}
}

function resolveConfig(
	defaultConfig: SeoInitConfig | undefined,
	localConfig: SeoConfig | ((routeArgs?: MetaArgs) => SeoConfig) | undefined,
	routeArgs: MetaArgs | undefined
) {
	let config: SeoResolvedConfig = isFunction(localConfig)
		? localConfig(routeArgs)
		: { ...localConfig };
	config = defaultConfig ? merge({}, defaultConfig, config) : config;
	return config;
}

function getPageTitles(config: SeoConfig): {
	title: string | null;
	openGraph: string | null;
	twitter: string | null;
} {
	let titles: ReturnType<typeof getPageTitles> = {
		title: null,
		openGraph: null,
		twitter: null,
	};

	if (
		config.defaultTitle == null &&
		config.title == null &&
		config.openGraph?.title == null &&
		config.twitter?.title == null
	) {
		return titles;
	}

	let templateTitle = config.titleTemplate;
	for (let key of ["title", "openGraph", "twitter"] as const) {
		// prettier-ignore
		let tagTitle =
			key === "openGraph"
				? config.openGraph?.title ?? config.title ?? config.defaultTitle
				: key === "twitter"
				? config.twitter?.title ?? config.openGraph?.title ?? config.title ?? config.defaultTitle
				: config.title ?? config.defaultTitle;
		if (tagTitle == null || templateTitle == null) {
			titles[key] = tagTitle ?? null;
			continue;
		}

		let shouldBypassTemplate =
			(isObject(config.bypassTitleTemplate) &&
				!!config.bypassTitleTemplate[key]) ||
			!!config.bypassTitleTemplate;

		let resolvedTitle = tagTitle;
		if (!shouldBypassTemplate) {
			resolvedTitle = templateTitle.replace(/%s/g, () => resolvedTitle);
		}
		titles[key] = resolvedTitle;
	}
	return titles;
}

function isValidTwitterCardType(card: unknown): card is TwitterCardType {
	return (
		isString(card) &&
		["summary", "summary_large_image", "app", "player"].includes(card)
	);
}

function hasOpenGraphImageMeta(
	og: OpenGraphMeta | undefined | null
): og is OpenGraphMeta & {
	images: Required<OpenGraphMeta["images"]>;
} {
	if (!og?.images) return false;
	return og.images.some((image) => image.url != null);
}

function hasTwitterAppMeta(twitter: TwitterMeta): twitter is TwitterMeta & {
	app: { name: Required<TwitterAppMeta["name"]> } & TwitterAppMeta;
} {
	return !!(twitter.app && twitter.app.name);
}

function hasTwitterPlayerMeta(twitter: TwitterMeta): twitter is TwitterMeta & {
	player: TwitterPlayerMeta;
} {
	return twitter.player?.url != null || twitter.player?.stream != null;
}

function hasTwitterImageMeta(twitter: TwitterMeta): twitter is TwitterMeta & {
	image: { url: Required<TwitterImageMeta["url"]> } & TwitterImageMeta;
} {
	return twitter.image?.url != null;
}

function resolveRobotsContent(robots: RobotsOptions) {
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
		!!noArchive && "noarchive",
		!!noImageIndex && "noimageindex",
		!!noSnippet && "nosnippet",
		!!noTranslate && `notranslate`,
		!!maxImagePreview && `max-image-preview:${maxImagePreview}`,
		!!maxSnippet && `max-snippet:${maxSnippet}`,
		!!maxVideoPreview && `max-video-preview:${maxVideoPreview}`,
		!!unavailableAfter && `unavailable_after:${unavailableAfter}`,
	];
	let robotsParam =
		(noIndex ? "noindex" : "index") + "," + (noFollow ? "nofollow" : "follow");
	for (let param of robotsParams) {
		if (param) {
			robotsParam += `,${param}`;
		}
	}
	return robotsParam;
}

// #region Internal utils

function warn(message: string): void {
	if (typeof console !== "undefined") console.warn("remix-seo: " + message);
	try {
		// This error is thrown as a convenience so you can more easily
		// find the source for a warning that appears in the console by
		// enabling "pause on exceptions" in your JavaScript debugger.
		throw new Error("remix-seo: " + message);
	} catch (e) {}
}

function isValidUrl(str: string) {
	try {
		new URL(str);
		return true;
	} catch (_) {
		return false;
	}
}

function isString(value: unknown): value is string {
	return typeof value === "string";
}

function isObject(value: unknown): value is object {
	return value != null && typeof value === "object";
}

function isFunction(value: unknown): value is Function {
	return typeof value === "function";
}

function isDate(value: unknown): value is Date {
	return isObject(value) && value instanceof Date;
}

// #endregion

// #region Types

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
	releaseDate?: Date | string;
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
	music?: OpenGraphMusic;
}

interface OpenGraphProfile {
	firstName?: string;
	lastName?: string;
	gender?: string;
	username?: string;
}

type OpenGraphMusic =
	| OpenGraphMusicSong
	| OpenGraphMusicAlbum
	| OpenGraphMusicPlaylist
	| OpenGraphMusicRadioStation;

interface OpenGraphMusicSong {
	duration?: number;
	albums?: Array<string | { url: string; disc?: number; track?: number }>;
	musicians?: Array<string | { url: string }>;
}

interface OpenGraphMusicAlbum {
	songs?: Array<string | { url: string; disc?: number; track?: number }>;
	musicians?: Array<string | { url: string }>;
	releaseDate?: Date | string;
}

interface OpenGraphMusicPlaylist {
	songs?: Array<string | { url: string; disc?: number; track?: number }>;
	creators?: Array<string | { url: string }>;
}

interface OpenGraphMusicRadioStation {
	creators?: Array<string | { url: string }>;
}

interface OpenGraphVideo {
	actors?: Array<string | OpenGraphVideoActors>;
	directors?: Array<string | { url: string }>;
	duration?: number;
	releaseDate?: Date | string;
	series?: string;
	tags?: string[];
	writers?: Array<string | { url: string }>;
}

interface OpenGraphVideoActors {
	url: string;
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

interface SeoResolvedConfig extends SeoConfig, SeoInitConfig {}

interface SeoInitConfig extends SeoConfig {
	silenceWarnings?: boolean;
}

interface SeoConfig {
	bypassTitleTemplate?:
		| boolean
		| {
				title?: boolean;
				twitter?: boolean;
				openGraph?: boolean;
		  };
	canonical?: string;
	defaultTitle?: string;
	description?: string;
	facebook?: FacebookMeta;
	languageAlternates?: LanguageAlternate[];
	mobileAlternate?: MobileAlternate;
	omitGoogleBotMeta?: boolean;
	openGraph?: OpenGraphMeta | null;
	robots?: RobotsOptions;
	title?: string;
	titleTemplate?: string;
	twitter?: TwitterMeta | null;
	google?: GoogleMeta | null;
}

interface GoogleMeta {
	noSiteLinksSearchBox?: boolean;
	noPageReadAloud?: boolean;
	siteVerification?: string;
	robots?: RobotsOptions | null;
}

interface SeoBaseFunction<Return> {
	(config?: SeoConfig): Return;
	(
		config: SeoConfig | ((routeArgs?: MetaArgs) => SeoConfig),
		routeArgs: MetaArgs
	): Return;
}

interface SeoFunction extends SeoBaseFunction<MetaDescriptor[]> {}

// #endregion

export { initSeo };
export type { SeoInitConfig, SeoConfig, SeoFunction };
