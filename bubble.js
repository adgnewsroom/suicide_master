/* bubbleChart creation function. Returns a function that will
 * instantiate a new bubble chart given a DOM element to display
 * it in and a dataset to visualize.
 *
 * Organization and style inspired by:
 * https://bost.ocks.org/mike/chart/
 *
 */
function bubbleChart() {
  // Constants for sizing
  var width = 800;
  var height = 700;

  // tooltip for mouseover functionality
  var tooltip = floatingTooltip('tooltip', 240);


  var ageCenters = {
    low: { x: width / 3, y: height },
    medium: { x: width / 2, y: height },
    high: { x: 2 * width / 3, y: height }
  };

  // X locations of the year titles.
  var agesTitleX = {
    "0-5": 230,
    "6-11": width - 450,
    "12-18": width - 280,
  };


  // Locations to move bubbles towards, depending
  // on which view mode is selected.
  var center = { x: width / 2, y: height / 5 };

  var yearCenters = {
    2012: { x: width / 6 - 50, y: height / 2 },
    2013: { x: width / 3 - 50, y: height / 2 },
    2014: { x: width / 2 - 50, y: height / 2 },
    2015: { x: 1.9 * width / 3 - 50, y: height / 2 },
    2016: { x: 2.4 * width / 3 - 50, y: height / 2 },
    2017: { x: 2.7 * width / 3 - 10, y: height / 2 }
  };

  // X locations of the year titles.
  var yearsTitleX = {
    2012: 50,
    2013: width - 600,
    2014: width - 460,
    2015: width - 340,
    2016: width - 200,
    2017: width - 80
  };


  var mannerCenters = {
    Hanging: { x: width / 5 - 70, y: height },
    Gunshot: { x: width / 4 + 50, y: height },
    Overdose: { x: 2 * width / 3 - 180, y: height },
    Fire: { x: width - 330, y: height },
    Vehicle_Crash: { x: width - 190, y: height }
  };

  // X locations of the year titles.
  var mannersTitleX = {
    "Hanging": 100,
    "Gunshot": width - 660,
    "Overdose": width - 480,
    "Fire": width - 300,
    "Vehicle Crash": width - 150
  };


  // @v4 strength to apply to the position forces
  var forceStrength = 0.05;
  // var forceStrength1 = 0.08;


  // These will be set in create_nodes and create_vis
  var svg = null;
  var bubbles = null;
  var nodes = [];

  // Charge function that is called for each node.
  // As part of the ManyBody force.
  // This is what creates the repulsion between nodes.
  //
  // Charge is proportional to the diameter of the
  // circle (which is stored in the radius attribute
  // of the circle's associated data.
  //
  // This is done to allow for accurate collision
  // detection with nodes of different sizes.
  //
  // Charge is negative because we want nodes to repel.
  // @v4 Before the charge was a stand-alone attribute
  //  of the force layout. Now we can use it as a separate force!
  function charge(d) {
    return -Math.pow(d.radius, 2.35) * forceStrength;
  }


  // Here we create a force layout and
  // @v4 We create a force simulation now and
  //  add forces to it.
  var simulation = d3.forceSimulation()
    .velocityDecay(0.3)
    .force('x', d3.forceX().strength(forceStrength).x(center.x))
    .force('y', d3.forceY().strength(forceStrength).y(center.y))
    .force('charge', d3.forceManyBody().strength(charge))
    .on('tick', ticked);


  // @v4 Force starts up automatically,
  //  which we don't want as there aren't any nodes yet.
  simulation.stop();


  // Nice looking colors - no reason to buck the trend
  // @v4 scales now have a flattened naming scheme
  var fillColor = d3.scaleOrdinal()
    .domain(['f', 'm'])
    .range(['#262626', 'White']);


  /*
   * This data manipulation function takes the raw data from
   * the CSV file and converts it into an array of node objects.
   * Each node will store data and visualization values to visualize
   * a bubble.
   *
   * rawData is expected to be an array of data objects, read in from
   * one of d3's loading functions like d3.csv.
   *
   * This function returns the new node array, with a node in that
   * array for each element in the rawData input.
   */
  function createNodes(rawData) {
    // Use the max total_amount in the data as the max in the scale's domain
    // note we have to ensure the total_amount is a number.
    // var maxAmount = d3.max(rawData, function (d) { return +d.total_amount; });

    // Sizes bubbles based on area.
    // @v4: new flattened scale names.
    // var radiusScale = d3.scalePow()
    //   .exponent(0.5)
    //   .range([2, 85])
    //   .domain([0, maxAmount]);

    // Use map() to convert raw data into node data.
    // Checkout http://learnjsdata.com/ for more on
    // working with data.
    var myNodes = rawData.map(function (d) {
      return {
        radius: (9),
        name: d.name,
        manner: d.manner,
        // group: d.group,
        year: d.year,
        county: d.county,
        age: d.age,
        age_range: d.age_range,
        dob: d.dob,
        dod: d.dod,
        sex: d.sex,
        narrative: d.narrative,
        x: Math.random() * 900,
        y: Math.random() * 800
      };
    });

    // sort them to prevent occlusion of smaller nodes.
    myNodes.sort(function (a, b) { return b.value - a.value; });

    return myNodes;
  }

  /*
   * Main entry point to the bubble chart. This function is returned
   * by the parent closure. It prepares the rawData for visualization
   * and adds an svg element to the provided selector and starts the
   * visualization creation process.
   *
   * selector is expected to be a DOM element or CSS selector that
   * points to the parent element of the bubble chart. Inside this
   * element, the code will add the SVG continer for the visualization.
   *
   * rawData is expected to be an array of data objects as provided by
   * a d3 loading function like d3.csv.
   */
  var chart = function chart(selector, rawData) {
    // convert raw data into nodes data
    nodes = createNodes(rawData);

    // Create a SVG element inside the provided selector
    // with desired size.
    svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Bind nodes data to what will become DOM elements to represent them.
    bubbles = svg.selectAll('.bubble')
      .data(nodes, function (d) { return d.id; });

    // Create new circle elements each with class `bubble`.
    // There will be one circle.bubble for each object in the nodes array.
    // Initially, their radius (r attribute) will be 0.
    // @v4 Selections are immutable, so lets capture the
    //  enter selection to apply our transtition to below.
    var bubblesE = bubbles.enter().append('circle')
      .classed('bubble', true)
      .attr('r', 0)
      .attr('fill', function (d) { return fillColor(d.sex); })
      .attr('stroke', function (d) { return d3.rgb(fillColor(d.sex)).darker(); })
      .attr('stroke-width', 2)
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail);

    // @v4 Merge the original empty selection and the enter selection
    bubbles = bubbles.merge(bubblesE);

    // Fancy transition to make bubbles appear, ending with the
    // correct radius
    bubbles.transition()
      .duration(2000)
      .attr('r', function (d) { return d.radius; });

    // Set the simulation's nodes to our newly created nodes array.
    // @v4 Once we set the nodes, the simulation will start running automatically!
    simulation.nodes(nodes);
    // simulation1.nodes(nodes);






    // Set initial layout to single group.
    groupBubbles();
  };


  /*
   * Callback function that is called after every tick of the
   * force simulation.
   * Here we do the acutal repositioning of the SVG circles
   * based on the current x and y values of their bound node data.
   * These x and y values are modified by the force simulation.
   */
  function ticked() {
    bubbles
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; });
  }



  // function ticked1() {
  //   bubbles
  //     .attr('cx', function (d) { return d.x; })
  //     .attr('cy', function (d) { return d.y; });
  // }

  /*
   * Provides a x value for each node to be used with the split by year
   * x force.
   */
  function nodeYearPos(d) {
    return yearCenters[d.year].x;
  }

  function nodeAgePos(d) {
    return ageCenters[d.age_range].x;
  }

  function nodeMannerPos(d) {
    return mannerCenters[d.manner].x;
  }



  /*
   * Sets visualization in "single group mode".
   * The year labels are hidden and the force layout
   * tick function is set to move all nodes to the
   * center of the visualization.
   */
  function groupBubbles() {
    hideYearTitles();
    hideAgeTitles();
    hideMannerTitles();


    // @v4 Reset the 'x' force to draw the bubbles to the center.
    simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));

    // @v4 We can reset the alpha value and restart the simulation
    simulation.alpha(1).restart();
  }

  // function groupBubbles1() {
  //   hideYearTitles();
  //   hideAgeTitles();
  //
  //   // @v4 Reset the 'x' force to draw the bubbles to the center.
  //   simulation1.force('x', d3.forceX().strength(forceStrength).x(center.x));
  //
  //   // @v4 We can reset the alpha value and restart the simulation
  //   simulation1.alpha(1).restart();
  // }
  /*
   * Sets visualization in "split by year mode".
   * The year labels are shown and the force layout
   * tick function is set to move nodes to the
   * yearCenter of their data's year.
   */
  function splitBubbles() {
    showYearTitles();
    hideAgeTitles();
    hideMannerTitles();


    // @v4 Reset the 'x' force to draw the bubbles to their year centers
    simulation.force('x', d3.forceX().strength(forceStrength).x(nodeYearPos));


    // @v4 We can reset the alpha value and restart the simulation
    simulation.alpha(1).restart();
  }



  function splitBubbles1() {
    showAgeTitles();
    hideYearTitles();
    hideMannerTitles();


    // @v4 Reset the 'x' force to draw the bubbles to their year centers
    simulation.force('x', d3.forceX().strength(forceStrength).x(nodeAgePos));

    // @v4 We can reset the alpha value and restart the simulation
    simulation.alpha(1).restart();
  }


  function splitBubbles2() {
    showMannerTitles();
    hideYearTitles();
    hideAgeTitles();


    // @v4 Reset the 'x' force to draw the bubbles to their year centers
    simulation.force('x', d3.forceX().strength(forceStrength).x(nodeMannerPos));

    // @v4 We can reset the alpha value and restart the simulation
    simulation.alpha(1).restart();
  }


  /*
   * Hides Year title displays.
   */
  function hideYearTitles() {
    svg.selectAll('.year').remove();
  }

  function hideAgeTitles() {
    svg.selectAll('.age_range').remove();
  }

  function hideMannerTitles() {
    svg.selectAll('.manner').remove();
  }

  /*
   * Shows Year title displays.
   */
  function showYearTitles() {
    // Another way to do this would be to create
    // the year texts once and then just hide them.
    var yearsData = d3.keys(yearsTitleX);
    var years = svg.selectAll('.year')
      .data(yearsData);

    years.enter().append('text')
      .attr('class', 'year')
      .attr('x', function (d) { return yearsTitleX[d]; })
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; })
  }


  function showAgeTitles() {
    // Another way to do this would be to create
    // the year texts once and then just hide them.
    var agesData = d3.keys(agesTitleX);
    var ages = svg.selectAll('.age_range')
      .data(agesData);

    ages.enter().append('text')
      .attr('class', 'age_range')
      .attr('x', function (d) { return agesTitleX[d]; })
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
  }


  function showMannerTitles() {
    // Another way to do this would be to create
    // the year texts once and then just hide them.
    var mannersData = d3.keys(mannersTitleX);
    var manners = svg.selectAll('.manner')
      .data(mannersData);

    manners.enter().append('text')
      .attr('class', 'manner')
      .attr('x', function (d) { return mannersTitleX[d]; })
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
  }


  /*
   * Function called on mouseover to display the
   * details of a bubble in the tooltip.
   */
  function showDetail(d) {
    // change outline to indicate hover state.
    d3.select(this).attr('stroke', 'black');

    var content = '<span class="name">' +
                  d.name + '</span><br/>' + ' </span><span class="dob">' + d.dob + ' - ' + d.dod +
                  '</span><br/>' +
                  '<hr class="divider" /><span class="category">Manner: </span><span class="value">' +
                  d.manner +
                  '</span><br/>' +
                  '<span class="category">Age: </span><span class="value">' +
                  d.age +
                  '</span><br/>' +
                  '<span class="category">County: </span><span class="value">' +
                  d.county
                  ;

    tooltip.showTooltip(content, d3.event);
  }

  /*
   * Hides tooltip
   */
  function hideDetail(d) {
    // reset outline
    d3.select(this)
      .attr('stroke', d3.rgb(fillColor(d.sex)).darker());

    tooltip.hideTooltip();
  }

  /*
   * Externally accessible function (this is attached to the
   * returned chart function). Allows the visualization to toggle
   * between "single group" and "split by year" modes.
   *
   * displayName is expected to be a string and either 'year' or 'all'.
   */
  chart.toggleDisplay = function (displayName) {
    if (displayName === 'year') {
      splitBubbles();
    }

    else if (displayName === 'age_range') {
      splitBubbles1();
    }

    else if (displayName === 'manner') {
      splitBubbles2();
    }

    else {
      groupBubbles();
    };
  };


  // chart.toggleDisplay = function (displayName) {
  //   if (displayName === 'age_range') {
  //     splitBubbles1();
  //   } else {
  //     groupBubbles1();
  //   }
  // };


  // return the chart function from closure.
  return chart;
}

/*
 * Below is the initialization code as well as some helper functions
 * to create a new bubble chart instance, load the data, and display it.
 */

var myBubbleChart = bubbleChart();

/*
 * Function called once data is loaded from CSV.
 * Calls bubble chart function to display inside #vis div.
 */
function display(error, data) {
  if (error) {
    console.log(error);
  }

  myBubbleChart('#bubble', data);
}

/*
 * Sets up the layout buttons to allow for toggling between view modes.
 */
function setupButtons() {
  d3.select('#toolbar')
    .selectAll('.button')
    .on('click', function () {
      // Remove active class from all buttons
      d3.selectAll('.button').classed('active', false);
      // Find the button just clicked
      var button = d3.select(this);

      // Set it as the active button
      button.classed('active', true);

      // Get the id of the button
      var buttonId = button.attr('id');

      // Toggle the bubble chart based on
      // the currently clicked button.
      myBubbleChart.toggleDisplay(buttonId);
    });
}

/*
 * Helper function to convert a number into a string
 * and add commas to it to improve presentation.
 */
function addCommas(nStr) {
  nStr += '';
  var x = nStr.split('.');
  var x1 = x[0];
  var x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }

  return x1 + x2;
}

// Load the data.
// d3.csv('https://gist.githubusercontent.com/snphillips/92f33441701ebf0d74911ee502ad5f25/raw/9062a73469262854f5935a7858bc8c09be57bee1/gates_money.csv', display);
d3.csv('suicide.csv', display);


// setup the buttons.
setupButtons();


// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++==

  /*
 * Creates tooltip with provided id that
 * floats on top of visualization.
 * Most styling is expected to come from CSS
 * so check out bubble_chart.css for more details.
 */
function floatingTooltip(tooltipId, width) {
  // Local variable to hold tooltip div for
  // manipulation in other functions.
  var tt = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .attr('id', tooltipId)
    .style('pointer-events', 'none');

  // Set a width if it is provided.
  if (width) {
    tt.style('width', width);
  }

  // Initially it is hidden.
  hideTooltip();

  /*
   * Display tooltip with provided content.
   *
   * content is expected to be HTML string.
   *
   * event is d3.event for positioning.
   */
  function showTooltip(content, event) {
    tt.style('opacity', 0.9)
      .html(content);

    updatePosition(event);
  }

  /*
   * Hide the tooltip div.
   */
  function hideTooltip() {
    tt.style('opacity', 0.0);
  }

  /*
   * Figure out where to place the tooltip
   * based on d3 mouse event.
   */
  function updatePosition(event) {
    var xOffset = 20;
    var yOffset = 10;

    var ttw = tt.style('width');
    var tth = tt.style('height');

    var wscrY = window.scrollY;
    var wscrX = window.scrollX;

    var curX = (document.all) ? event.clientX + wscrX : event.pageX;
    var curY = (document.all) ? event.clientY + wscrY : event.pageY;
    var ttleft = ((curX - wscrX + xOffset * 2 + ttw) > window.innerWidth) ?
                 curX - ttw - xOffset * 2 : curX + xOffset;

    if (ttleft < wscrX + xOffset) {
      ttleft = wscrX + xOffset;
    }

    var tttop = ((curY - wscrY + yOffset * 2 + tth) > window.innerHeight) ?
                curY - tth - yOffset * 2 : curY + yOffset;

    if (tttop < wscrY + yOffset) {
      tttop = curY + yOffset;
    }

    tt
      .style('top', tttop + 'px')
      .style('left', ttleft + 'px');
  }

  return {
    showTooltip: showTooltip,
    hideTooltip: hideTooltip,
    updatePosition: updatePosition
  };
}
