const Token = artifacts.require('./Token');

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Token', (accounts) => {
    const name = 'My Name';
    const symbol = 'Symbol';
    const decimal = '18';
    const totaSupply = '10000000000000000000000';
    let token;

    beforeEach(async () => {
        token = new Token();
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
            const result = await token.decimal();
            result.toString().should.equal(decimal);
        })

        it('tracks the total supply', async () => {
            const result = await token.totalSupply();
            result.toString().should.equal(totalSupply);
        })
    })
})