import { tokens } from './helper'

const Token = artifacts.require('./Token');

require('chai')
    .use(require('chai-as-promised'))
    .should()



contract('Token', ([deployer, receiver]) => {
    const name = 'Spik Token';
    const symbol = 'SPIK';
    const decimal = '18';
    const totalSupply = tokens(1000000).toString();
    let token;

    beforeEach(async () => {
        token = await Token.new();
    })

    describe('deployment', () => {
        it('track the name', async () => {
            const token = await Token.new();
            const result = await token.name();
            result.should.equal(name)
        })

        it('tracks the symbol', async () => {
            const result = await token.symbol();
            result.should.equal(symbol);
        })

        it('tracks the decimal', async () => {
            const result = await token.decimals();
            result.toString().should.equal(decimal);
        })

        it('tracks the total supply', async () => {
            const result = await token.totalSupply();
            result.toString().should.equal(totalSupply.toString());
        })

        it('assign the totalSupply to the developer', async () => {
            const result = await token.balanceOf(deployer);
            result.toString().should.equal(totalSupply.toString());
        })
    })

    describe('sending tokens', () => {
        let result
        let amount
        beforeEach(async () => {
            amount = tokens(100);
            result = await token.transfer(receiver, amount, { from: deployer })
        })
        
        it('transfer token balance', async () => {
            let balanceOf;

            balanceOf = await token.balanceOf(deployer);
            balanceOf.toString().should.equal(tokens(999900).toString());
            balanceOf = await token.balanceOf(receiver);
            balanceOf.toString().should.equal(tokens(100).toString());        
        })
    })
})