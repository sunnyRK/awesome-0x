import { KOVAN_NETWORK_ID } from './constants';
import { NetworkSpecificConfigs } from './types';

export const TX_DEFAULTS = { gas: 8000000, gasPrice: 1000000000 };
export const MNEMONIC = "mesh almost stairs envelope earth plastic interest hat stock camera panda boat";
export const BASE_DERIVATION_PATH = `44'/60'/0'/0`;

export const KOVAN_CONFIGS: NetworkSpecificConfigs = {
    rpcUrl: 'https://kovan.infura.io/',
    networkId: KOVAN_NETWORK_ID,
    chainId: KOVAN_NETWORK_ID,
};

export const NETWORK_CONFIGS = KOVAN_CONFIGS;