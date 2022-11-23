export const EVM_REVERT = 'VM Exception while processing transaction: revert'
export const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';
export const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
export const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
export const ether = (n) => {
    return new web3.utils.BN(
        web3.utils.toWei(n.toString(), 'ether')
    )
}

export const tokens = (n) => ether(n)