import { RPCSubprovider, Web3ProviderEngine, MnemonicWalletSubprovider } from '@0x/subproviders';
import { providerUtils } from '@0x/utils';

import { BASE_DERIVATION_PATH, MNEMONIC, NETWORK_CONFIGS } from './configs';

export const mnemonicWallet = new MnemonicWalletSubprovider({
    mnemonic: MNEMONIC,
    baseDerivationPath: BASE_DERIVATION_PATH,
});

const determineProvider = (): Web3ProviderEngine => {
    const provider = new Web3ProviderEngine();
    provider.addProvider(mnemonicWallet);
    provider.addProvider(new RPCSubprovider(NETWORK_CONFIGS.rpcUrl));
    providerUtils.startProviderEngine(provider);
    return provider;
};

export const providerEngine  = determineProvider();