import { BigNumber } from "0x.js";
import { ONE_SECOND_MS, TEN_MINUTES_MS } from './constants';
import { providerEngine } from "./provider_engine";

export const getRandomFutureInSeconds = (): BigNumber => {
    return new BigNumber(Date.now() + TEN_MINUTES_MS).div(ONE_SECOND_MS).integerValue(BigNumber.ROUND_CEIL);
};