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
    const etherTokenAddress = contractAddresses.etherToken;
    
    //

    const makerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(0.003), DECIMALS);
    const takerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(0.001), DECIMALS);

    const makerAssetData = assetDataUtils.encodeERC20AssetData(zrxTokenAddress);
    const takerAssetData = assetDataUtils.encodeERC20AssetData(etherTokenAddress);
    let txHash;
    let txReciept;

    const zrxToken = new ERC20TokenContract(zrxTokenAddress, providerEngine);

    const makerZRXApprovalTxHash = await zrxToken.approve.validateAndSendTransactionAsync(
        contractAddresses.erc20Proxy,
        UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
        { from: maker },
    );
    //

    const takerWETHApprovalTxHash = await contractWrappers.weth9.approve.validateAndSendTransactionAsync(
        contractAddresses.erc20Proxy,
        UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
        { from: taker },
    );
    //

    const takerWETHDepositTxHash = await contractWrappers.weth9.deposit.validateAndSendTransactionAsync({
        value: takerAssetAmount,
        from: taker,
    });
    //

    //
    //

    const randomExpiration = getRandomFutureInSeconds();
    const exchangeAddress = contractAddresses.exchange;

    const order: Order = {
        exchangeAddress,
        makerAddress: maker,
        takerAddress: NULL_ADDRESS,
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

    //

    //
    //

    const orderHashHex = orderHashUtils.getOrderHashHex(order);
    const signature = await signatureUtils.ecSignHashAsync(providerEngine, orderHashHex, maker);
    const signedOrder =  { ...order, signature };
    console.log(orderHashHex);

    // txHash = await contractWrappers.exchange.fillOrder.validateAndSendTransactionAsync(
    //     signedOrder,
    //     takerAssetAmount,
    //     signedOrder.signature,
    //     { from: taker, gas: TX_DEFAULS.gas },
    // );
    // console.log(txHash);
    console.log(order);
    
    const orderInfo = await contractWrappers.exchange.getOrderInfo.callAsync(order);
    console.log(orderInfo);
    
    //
    //

    //

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

