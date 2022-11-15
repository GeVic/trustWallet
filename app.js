const core = require('@trustwallet/wallet-core');
const fs = require('fs');

var initWalletCore = core.initWasm().then(async (walletCore) => {
	var password = 'password';
	// create multi-coin HD wallet
	var wallet = walletCore.HDWallet.create(256, password);
	const mnemonic = wallet.mnemonic();

	// create using mnemonic
	//var wallet = walletCore.HDWallet.createWithMnemonic("ripple scissors kick mammal hire column oak again sun offer wealth tomorrow wagon turn fatal", "TREZOR");

	// get address for coin
	const address = wallet.getAddressForCoin(walletCore.CoinType.ethereum);
	//const address = wallet.getAddressForCoin(walletCore.CoinType.ethereum);\

	// Stored key
	const storedKey = new walletCore.StoredKey.importHDWallet(
		mnemonic,
		'test wallet',
		'password',
		walletCore.CoinType.ethereum
	);
	const jsonData = storedKey.exportJSON();
	const json = JSON.parse(Buffer.from(jsonData).toString());

	// key store
	const testDir = './wasm-test';
	fs.mkdirSync(testDir, { recursive: true });
	const storage = new core.KeyStore.FileSystemStorage(testDir);
	const keystore = new core.KeyStore.Default(walletCore, storage);
	var walletSecond = await keystore.import(mnemonic, 'test wallet', password, [
		walletCore.CoinType.ethereum,
	]);
	const stats = fs.statSync(storage.getFilename(walletSecond.id));
	const account = walletSecond.activeAccounts[0];
	const key = await keystore.getKey(walletSecond.id, password, account);

	const wallets = await keystore.loadAll();
	await wallets.forEach((w) => {
		keystore.delete(w.id, password);
	});

	console.log('multi-coin wallet second ---->', walletSecond);
	/* console.log('storage ---->', storage);
	console.log('keystore ---->', keystore);
	console.log('stats ---->', stats); */

	console.log('stored key ---->', storedKey);
	console.log('is mnemonic ---->', storedKey.isMnemonic());
	console.log('json data ---->', json);

	console.log('multi-coin wallet ---->', wallet);
	console.log('mnemonic ---->', mnemonic);
	console.log('address for eth ---->', address);

	// delete the creations
	wallet.delete();
	storedKey.delete();
});
