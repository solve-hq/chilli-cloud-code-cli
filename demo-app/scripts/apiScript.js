var sdk = ChilliConnect.getSdk("2.18.0");

const fooBar = ChilliConnect.Request.FooBar;

ChilliConnect.Logger.info(`params.fooBar = ${fooBar}`);
ChilliConnect.Logger.info(`params.fooBar2 = ${fooBar}`);
ChilliConnect.Logger.info(`params.fooBar3 = ${fooBar}`);

try {
  var originalPlayerDetails = sdk.PlayerAccounts.getPlayerDetails();

  return fooBar;
} catch (e) {
  ChilliConnect.Logger.error(e.message);
}
