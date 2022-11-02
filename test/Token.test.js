import { tokens, EVM_REVERT } from './helper'

const Token = artifacts.require('./Token');

require('chai')
    .use(require('chai-as-promised'))
    .should()



contract('Token', ([deployer, receiver, exchange]) => {
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

        describe('success', () => {
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
    
            it('emits a transfer event', async () => {
                const log = result.logs[0]
                log.event.should.eq('Transfer')
                const event = log.args
                // console.log(event)
                event.from.toString().should.equal(deployer, 'from is correct')
                event.to.toString().should.equal(receiver, 'to is correct')
                event._value.toString().should.equal(amount.toString(), 'value is correct')
            })
        })

        describe('failure', () => {
            it('rejects insufficient balance', async () => {
                let invalidAmount;
                invalidAmount = tokens(100000000); // greater than total supply
                await token.transfer(receiver, invalidAmount, { from: deployer }).should.be.rejectedWith(EVM_REVERT)

                // Transfer token from account with 0 tokens
                invalidAmount = tokens(10);
                await token.transfer(deployer, invalidAmount, { from: receiver }).should.be.rejectedWith(EVM_REVERT)
            })

            it('reject invalid recipients', async () => {
                await token.transfer(0x0, amount, { from: deployer }).should.be.rejected
            })
        })
    })

    describe('approving token', () => {
        let result;
        let amount;

        beforeEach(async () => {
            amount = tokens(100);
            result = await token.approve(exchange, amount, {from: deployer})
        })

        describe('success', () => {
            it('allocates an allowance for delegated token spending on exchange', async () => {
                const allowance = await token.allowance(deployer, exchange)
                allowance.toString().should.equal(amount.toString());
            })

            it('emits and Approval event', async () => {
                const log = result.logs[0];
                log.event.should.eq('Approval');
                const event = log.args;
                event.owner.toString().should.equal(deployer, 'owner is correct');
                event.spender.should.equal(exchange, 'spender is correct');
                event.value.toString().should.equal(amount.toString(), 'value is correct');
            })
        })

        describe('failure', () => {
            it('rejects invalid spender', async () => {
                await token.approve(0x0, amount, { from: deployer }).should.be.rejected;
            })
        })
    })

    describe('delegated token transfers', () => {
        let result
        let amount

        beforeEach(async () => {
            amount = tokens(100);
            await token.approve(exchange, amount, { from: deployer });
        })

        describe('success', () => {
            beforeEach(async () => {
                result = await token.transferFrom(deployer, receiver, amount, { from: exchange })
            })
            
            it('transfer token balance', async () => {
                let balanceOf;
    
                balanceOf = await token.balanceOf(deployer);
                balanceOf.toString().should.equal(tokens(999900).toString());
                balanceOf = await token.balanceOf(receiver);
                balanceOf.toString().should.equal(tokens(100).toString());        
            })

            it('reset the allowance', async () => {
                const allowance = await token.allowance(deployer, exchange)
                allowance.toString().should.equal('0');
            })
    
            it('emits a transfer event', async () => {
                const log = result.logs[0]
                log.event.should.eq('Transfer')
                const event = log.args
                // console.log(event)
                event.from.toString().should.equal(deployer, 'from is correct')
                event.to.toString().should.equal(receiver, 'to is correct')
                event._value.toString().should.equal(amount.toString(), 'value is correct')
            })
        })

        describe('failure', () => {
            it('rejects insufficient balance', async () => {
                let invalidAmount;
                invalidAmount = tokens(100000000); // greater than total supply
                await token.transferFrom(deployer, receiver, invalidAmount, { from: exchange }).should.be.rejectedWith(EVM_REVERT)
            })

            it('reject invalid recipients', async () => {
                await token.transferFrom(deployer, 0x0, amount, { from: deployer }).should.be.rejected
            })
        })
    })
})