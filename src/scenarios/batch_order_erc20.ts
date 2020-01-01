import { 
    assetDataUtils,
    BigNumber,
    ContractWrappers,
    ERC20TokenContract,
    generatePseudoRandomSalt,
    Order,
    orderHashUtils,
    signatureUtils,
 } from "0x.js";
import { Web3Wrapper } from "@0x/web3-wrapper";

import { NETWORK_CONFIGS, TX_DEFAULS } from "../configs";
import { DECIMALS, ZERO, NULL_ADDRESS, UNLIMITED_ALLOWANCE_IN_BASE_UNITS } from "../constants";
import { contractAddresses } from "../contracts";
// import { PrintUtils } from "../print_utils";
import { providerEngine } from "../provider_engine";
import { getRandomFutureInSeconds } from "../utils";

export async function scenarioAsync(): Promise<void> {
    //
    //

    const contractWrappers = new ContractWrappers(providerEngine, { networkId: NETWORK_CONFIGS.networkId});
    const web3Wrapper = new Web3Wrapper(providerEngine);
    const [maker, taker] = await web3Wrapper.getAvailableAddressesAsync();
    const zrxTokenAddress = contractAddresses.zrxToken;
    // const etherTokenAddress = contractAddresses.etherToken;

    const daiTokenAddress = '0xC4375B7De8af5a38a93548eb8453a498222C4fF2';
    // console.log(daiTokenAddress);

    const makerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(2), DECIMALS);
    const takerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(1), DECIMALS);

    const makerAssetData = assetDataUtils.encodeERC20AssetData(daiTokenAddress);
    const takerAssetData = assetDataUtils.encodeERC20AssetData(zrxTokenAddress);
    let txHash;
    let txReciept;

    const daiToken = new ERC20TokenContract(daiTokenAddress, providerEngine);
    const zrxToken = new ERC20TokenContract(zrxTokenAddress, providerEngine);

    const makerDAIApprovalTxHash = await daiToken.approve.validateAndSendTransactionAsync(
        contractAddresses.erc20Proxy,
        UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
        { from: maker },
    );

    const takerZRXApprovalTxHash = await zrxToken.approve.validateAndSendTransactionAsync(
        contractAddresses.erc20Proxy,
        UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
        { from: taker },
    );

    const randomExpiration = getRandomFutureInSeconds();
    const exchangeAddress = contractAddresses.exchange;

    const order1: Order = {
        exchangeAddress,
        makerAddress: maker,
        takerAddress: taker,
        senderAddress: NULL_ADDRESS,
        feeRecipientAddress: NULL_ADDRESS,
        expirationTimeSeconds: randomExpiration,
        salt: generatePseudoRandomSalt(),
        makerAssetAmount,
        takerAssetAmount,
        makerAssetData,
        takerAssetData,
        makerFee: ZERO,
        takerFee: ZERO,
    };

    const order2: Order = {
        exchangeAddress,
        makerAddress: maker,
        takerAddress: taker,
        senderAddress: NULL_ADDRESS,
        feeRecipientAddress: NULL_ADDRESS,
        expirationTimeSeconds: randomExpiration,
        salt: generatePseudoRandomSalt(),
        makerAssetAmount,
        takerAssetAmount,
        makerAssetData,
        takerAssetData,
        makerFee: ZERO,
        takerFee: ZERO,
    };

    var orders: Order[];
    orders = [order1, order2]


    const orderHashHex = orderHashUtils.getOrderHashHex(order1);
    const signature = await signatureUtils.ecSignHashAsync(providerEngine, orderHashHex, maker);
    const signedOrder =  { ...order1, signature };   
    console.log(orderHashHex);

    txHash = await contractWrappers.exchange.fillOrder.validateAndSendTransactionAsync(
        signedOrder,
        takerAssetAmount,
        signedOrder.signature,
        { from: taker, gas: TX_DEFAULS.gas },
    );
    console.log(txHash);
    
    providerEngine.stop();
}

void (async () => {
    try{
        if (!module.parent) {
            await scenarioAsync();
        }
    } catch (e) {
        console.log(e);
        providerEngine.stop();
        process.exit(1);
    }
})();

