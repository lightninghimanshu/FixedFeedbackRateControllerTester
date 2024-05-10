const { expect } = require('chai');
const { Caliper } = require('@hyperledger/caliper');
const { FixedFeedbackRateController } = require('@hyperledger/caliper/lib/rate-controllers');

describe('Fixed Feedback Rate Controller', () => {
  let caliper;
  let controller;

  beforeEach(async () => {
    caliper = new Caliper();
    controller = new FixedFeedbackRateController({
      type: 'fixed-feedback-rate',
      opts: {
        tps: 100,
        unfinished_per_client: 100,
      },
    });
  });

  it('Should send transactions at the specified rate', async () => {
    await caliper.start();
    await caliper.sendTransactions(1000);
    await caliper.stop();
    expect(caliper.getTransactionsSent()).to.equal(1000);
  });

  it('Should stop sending transactions when unfinished transactions exceed the threshold', async () => {
    await caliper.start();
    for (let i = 0; i < 1000; i++) {
      await caliper.sendTransaction();
    }
    await caliper.stop();
    expect(caliper.getTransactionsSent()).to.be.lessThan(1000);
  });

  it('Should resume sending transactions after the sleep period', async () => {
    await caliper.start();
    for (let i = 0; i < 1000; i++) {
      await caliper.sendTransaction();
    }
    await caliper.stop();
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await caliper.start();
    for (let i = 0; i < 1000; i++) {
      await caliper.sendTransaction();
    }
    await caliper.stop();
    expect(caliper.getTransactionsSent()).to.equal(2000);
  });
});

