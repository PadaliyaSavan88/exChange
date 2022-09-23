const { ether } = require("../test/helper")

const Token = artifacts.require('Token')
const Exchange = artifacts.require('Exchange')

module.exports = async function(callback){
    try{
        const accounts = await web3.eth.getAccounts()

        const token = await Token.deployed()
        console.log('Token fetched', token.address)

        const exchange = await Exchange.deployed()
        console.log('Exchange fetched', exchange.address)

        const sender = accounts[0];
        const receiver = accounts[1];
        let amount  = web3.utils.toWei('1000', 'Ether')

        await token.transfer(receiver, amount, {from: sender})
        console.log(`Transfer ${amount} tokens from ${sender} to ${receiver}`)

        const user1 = accounts[0]
        const user2 = accounts[2]

        amount = 1
        await exchange.depositEther({from: user1, value: ether(amount)})
        console.log(`Deposited ${amount} Ether from ${user1}`)

        amount = 1000
        await token.approve(exchange.address, tokens(amount), {from: user2})
        console.log(`Approved ${amount} tokens from ${user2}`)

        await token.depositToken(exchange.address, tokens(amount), {from: user2})
        console.log(`Deposited ${amount} tokens from ${user2}`)
    } catch (error) {
        console.log(error)
    }
    callback()
}