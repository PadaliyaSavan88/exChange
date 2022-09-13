import { tokens, ether, EVM_REVERT, ETHER_ADDRESS } from './helper';

const Exchange = artifacts.require('./Exchange');
const Token = artifacts.require('./Token');

require('chai')
    .use(require('chai-as-promised'))
    .should();

contract('Exchange', ([deployer, feeAccount, user1]) => {
    let exchange;
    let token;
    const feePercent = 10;

    beforeEach(async () => {
        // Deploy Tokens
        token = await Token.new();

        // Transfer some tokens to user1
        token.transfer(user1, tokens(100), { from: deployer });
        
        // Deploy Exchange
        exchange = await Exchange.new(feeAccount, feePercent);
    })

    describe('development', () => {
        it('tracks the fee account', async() => {
            const result = await exchange.feeAccount();
            result.should.equal(feeAccount);
        })

        it('tracks the fee percent', async() => {
            const result = await exchange.feePercent();
            result.toString().should.equal(feePercent.toString());
        })
    })

    describe('fallback', () => {
        it('revert when ether is sent', async () => {
            await exchange.sendTransaction({value: ether(1), from: user1 }).should.be.rejectedWith(EVM_REVERT)
        })
    })

    describe('depositing ether', () => {
        let result
        let amount
        beforeEach(async () => {
            amount = ether(1)
            result = await exchange.depositeEther({from: user1, value: amount})
        })

        it('track the Ether deposit', async() => {
            let balance = await exchange.tokens(ETHER_ADDRESS, user1)
            balance.toString().should.equal(amount.toString())
        })
        it('emit deposit event', async () => {
            const log = result.logs[0];
            log.event.should.eq('Deposit');
            const event = log.args;
            event.token.should.equal(ETHER_ADDRESS, 'token address is correct');
            event.user.should.equal(user1, 'user address is correct');
            event.amount.toString().should.equal(amount.toString(), 'amount is correct');
            event.balance.toString().should.equal(amount.toString(), 'balance is correct');
        })
    })

    describe('withdraw ether',  () => {
        let result;
        let amount;

        beforeEach(async() => {
            amount = ether(1)
            result = await exchange.depositeEther({from: user1, value: amount})
        })

        describe('success', () => {
            beforeEach(async() => {
                result = await exchange.withdrawEther(amount, {from: user1})
            })

            it('withdraws Ether fund', async() => {
                const balance = await exchange.tokens(ETHER_ADDRESS, user1)
                balance.toString().should.equal('0')
            })

            it('emit withdraw event', async () => {
                const log = result.logs[0];
                log.event.should.eq('Withdraw');
                const event = log.args;
                event.token.should.equal(ETHER_ADDRESS);
                event.user.should.equal(user1);
                event.amount.toString().should.equal(amount.toString(), 'amount is correct');
                event.balance.toString().should.equal('0');
            })
        })

        describe('failure', () => {
            it('rejects withdraw for insufficient balances', async () => {
                await exchange.withdrawEther(ether(100), {from: user1}).should.be.rejectedWith(EVM_REVERT)
            })
        })
    })

    describe('depositing tokens', () => {
        let result;
        let amount;

        beforeEach(async () => {
            amount = tokens(10)
            await token.approve(exchange.address, amount, { from: user1 })
            result = await exchange.depositeToken(token.address, amount, { from: user1 })
        })

        describe('success', () => {
            it('tracks the token deposit', async () => {
                let balance;
                balance = await token.balanceOf(exchange.address);
                balance.toString().should.equal(amount.toString());

                // Check tokens on exchange
                balance = await exchange.tokens(token.address, user1);
                balance.toString().should.equal(amount.toString());
            })

            it('emit deposit event', async () => {
                const log = result.logs[0];
                log.event.should.eq('Deposit');
                const event = log.args;
                event.token.should.equal(token.address, 'token address is correct');
                event.user.should.equal(user1, 'user address is correct');
                event.amount.toString().should.equal(tokens(10).toString(), 'amount is correct');
                event.balance.toString().should.equal(tokens(10).toString(), 'balance is correct');
            })
        })

        describe('failure', () => {
            it('rejects Ether deposits', async () => {
                await exchange.depositeToken(ETHER_ADDRESS, tokens(10), {from: user1}).should.be.rejectedWith(EVM_REVERT);
            })

            it('fails when no tokens are approved', async () => {
                await exchange.depositeToken(token.address, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT);
            })
        })
    })

    describe('withdrawing tokens', () => {
        let result;
        let amount;

        describe('success', async () => {
            beforeEach(async() => {
                //Deposit token first
                amount = tokens(10)
                await token.approve(exchange.address, amount, { from: user1 })
                await exchange.depositeToken(token.address, amount, { from: user1 })

                //Withdraw token
                result = await exchange.withdrawToken(token.address, amount, { from: user1 })
            })

            it('withdraws token funds', async () => {
                const balance = await exchange.tokens(token.address, user1)
                balance.toString().should.equal('0')
            })

            it('emits a withdraw event', async () => {
                const log = result.logs[0];
                log.event.should.eq('Withdraw');
                const event = log.args;
                event.token.should.equal(token.address);
                event.user.should.equal(user1);
                event.amount.toString().should.equal(amount.toString(), 'amount is correct');
                event.balance.toString().should.equal('0');
            })
        })

        describe('failure', async() => {
            it('rejects Ether withdrawal', async () => {
                await exchange.withdrawToken(ETHER_ADDRESS, ether(1), {from: user1}).should.be.rejectedWith(EVM_REVERT)
            })

            it('fails for insufficient funds', async () => {
                await exchange.withdrawToken(token.address, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            })
        })
    })

    describe('checking balance', () => {
        beforeEach(async () => {
            await exchange.depositeEther({from: user1, value: ether(1)})
        })

        it('returns user ether balance', async () => {
            const result = await exchange.balanceOf(ETHER_ADDRESS, user1)
            result.toString().should.equal(ether(1).toString())
        })
    })
})