'use strict';

var expect = chai.expect;
describe('First unit test', function() {

    it('Some tests', function() {
        /*
         We're using Mocha and Chai to do unit testing.

         Mocha is what sets up the tests (the "describe" and "it" portions), while
         Chai does the assertion/expectation checking.

         Links:
         Mocha: http://mochajs.org
         Chai: http://chaijs.com

         Note: This is a bunch of tests in one it; you'll probably want to separate them
         out into separate groups to make debugging easier. It's also more satisfying
         to see a bunch of unit tests pass on the results page :)
        */

        // Here is the most basic test you could think of:
        expect(1==1, '1==1').to.be.ok;

        // You can also for equality:
        expect(1, '1 should equal 1').to.equal(1);

        // JavaScript can be tricky with equality tests
        expect(1=='1', "1 should == '1'").to.be.true;

        // Make sure you understand the differences between == and ===
        expect(1==='1', "1 shouldn't === '1'").to.be.false;

        // Use eql for deep comparisons
        expect([1] == [1], "[1] == [1] should be false because they are different objects").to.be.false;

        expect([1], "[1] eqls [1] should be true").to.eql([1]);
    });

    it('Callback demo unit test', function() {
        /*
        Suppose you have a function or object that accepts a callback function,
        which should be called at some point in time (like, for example, a model
        that will notify listeners when an event occurs). Here's how you can test
        whether the callback is ever called.
         */

        // First, we'll create a function that takes a callback, which the function will
        // later call with a single argument. In tests below, we'll use models that
        // take listeners that will be later called
        var functionThatTakesCallback = function(callbackFn) {
            return function(arg) {
                callbackFn(arg);
            };
        };

        // Now we want to test if the function will ever call the callbackFn when called.
        // To do so, we'll use Sinon's spy capability (http://sinonjs.org/)
        var spyCallbackFn = sinon.spy();

        // Now we'll create the function with the callback
        var instantiatedFn = functionThatTakesCallback(spyCallbackFn);

        // This instantiated function should take a single argument and call the callbackFn with it:
        instantiatedFn("foo");

        // Now we can check that it was called:
        expect(spyCallbackFn.called, 'Callback function should be called').to.be.ok;

        // We can check the number of times called:
        expect(spyCallbackFn.callCount, 'Number of times called').to.equal(1);

        // And we can check that it got its argument correctly:
        expect(spyCallbackFn.calledWith('foo'), 'Argument verification').to.be.true;

        // Or, equivalently, get the first argument of the first call:
        expect(spyCallbackFn.args[0][0], 'Argument verification 2').to.equal('foo');

        // This should help you understand the listener testing code below
    });

    // My unit tests - Kush

    // We were told to ignore test given because it was broken, but I modified it to make it work for me
    it('Listener unit test for GraphModel', function() {
        var graphModel = new GraphModel();
        var firstListener = sinon.spy();

        graphModel.addListener(firstListener);
        graphModel.selectGraph("AverageHealthMetricsGraph");

        expect(firstListener.called, 'GraphModel listener should be called').to.be.ok;
        expect(firstListener.args[0][2] == "AverageHealthMetricsGraph", 'GraphModel argument verification').to.be.true;

        var secondListener = sinon.spy();
        graphModel.addListener(secondListener);
        graphModel.selectGraph("TimeTable");
        expect(firstListener.callCount, 'GraphModel first listener should have been called twice').to.equal(2);
        expect(secondListener.called, "GraphModel second listener should have been called").to.be.ok;
    });

    it('Test Selecting Self for GraphModel', function() {
        var graphModel = new GraphModel();
        var listener = sinon.spy();

        graphModel.addListener(listener);
        graphModel.selectGraph("TimeTable");

        expect(listener.callCount, 'GraphModel listener should not be called').to.equal(0);
    });

    it('Test Selecting Non-available Graph', function() {
        var graphModel = new GraphModel();
        var listener = sinon.spy();

        graphModel.addListener(listener);
        graphModel.selectGraph("FakeGraph");

        expect(listener.callCount, 'GraphModel listener should not be called').to.equal(0);
    });

    it('Test Removing Listener from GraphModel', function() {
        var graphModel = new GraphModel();
        var listener = sinon.spy();
        var listener2 = sinon.spy();

        graphModel.addListener(listener2);
        graphModel.addListener(listener);

        graphModel.removeListener(listener);

        graphModel.selectGraph("AverageHealthMetricsGraph");

        expect(listener.callCount, 'GraphModel listener should not be called').to.equal(0);
        expect(listener2.callCount, 'GraphModel listener2 should be called').to.equal(1);
    });

    it('Test Arguments and Selected Graph Method ', function() {
        var graphModel = new GraphModel();
        var listener = sinon.spy();

        graphModel.addListener(listener);

        graphModel.selectGraph("AverageHealthMetricsGraph");

        expect(listener.args[0][0] == "GRAPH_SELECTED_EVENT", 'First argument').to.be.true;
        expect(listener.args[0][2] == "AverageHealthMetricsGraph", 'Second argument').to.be.true;

        expect(graphModel.getNameOfCurrentlySelectedGraph() == "AverageHealthMetricsGraph", 'Check currently selected name method for change.').to.be.true;
    });

    it('Test Add and Remove Activity for Activity Model', function() {
        var activityModel = new ActivityStoreModel();
        var activityPoint = new ActivityData("Programming", {energyLevel: 5, stressLevel: 4, happinessLevel: 3}, 60);
        var listener = sinon.spy();

        activityModel.addListener(listener);

        activityModel.addActivityDataPoint(activityPoint);

        expect(listener.callCount, 'GraphModel listener should be called').to.equal(1);

        // Should have the activity point in there
        expect(activityModel.getActivityDataPoints().length == 1, 'Test activity data points length').to.be.true;

        // This should not call listener as that data point doesn't exist
        activityModel.removeActivityDataPoint(new ActivityData("Studying"),  {energyLevel: 5, stressLevel: 4, happinessLevel: 3}, 60);
        expect(listener.callCount, 'GraphModel listener should not be called').to.equal(1);

        // Now this should
        activityModel.removeActivityDataPoint(activityPoint);
        expect(listener.callCount, 'GraphModel listener should be called').to.equal(2);

        // Should be gone
        expect(activityModel.getActivityDataPoints() == 0, 'Test activity data points length').to.be.true;
    })
});
