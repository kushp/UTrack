'use strict';

var ACTIVITY_DATA_ADDED_EVENT = 'ACTIVITY_DATA_ADDED_EVENT';
var ACTIVITY_DATA_REMOVED_EVENT = 'ACTIVITY_DATA_REMOVED_EVENT';

var GRAPH_SELECTED_EVENT = 'GRAPH_SELECTED_EVENT';

/**
 * Represents a single activity data point.
 * @param activityType The type of activity. A string
 * @param healthMetricsDict A dictionary of different health metrics. The key is the
 * health data type (e.g., energy level, stress level, etc.), while the value is
 * the value the user gave to that activity.
 * @param activityDurationInMinutes A number
 * @constructor
 */
var ActivityData = function(activityType, healthMetricsDict, activityDurationInMinutes) {
    this.activityType = activityType;
    this.activityDataDict = healthMetricsDict;
    this.activityDurationInMinutes = activityDurationInMinutes
};

/**
 * An object which tracks all of the data
 * @constructor
 */
var ActivityStoreModel = function() {

};

// _ is the Underscore library
// This extends the JavaScript prototype with additional methods
// This is a common idiom for defining JavaScript classes
_.extend(ActivityStoreModel.prototype, {

    /* Listeners Array */
    listeners: [],

    /* Activity Data Points Array */
    activityDataPoints: [],

    /**
     * Add a listener to the listeners we track
     * @param listener The listener is a callback function with the following signature:
     * (eventType, eventTime, activityData) where eventType is a string indicating
     * the event type (one of ACTIVITY_DATA_ADDED_EVENT or ACTIVITY_DATA_REMOVED_EVENT), and
     * activityData the ActivityData added or removed.
     */
    addListener: function(listener) {
        this.listeners.push(listener);
    },

    /**
     * Should remove the given listener.
     * @param listener
     */
    removeListener: function(listener) {
        var index =  _.indexOf(this.listeners, listener);
        if(index != -1) {
            // Remove listener if it exists in the array
            this.listeners.splice(index, 1);
        }
    },

    /**
     * Should add the given data point, and alert listeners that a new data point has
     * been added.
     * @param activityDataPoint
     */
    addActivityDataPoint: function(activityDataPoint) {
        // We validate data here just in case it comes from somewhere other than the form.
        if(activityDataPoint.activityType == "" || activityDataPoint.activityType == undefined) {
            // Don't have to give on-screen output when validating here because our form does that, this is for advanced users
            console.log("Activity Type can't be empty");
            return;
        }

        if(activityDataPoint.activityDataDict == undefined) {
            console.log("Activity health dict is null");
            return;
        }

        var energyLevel = parseInt(activityDataPoint.activityDataDict.energyLevel);
        if(isNaN(energyLevel)) {
            console.log("Energy level must be an integer");
            return;
        } else if(energyLevel < 1 || energyLevel > 5) {
            console.log("Energy level must be between 1 and 5");
            return;
        }
        var stressLevel = parseInt(activityDataPoint.activityDataDict.stressLevel);
        if(isNaN(stressLevel)) {
            console.log("Stress level must be an integer");
            return;
        } else if(stressLevel < 1 || stressLevel > 5) {
            console.log("Energy level must be between 1 and 5");
            return;
        }
        var healthLevel = parseInt(activityDataPoint.activityDataDict.happinessLevel);
        if(isNaN(healthLevel)) {
            console.log("Happiness level must be an integer");
            return;
        } else if(healthLevel < 1 || healthLevel > 5) {
            console.log("Happiness level must be between 1 and 5");
            return;
        }

        var minutes = parseInt(activityDataPoint.activityDurationInMinutes);
        if(isNaN(minutes)) {
            console.log("Duration should be an integer");
            return;
        } else if(minutes < 0) {
            console.log("Duration should be >= 0");
            return;
        }

        this.activityDataPoints.push(activityDataPoint);
        var time = _.now();
        _.each(
            this.listeners,
            function(listener) {
                listener(ACTIVITY_DATA_ADDED_EVENT, time, activityDataPoint);
            }
        )
    },

    /**
     * Should remove the given data point (if it exists), and alert listeners that
     * it was removed. It should not alert listeners if that data point did not
     * exist in the data store
     * @param activityDataPoint
     */
    removeActivityDataPoint: function(activityDataPoint) {
        var index = this.activityDataPoints.indexOf(activityDataPoint);
        if(index != -1) {
            this.activityDataPoints.splice(index, 1);
            var time = _.now();
            _.each(
                this.listeners,
                function(listener) {
                    listener(ACTIVITY_DATA_REMOVED_EVENT, time, activityDataPoint);
                }
            )
        }
    },

    /**
     * Should return an array of all activity data points
     */
    getActivityDataPoints: function() {
        return this.activityDataPoints;
    }
});

/**
 * The GraphModel tracks what the currently selected graph is.
 * You should structure your architecture so that when the user chooses
 * a new graph, the event handling code for choosing that graph merely
 * sets the new graph here, in the GraphModel. The graph handling code
 * should then update to show the selected graph, along with any components
 * necessary to configure that graph.
 * @constructor
 */
var GraphModel = function() {

};

_.extend(GraphModel.prototype, {

    /* Our listeners */
    listeners: [],

    /* Available graph names */
    availableGraphNames: ["TimeTable", "HealthMetricsTable", "AverageHealthMetricsGraph"],

    /* Selected graph name */
    selectedGraph: "TimeTable",

    /**
     * Add a listener to the listeners we track
     * @param listener The listener is a callback function with the following signature:
     * (eventType, eventTime, eventData) where eventType is a string indicating
     * the event type (specifically, GRAPH_SELECTED_EVENT),
     * and eventData indicates the name of the new graph.
     */
    addListener: function(listener) {
        this.listeners.push(listener);
    },

    /**
     * Should remove the given listener.
     * @param listener
     */
    removeListener: function(listener) {
        var index =  _.indexOf(this.listeners, listener);
        if(index != -1) {
            // Remove listener if it exists in the array
            this.listeners.splice(index, 1);
        }
    },

    /**
     * Returns a list of graphs (strings) that can be selected by the user
     */
    getAvailableGraphNames: function() {
        return this.availableGraphNames;
    },

    /**
     * Should return the name of the currently selected graph. There should
     * *always* be one graph that is currently available.
     */
    getNameOfCurrentlySelectedGraph: function() {
        return this.selectedGraph;
    },

    /**
     * Changes the currently selected graph to the graph name given. Should
     * broadcast an event to all listeners that the graph changed.
     * @param graphName
     */
    selectGraph: function(graphName) {
        // Make sure graph isn't already selected and make sure it is in the available graph names array
        // array check is second because it is more expensive and better if we can avoid running it if first check is true.
        if(this.getNameOfCurrentlySelectedGraph() != graphName && _.indexOf(this.getAvailableGraphNames(), graphName) != -1) {
            this.selectedGraph = graphName;
            var time = _.now();
            _.each(
                this.listeners,
                function(listener) {
                    listener(GRAPH_SELECTED_EVENT, time, graphName);
                }
            );
        }
    }

});

/**
 * Will generate a number of random data points and add them to the model provided.
 * If numDataPointsToGenerate is not provided, will generate and add 100 data points.
 * @param activityModel The model to add data to
 * @param numDataPointsToGenerate The number of points to generate.
 *
 * Example:
 *
 * generateFakeData(new ActivityStoreModel(), 10);
 */
function generateFakeData(activityModel, numDataPointsToGenerate) {
    var fakeActivities = [];
    _.times(
        5,
        function() {
            fakeActivities.push("Activity " + (fakeActivities.length+1));
        }
    );
    numDataPointsToGenerate = (!_.isNumber(numDataPointsToGenerate) || numDataPointsToGenerate < 0) ? 100 : numDataPointsToGenerate;
    _.times(
        numDataPointsToGenerate,
        function() {
            var activityDataPoint = new ActivityData(
                fakeActivities[_.random(fakeActivities.length-1)],
                {
                    energyLevel: _.random(1, 5),
                    stressLevel: _.random(1, 5),
                    happinessLevel: _.random(1, 5)
                },
                _.random(60)
            );
            activityModel.addActivityDataPoint(activityDataPoint);
        }
    );
}
