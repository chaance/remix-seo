import type { HtmlLinkDescriptor, HtmlMetaDescriptor } from "@remix-run/react";
import { V2_HtmlMetaDescriptor } from "@remix-run/react/dist/routeModules";
import merge from "just-merge";
import {
  SeoConfig,
  SeoFunction,
  SeoMetaFunction,
  SeoLinksFunction,
  RouteArgs,
  TwitterMeta,
  TwitterAppMeta,
  TwitterPlayerMeta,
  TwitterImageMeta,
  TwitterCardType,
} from "./interfaces";

/**
 * A function for setting default SEO meta for Remix sites.
 *
 * @param defaultConfig - The default configuration object. Each of the returned
 * functions will merge their own config with the default config when called on
 * a specific route.
 * @returns An object with three methods to use for getting SEO link and meta
 * tags on the site's routes.
 */
export function initSeo(defaultConfig?: SeoConfig): {
  getSeo: SeoFunction;
  getSeoMeta: SeoMetaFunction;
  getSeoLinks: SeoLinksFunction;
} {
  const getSeo: SeoFunction = (
    cfg?: SeoConfig | ((routeArgs?: RouteArgs) => SeoConfig),
    routeArgs?: RouteArgs
  ): [V2_HtmlMetaDescriptor[], HtmlLinkDescriptor[]] => {
    let config = resolveConfig(defaultConfig, cfg, routeArgs);
    let meta = getMeta(config, routeArgs);
    let links = getLinks(config, routeArgs);
    return [meta, links];
  };

  const getSeoMeta: SeoMetaFunction = (
    cfg?: SeoConfig | ((routeArgs?: RouteArgs) => SeoConfig),
    routeArgs?: RouteArgs
  ): V2_HtmlMetaDescriptor[] => {
    let config = resolveConfig(defaultConfig, cfg, routeArgs);
    let meta = getMeta(config, routeArgs);
    return meta;
  };

  const getSeoLinks: SeoLinksFunction = (
    cfg?: SeoConfig | ((routeArgs?: RouteArgs) => SeoConfig),
    routeArgs?: RouteArgs
  ): HtmlLinkDescriptor[] => {
    let config = resolveConfig(defaultConfig, cfg, routeArgs);
    let links = getLinks(config, routeArgs);
    return links;
  };

  return {
    getSeo,
    getSeoMeta,
    getSeoLinks,
  };
}

function getMeta(config: SeoConfig, arg: any) {
  let meta: HtmlMetaDescriptor = {};
  let title = getSeoTitle(config);
  let {
    canonical,
    description,
    facebook,
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
    (noIndex ? "noindex" : "index") + "," + (noFollow ? "nofollow" : "follow");

  for (let param of robotsParams) {
    if (param) {
      robotsParam += `,${param}`;
    }
  }

  meta.robots = robotsParam;
  if (!omitGoogleBotMeta) {
    meta.googlebot = meta.robots;
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
      let cardType = validateTwitterCard(twitter);
      if (cardType) {
        meta["twitter:card"] = cardType;
      }
    }

    if (twitter.site) {
      meta["twitter:site"] =
        typeof twitter.site === "object" ? twitter.site.id : twitter.site;
    }

    if (twitter.creator) {
      meta["twitter:creator"] =
        typeof twitter.creator === "object"
          ? twitter.creator.id
          : twitter.creator;
    }

    if (hasTwitterImageMeta(twitter)) {
      warnIfInvalidUrl(
        twitter.image.url,
        `The twitter:image tag must be a valid, absolute URL. Relative paths will not work as expected. Check the config's \`twitter.image.url\` value.`
      );
      meta["twitter:image"] = twitter.image.url;
      if (twitter.image!.alt) {
        meta["twitter:image:alt"] = twitter.image.alt;
      } else {
        warn(
          "A Twitter image should use alt text that describes the image. This is important for users who are visually impaired. Please add a text value to the `alt` key of the `twitter.image` config option to dismiss this warning."
        );
      }
    }

    if (hasTwitterPlayerMeta(twitter)) {
      if (twitter.player.url) {
        warnIfInvalidUrl(
          twitter.player.url,
          `The twitter:player tag must be a valid, absolute URL. Relative paths will not work as expected. Check the config's \`twitter.player.url\` value.`
        );
        meta["twitter:player"] = twitter.player.url;
      }

      if (twitter.player.stream) {
        warnIfInvalidUrl(
          twitter.player.stream,
          `The twitter:player:stream tag must be a valid, absolute URL. Relative paths will not work as expected. Check the config's \`twitter.player.stream\` value.`
        );
        meta["twitter:player:stream"] = twitter.player.stream;
      }

      if (twitter.player.height) {
        meta["twitter:player:height"] = twitter.player.height.toString();
      }

      if (twitter.player.width) {
        meta["twitter:player:height"] = twitter.player.width.toString();
      }
    }

    if (hasTwitterAppMeta(twitter)) {
      const twitterDevices = ["iPhone", "iPad", "googlePlay"] as const;

      if (typeof twitter.app.name === "object") {
        for (const device of twitterDevices) {
          if (twitter.app.name[device]) {
            meta[`twitter:app:name:${device.toLowerCase()}`] =
              twitter.app.name[device]!;
          }
        }
      } else {
        meta["twitter:app:name:iphone"] = twitter.app.name;
        meta["twitter:app:name:ipad"] = twitter.app.name;
        meta["twitter:app:name:googleplay"] = twitter.app.name;
      }

      if (typeof twitter.app.id === "object") {
        for (const device of twitterDevices) {
          if (twitter.app.id[device]) {
            meta[`twitter:app:id:${device.toLowerCase()}`] =
              twitter.app.id[device]!;
          }
        }
      }

      if (typeof twitter.app.url === "object") {
        for (const device of twitterDevices) {
          if (twitter.app.url[device]) {
            meta[`twitter:app:url:${device.toLowerCase()}`] =
              twitter.app.url[device]!;
          }
        }
      }
    }

    if (!meta["twitter:card"]) {
      if (hasTwitterPlayerMeta(twitter)) {
        meta["twitter:card"] = "player";
      } else if (hasTwitterAppMeta(twitter)) {
        meta["twitter:card"] = "app";
      } else if (hasTwitterImageMeta(twitter)) {
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

  let v2_meta: V2_HtmlMetaDescriptor[] = [];
  for (const key in meta) {
    if (key.indexOf("og:") === 0) {
      v2_meta.push({
        property: key,
        content: meta[key] as string,
      });
    } else if (key.indexOf("twitter:") === 0) {
      v2_meta.push({
        property: key,
        content: meta[key] as string,
      });
    } else if (key === "title") {
      v2_meta.push({ title });
    } else if (key.toLowerCase() === "charset") {
      v2_meta.push({ charSet: meta[key] as string });
    } else v2_meta.push({ name: key, content: meta[key] as string });
  }

  return v2_meta;
}

function getLinks(config: SeoConfig, arg: any): HtmlLinkDescriptor[] {
  let links: HtmlLinkDescriptor[] = [];
  let { canonical, mobileAlternate, languageAlternates = [] } = config;

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

  return links;
}

export default initSeo;

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
  if (typeof console !== "undefined") console.warn("remix-seo: " + message);
  try {
    // This error is thrown as a convenience so you can more easily
    // find the source for a warning that appears in the console by
    // enabling "pause on exceptions" in your JavaScript debugger.
    throw new Error("remix-seo: " + message);
  } catch (e) {}
}

function warnIfInvalidUrl(str: string, message: string) {
  try {
    new URL(str);
  } catch (_) {
    if (typeof console !== "undefined") console.warn("remix-seo: " + message);
  }
}

function validateTwitterCard(
  twitter: TwitterMeta
): TwitterCardType | undefined {
  if (!twitter.card) {
    return;
  }

  if (
    !["app", "player", "summary", "summary_large_image"].includes(twitter.card)
  ) {
    warn(`An invalid Twitter card was provided to the config and will be ignored. Make sure that \`twitter.card\` is set to one of the following:
- "app"
- "player"
- "summary"
- "summary_large_image"

Read more: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup`);
    return;
  }

  if (hasTwitterAppMeta(twitter)) {
    if (twitter.card !== "app") {
      warn(`An Twitter card type of \`${twitter.card}\` was provided to a config with app metadata. Twitter app cards must use a \`twitter:card\` value of \`"app"\`, so the app metadata will be ignored. Fix the \`twitter.card\` value or remove the \`twitter.app\` config to dismiss this warning.

Read more: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup`);
      // @ts-ignore
      delete twitter.app;
    } else {
      if (hasTwitterImageMeta(twitter)) {
        warn(`The Twitter app card type does not support the twitter:image metadata provided in your config. Remove the \`twitter.image\` config to dismiss this warning.

	Read more: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup`);
        // @ts-ignore
        delete twitter.image;
      }

      if (hasTwitterPlayerMeta(twitter)) {
        warn(`The Twitter app card type does not support the twitter:player metadata provided in your config. Remove the \`twitter.player\` config to dismiss this warning.

	Read more: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup`);
        // @ts-ignore
        delete twitter.player;
      }

      return "app";
    }
  }

  if (hasTwitterPlayerMeta(twitter)) {
    if (twitter.card !== "player") {
      warn(`An Twitter card type of \`${twitter.card}\` was provided to a config with player metadata. Twitter player cards must use a \`twitter:card\` value of \`"player"\`, so the player metadata will be ignored. Fix the \`twitter.card\` value or remove the \`twitter.player\` config to dismiss this warning.

Read more: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup`);
      // @ts-ignore
      delete twitter.player;
    } else {
      return "player";
    }
  }

  if (
    hasTwitterImageMeta(twitter) &&
    !["summary", "summary_large_image", "player"].includes(twitter.card)
  ) {
    if (twitter.card !== "player") {
      warn(`An Twitter card type of \`${twitter.card}\` was provided to a config with image metadata. Cards that support image metadata are:
- "summary"
- "summary_large_image"
- "player"

The image metadata will be ignored. Fix the \`twitter.card\` value or remove the \`twitter.image\` config to dismiss this warning.

Read more: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup`);
      // @ts-ignore
      delete twitter.image;
    }
  }

  return twitter.card as TwitterCardType;
}

function hasTwitterAppMeta(twitter: TwitterMeta): twitter is TwitterMeta & {
  app: { name: Required<TwitterAppMeta["name"]> } & TwitterAppMeta;
} {
  return !!(twitter.app && twitter.app.name);
}

function hasTwitterPlayerMeta(twitter: TwitterMeta): twitter is TwitterMeta & {
  player: TwitterPlayerMeta;
} {
  return !!(twitter.player && (twitter.player.url || twitter.player.stream));
}

function hasTwitterImageMeta(twitter: TwitterMeta): twitter is TwitterMeta & {
  image: { url: Required<TwitterImageMeta["url"]> } & TwitterImageMeta;
} {
  return !!(twitter.image && twitter.image.url);
}

function resolveConfig(
  defaultConfig: SeoConfig | undefined,
  localConfig: SeoConfig | ((routeArgs?: RouteArgs) => SeoConfig) | undefined,
  routeArgs: RouteArgs | undefined
) {
  let config: SeoConfig =
    typeof localConfig === "function"
      ? localConfig(routeArgs)
      : localConfig || {};

  config = defaultConfig ? merge({}, defaultConfig, config) : config;

  return config;
}
