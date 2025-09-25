/* eslint-disable no-console */
const { notarize } = require('@electron/notarize');

exports.default = async function notarizeHook(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_ID_PASSWORD; // app-specific password, e.g. abcd-efgh-ijkl-mnop
  const teamId = process.env.APPLE_TEAM_ID;

  if (!appleId || !appleIdPassword || !teamId) {
    console.warn('[notarize] Skipping notarization: missing APPLE_ID / APPLE_ID_PASSWORD / APPLE_TEAM_ID');
    return;
  }

  console.log(`[notarize] Notarizing ${appName}.app`);
  await notarize({
    appBundleId: context.packager.appInfo.appId,
    appPath: `${appOutDir}/${appName}.app`,
    tool: 'notarytool',
    appleId,
    appleIdPassword,
    teamId,
  });
  console.log('[notarize] Notarization complete');
};


