import { BigNumber } from '@0x/utils';
import { SignedOrder } from '@0x/order-utils';
import { ONE_SECOND_MS, TEN_MINUTES_MS } from './constants';
import { providerEngine } from "./provider_engine";
import { NETWORK_CONFIGS, TX_DEFAULTS } from './configs';

/**
 * Returns an amount of seconds that is greater than the amount of seconds since epoch.
 */
export const getRandomFutureDateInSeconds = (): BigNumber => {
    return new BigNumber(Date.now() + TEN_MINUTES_MS).div(ONE_SECOND_MS).integerValue(BigNumber.ROUND_CEIL);
};

export const calculateProtocolFee = (
    orders: SignedOrder[],
    gasPrice: BigNumber | number = TX_DEFAULTS.gasPrice,
): BigNumber => {
    return new BigNumber(150000).times(gasPrice).times(orders.length);
};