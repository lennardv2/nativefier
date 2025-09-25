import axios from 'axios';
import * as log from 'loglevel';
import { DEFAULT_SAFARI_VERSION } from '../../constants';

export type SafariVersion = {
  majorVersion: number;
  version: string;
  webkitVersion: string;
};

const SAFARI_VERSIONS_HISTORY_URL =
  'https://en.wikipedia.org/wiki/Safari_version_history';

export async function getLatestSafariVersion(
  url = SAFARI_VERSIONS_HISTORY_URL,
): Promise<SafariVersion> {
  try {
    log.debug('Grabbing apple version data from', url);
    const response = await axios.get<string>(url, { timeout: 5000 });
    if (response.status !== 200) {
      throw new Error(`Bad request: Status code ${response.status}`);
    }

    // This would be easier with an HTML parser, but we're not going to include an extra dependency for something that dumb
    const rawData: string = response.data;

    const majorVersionMatches = [
      ...rawData.matchAll(/id="Safari_[0-9]*">Safari ([0-9]*)</g),
    ];
    const majorVersions = majorVersionMatches.map((match: RegExpMatchArray) => {
      const version = match[1] as string | undefined;
      return version ? String(version) : '';
    });

    const lastMajorVersion = majorVersions[majorVersions.length - 1];
    if (!lastMajorVersion) {
      throw new Error('Could not find Safari major version');
    }
    const majorVersion = parseInt(lastMajorVersion, 10);

    const majorVersionTable = rawData
      .split('>Release history<')[2]
      .split('<table')
      .filter((table) => table.includes(`Safari ${majorVersion}.x`))[0];

    const versionRows = majorVersionTable.split('<tbody')[1].split('<tr');

    let version: string | undefined = undefined;
    let webkitVersion: string | undefined = undefined;

    for (const versionRow of versionRows.reverse()) {
      const versionMatch = [
        ...versionRow.matchAll(/>\s*(([0-9]*\.){2}[0-9])\s*</g),
      ];
      if (versionMatch.length > 0 && !version) {
        const matchResult = versionMatch[0] as RegExpMatchArray;
        const matchedVersion = matchResult?.[1] as string | undefined;
        if (matchedVersion) {
          version = String(matchedVersion);
        }
      }

      const webkitVersionMatch = [
        ...versionRow.matchAll(/>\s*(([0-9]*\.){3,4}[0-9])\s*</g),
      ];
      if (webkitVersionMatch.length > 0 && !webkitVersion) {
        const matchResult = webkitVersionMatch[0] as RegExpMatchArray;
        const matchedVersion = matchResult?.[1] as string | undefined;
        if (matchedVersion) {
          webkitVersion = String(matchedVersion);
        }
      }
      if (version && webkitVersion) {
        break;
      }
    }

    if (version && webkitVersion) {
      return {
        majorVersion,
        version,
        webkitVersion,
      };
    }
    return DEFAULT_SAFARI_VERSION;
  } catch (err: unknown) {
    log.error('getLatestSafariVersion ERROR', err);
    log.debug('Falling back to default Safari version', DEFAULT_SAFARI_VERSION);
    return DEFAULT_SAFARI_VERSION;
  }
}
