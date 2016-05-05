'use strict';

// Put your view code here (e.g., the graph renderering code)

/**
 * This is the last updated view. Showing when activity was last added/removed.
 */
var LastEntryView = function(activityStoreModel) {
    var lastEntry = document.getElementById('last_entry');

    activityStoreModel.addListener(function (eventType, eventTime, activityData) {
        // We only want to detect data entries not deletes, so we check eventType.
        if(eventType == ACTIVITY_DATA_ADDED_EVENT) {
            var dateObj = new Date(eventTime);

            lastEntry.innerText = "Last data entry was: " + dateObj.toLocaleString();
        }
    });
};

/**
 * This is the time table view. Shows summary of minutes spent on each activity.
 */
var TimeTableView = function(tableElem, activityStoreModel) {
    activityStoreModel.addListener(function(eventType, eventTime, activityData) {
        // Get all activities
        var allActivities = activityStoreModel.getActivityDataPoints();

        // Group Activities by activityType
        var groupedActivities = _.groupBy(allActivities, function (activity) {
            return activity.activityType;
        });

        // Get table body and row template, we will need this to generate rows.
        var tableBody = tableElem.getElementsByTagName("tbody")[0];
        var rowTemplate = document.getElementById("timetable_data_row");

        // Clear table body as we have it (clear old data)
        tableBody.innerHTML = "";
        
        _.each(groupedActivities, function (group) {
            var activityName = group[0].activityType; // Safe to grab activity name this way, each doesn't iterate for empty
            var totalMinutes = 0;
            var groupLength = group.length;

            _.each(group, function (activity) {
                totalMinutes += activity.activityDurationInMinutes;
            });

            // Create new row
            var newRow = document.createElement("tr");

            // Grab innerHTML from template
            newRow.innerHTML = rowTemplate.innerHTML;

            // Fill Data
            newRow.getElementsByClassName("data_activity")[0].innerHTML = activityName;
            newRow.getElementsByClassName("data_num_entries")[0].innerHTML = groupLength;
            newRow.getElementsByClassName("data_average_minutes_spent")[0].innerHTML = Math.round(totalMinutes / groupLength);
            newRow.getElementsByClassName("data_minutes_spent")[0].innerHTML = totalMinutes;

            // Place on screen in our table body
            tableBody.appendChild(newRow);
        });
    });
}

/**
 * This is the health metrics table view. Shows summary of health metrics of each activity.
 */
var HealthMetricsTableView = function(tableElem, activityStoreModel) {
    activityStoreModel.addListener(function(eventType, eventTime, activityData) {
        // Get all activities
        var allActivities = activityStoreModel.getActivityDataPoints();

        // Group Activities by activityType
        var groupedActivities = _.groupBy(allActivities, function (activity) {
            return activity.activityType;
        });

        // Get table body and row template, we will need this to generate rows.
        var tableBody = tableElem.getElementsByTagName("tbody")[0];
        var rowTemplate = document.getElementById("healthmetrics_data_row");

        // Clear table body as we have it (clear old data)
        tableBody.innerHTML = "";

        _.each(groupedActivities, function (group) {
            var activityName = group[0].activityType; // Safe to grab activity name this way, each doesn't iterate for empty
            var totalEnergy = 0;
            var totalStress = 0;
            var totalHappiness = 0;
            var groupLength = group.length;

            _.each(group, function (activity) {
                totalEnergy += activity.activityDataDict.energyLevel;
                totalStress += activity.activityDataDict.stressLevel;
                totalHappiness += activity.activityDataDict.happinessLevel;
            });

            // Create new row
            var newRow = document.createElement("tr");

            // Grab innerHTML from template
            newRow.innerHTML = rowTemplate.innerHTML;

            // Fill Data
            newRow.getElementsByClassName("data_activity")[0].innerHTML = activityName;
            newRow.getElementsByClassName("data_num_entries")[0].innerHTML = groupLength;
            newRow.getElementsByClassName("data_energy_level")[0].innerHTML = totalEnergy;
            newRow.getElementsByClassName("data_stress_level")[0].innerHTML = totalStress;
            newRow.getElementsByClassName("data_happiness_level")[0].innerHTML = totalHappiness;

            // Place on screen in our table body
            tableBody.appendChild(newRow);
        });
    });
}

/**
 * This function draws the initial empty health graph, just in case someone decides to look before adding points :)
 * Also used for re-painting.
 */
function drawInitialHealthGraph(graph) {    
    var ctx = graph.getContext("2d");

    var width = graph.width;
    var height = graph.height;

    // Set Font
    ctx.font = "14px Arial"

    // Draw vertical axis
    ctx.moveTo(20, 0);
    ctx.lineTo(20, height - 20);
    ctx.stroke();

    // Draw horizontal axis
    ctx.lineTo(width, height - 20);
    ctx.stroke();

    // Fill Legend Square Colours
    ctx.fillStyle= "#FFD800";
    ctx.fillRect(40, 0, 25, 25);
    ctx.fillStyle = "#587498";
    ctx.fillRect(240, 0, 25, 25);
    ctx.fillStyle = "#E86850";
    ctx.fillRect(440, 0, 25, 25);

    // Fill Legend Text Labels
    ctx.fillStyle="#000000";
    ctx.fillText("Average Energy Level", 70, 17);
    ctx.fillText("Average Stress Level", 270, 17);
    ctx.fillText("Average Happiness Level", 470, 17);

    // Draw Vertical Labels
    ctx.fillStyle = "#000000";
    ctx.fillText("0", 0, height - 14);
    ctx.fillText("1", 0, height - 78);
    ctx.fillText("2", 0, height - 142);
    ctx.fillText("3", 0, height - 206);
    ctx.fillText("4", 0, height - 270);
    ctx.fillText("5", 0, height - 334);
}

/**
 * This is the health graph view. Shows average health metrics for each activity through all entries.
 */
var HealthGraphView = function(graphElem, activityStoreModel) {
    // Draw initial health graph for first time.
    drawInitialHealthGraph(graphElem);

    this.repaint = function(toggleEnergy, toggleStress, toggleHappiness) {
        // Get all activities
        var allActivities = activityStoreModel.getActivityDataPoints();

        // Group Activities by activityType
        var groupedActivities = _.groupBy(allActivities, function(activity) {
            return activity.activityType;
        });

        var ctx = graphElem.getContext("2d");
        var width = graphElem.width;
        var height = graphElem.height;

        // Clear previous painting so we can repaint
        ctx.clearRect(0, 0, width, height);

        // Have to re-paint initial graph
        drawInitialHealthGraph(graphElem);

        // Now we can fill Data
        var currentX = 50;

        _.each(groupedActivities, function(group) {
            var activityName = group[0].activityType; // Safe to grab activity name this way, each doesn't iterate for empty
            var totalEnergy = 0;
            var totalStress = 0;
            var totalHappiness = 0;
            var groupLength = group.length;

            _.each(group, function(activity) {
                totalEnergy += activity.activityDataDict.energyLevel;
                totalStress += activity.activityDataDict.stressLevel;
                totalHappiness += activity.activityDataDict.happinessLevel;
            });

            // Fill average energy level bar
            if(toggleEnergy) {
                ctx.fillStyle = "#FFD800";
                ctx.fillRect(currentX, height - 20 - (totalEnergy / groupLength) * 64, 25, (totalEnergy / groupLength) * 64);
            }

            if(toggleStress) {
                // Fill average stress level bar
                ctx.fillStyle = "#587498";
                ctx.fillRect(currentX + 25, height - 20 - (totalStress / groupLength) * 64, 25, (totalStress / groupLength) * 64);
            }

            if(toggleHappiness) {
                // Fill average happiness level bar
                ctx.fillStyle = "#E86850";
                ctx.fillRect(currentX + 50, height - 20 - (totalHappiness / groupLength) * 64, 25, (totalHappiness / groupLength) * 64);
            }

            // Fill activity label
            ctx.fillStyle = "#000000"
            // The 8 + (8 - activityName.length) * 4 provides the optimal activity name label positioning.
            ctx.fillText(activityName, currentX + 8 + (8 - activityName.length) * 4, height - 3);

            // Increment for next activity
            currentX += 105; // 20 * 3 + 20 (15 is margin left). 3 bars of width 20.
        });
    }

    var self = this;
    activityStoreModel.addListener(function(eventType, eventTime, activityData) {
        self.repaint(document.getElementById("avg_energy_toggle").checked, document.getElementById("avg_stress_toggle").checked,
            document.getElementById("avg_happiness_toggle").checked);
    });
}

/**
 * This is the view for switching to health metrics tab.
 */
var HealthMetricsTab = function(graphTab, graphModel) {
    graphModel.addListener(function(eventType, eventTime, eventData) {
        if(eventData == "AverageHealthMetricsGraph") {
            // Select health metrics tab
            graphTab.parentNode.classList.add("active");
            document.getElementById("health_graph_container").classList.add("show");
        } else {
            // A different tab was selected, hide this one if visible.
            graphTab.parentNode.classList.remove("active");
            if(document.getElementById("health_graph_container").classList.contains("show")) {
                document.getElementById("health_graph_container").classList.remove("show");
            }
        }
    });
}

/**
 * This is the view for switching to time table tab.
 */
var MinutesSpentTab = function(minutesTab, graphModel) {
    graphModel.addListener(function(eventType, eventTime, eventData) {
        if(eventData == "TimeTable") {
            // Select minutes spent tab
            minutesTab.parentNode.classList.add("active");
            document.getElementById("time_table_container").classList.add("show");
        } else {
            // A different tab was selected, hide this one if visible.
            minutesTab.parentNode.classList.remove("active");
            document.getElementById("time_table_container").classList.remove("show");
        }
    });
}


/**
 * This is the view for switching to health metrics table tab.
 */
var HealthMetricsTableTab = function(healthTableTab, graphModel) {
    graphModel.addListener(function(eventType, eventTime, eventData) {
        if(eventData == "HealthMetricsTable") {
            // Select minutes spent tab
            healthTableTab.parentNode.classList.add("active");
            document.getElementById("health_metrics_table_container").classList.add("show");
        } else {
            // A different tab was selected, hide this one if visible.
            healthTableTab.parentNode.classList.remove("active");
            document.getElementById("health_metrics_table_container").classList.remove("show");
        }
    });
}