
      var glines
      var mouseG
      var tooltip2

      var parseDate = d3.timeParse("%Y")

      var margin = {top: 50, right: 50, bottom: 1, left: 50}
      var width = 1600 - margin.left - margin.right
      var height = 800 - margin.top - margin.bottom

      var lineOpacity = 1
      var lineStroke = "5px"

      var axisPad = 7 // axis formatting
      var R = 6 //legend marker

      var category = ["Arkansas", "Louisiana", "Missouri", "Oklahoma", "Tennessee", "Texas"]

      var color = d3.scaleOrdinal()
        .domain(category)
        .range(["#9D2235", "#461D7C", "#F1B82D", "#004B87", "#58595B", "#BF5700"])
      d3.csv("data.csv", data => {

        var res = data.map((d,i) => {
          return {
            date : parseDate(d.year),
            bidding_no : d.bidding_no,
            state : d.state,
            rate : d.rate
          }
        })

        var xScale = d3.scaleTime()
          .domain(d3.extent(res, d=>d.date))
          .range([0, width])


        var yScale = d3.scaleLinear()
          .domain([0, 4.7])
          .range([height, 0]);

        var svg = d3.select("#chart").append("svg")
          .attr("width", "100%")
          .attr("height", "100%")
          .attr("viewBox", "20 20 " + 1600 + " " + 980)
          .append('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        // CREATE AXES //
        // render axis first before lines so that lines will overlay the horizontal ticks
        var xAxis = d3.axisBottom(xScale).ticks(d3.timeYear.every(1)).tickSizeOuter(axisPad*2).tickSizeInner(axisPad*2)
        var yAxis = d3.axisLeft(yScale).ticks(10, "s").tickSize(-width) //horizontal ticks across svg width

        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", `translate(0, ${height})`)
          .call(xAxis)
          .call(g => {
            var years = xScale.ticks(d3.timeYear.every(1))
            var xshift = (width/(years.length))/5 - 30
            g.selectAll("text").attr("transform", `translate(${xshift}, 0)`) //shift tick labels to middle of interval
              .style("text-anchor", "left")
              .attr("y", axisPad + 15)
              .attr('fill', 'black')
              .style("font-family", "Roboto")
              .style("font-size", 14)
              .style("font-weight", "bold")

            g.selectAll("line")
              .attr('stroke', 'black')

            g.select(".domain")
              .attr('stroke', 'black')

          })



        svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
          .call(g => {
            g.selectAll("text")
            .style("text-anchor", "middle")
            .attr("x", -axisPad*2)
            .attr('fill', 'black')
            .style("font-family", "Roboto")
            .style("font-size", 15)



            g.selectAll("line")
              .attr('stroke', 'black')
              .attr('stroke-width', 0.7) // make horizontal tick thinner and lighter so that line paths can stand out
              .attr('opacity', 0.3)

            g.select(".domain").remove()

           })
          .append('text')
            .attr('x', 130)
            .attr("y", 5)
            .attr("fill", "black")
            .text("Suicides per 100,000")
            .style("font-family", "Roboto")
            .style("font-size", "15px")


        // CREATE LEGEND //
        var svgLegend = svg.append('g')
            .attr('class', 'gLegend')
            .attr("transform", "translate(" + (width + 20) + "," + 0 + ")")

        var legend = svgLegend.selectAll('.legend')
          .data(category)
          .enter().append('g')
            .attr("class", "legend")
            .attr("transform", function (d, i) {return "translate(0," + i * 25 + ")"})

    svgLegend.append("rect")
            .attr("width", 115)
            .attr("height", 160)
            .attr("x", -120)
            .attr("y", 490)
            .style("fill", "black")
            .style("opacity", "0.1")


        legend.append("circle")
            .attr("class", "legend-node")
            .attr("cx", -101)
            .attr("cy", 508)
            .attr("r", 8)
            .style("fill", d=>color(d))
            // .style("padding", "30px")

        legend.append("text")
            .attr("class", "legend-text")
            .attr("x", -90)
            .attr("y", 514)
            .style("fill", "black")
            .style("font-size", 15)
            .style("font-family", "Roboto")
            .text(d=>d)


        // line generator
        var line = d3.line()
          .x(d => xScale(d.date))
          .y(d => yScale(d.rate))

        renderChart(1) // inital chart render (set default to Bidding Exercise 1 data)

        function renderChart(bidding_no) {
        //
          var resNew = res.filter(d=>d.bidding_no == parseInt(bidding_no))
        //

          var res_nested = d3.nest() // necessary to nest data so that keys represent each state category
            .key(d=>d.state)
            .entries(resNew)

          // APPEND MULTIPLE LINES //
          var lines = svg.append('g')
            .attr('class', 'lines')

          glines = lines.selectAll('.line-group')
            .data(res_nested).enter()
            .append('g')
            .attr('class', 'line-group')

          glines
            .append('path')
              .attr('class', 'line')
              .attr('d', d => line(d.values))
              .style('stroke', (d, i) => color(i))
              .style('fill', 'none')
              .style('opacity', lineOpacity)
              .style('stroke-width', lineStroke)


          // APPEND CIRCLE MARKERS //
          var gcircle = lines.selectAll("circle-group")
            .data(res_nested).enter()
            .append("g")
            .attr('class', 'circle-group')

          gcircle.selectAll("circle")
            .data(d => d.values).enter()
            .append("g")
            .attr("class", "circle")
            .append("circle")
            .attr("cx", d => xScale(d.date))
            .attr("cy", d => yScale(d.rate))
            .attr("r", 2)

          // CREATE HOVER TOOLTIP WITH VERTICAL LINE //
          tooltip2 = d3.select("#chart").append("div")
            .attr('id', 'tooltip')
            .style('position', 'absolute')
            .style("background-color", "Azure")
            .style('padding', 4)
            .style('display', 'none')

          mouseG = svg.append("g")
            .attr("class", "mouse-over-effects");

          mouseG.append("path") // create vertical line to follow mouse
            .attr("class", "mouse-line")
            .style("stroke", "#808080")
            .style("stroke-width", 1.5)
            .style("opacity", "0");

          var lines = document.getElementsByClassName('line');

          var mousePerLine = mouseG.selectAll('.mouse-per-line')
            .data(res_nested)
            .enter()
            .append("g")
            .attr("class", "mouse-per-line");

          mousePerLine.append("circle")
            .attr("r", 3)
            .style("stroke", function (d) {
              return color(d.key)
            })
            .style("fill", "none")
            .style("stroke-width", 2)
            .style("opacity", "0");

          mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mouseout', function () { // on mouse out hide line, circles and text
              d3.select(".mouse-line")
                .style("opacity", "0");
              d3.selectAll(".mouse-per-line circle")
                .style("opacity", "0");
              d3.selectAll(".mouse-per-line text")
                .style("opacity", "0");
              d3.selectAll("#tooltip")
                .style('display', 'none')

            })
            .on('mouseover', function () { // on mouse in show line, circles and text
              d3.select(".mouse-line")
                .style("opacity", "1");
              d3.selectAll(".mouse-per-line circle")
                .style("opacity", "1");
              d3.selectAll("#tooltip")
                .style('display', 'block')
            })
            .on('mousemove', function () { // update tooltip content, line, circles and text when mouse moves
              var mouse = d3.mouse(this)

              d3.selectAll(".mouse-per-line")
                .attr("transform", function (d, i) {
                  var xDate = xScale.invert(mouse[0]) // use 'invert' to get date corresponding to distance from mouse position relative to svg
                  var bisect = d3.bisector(function (d) { return d.date; }).left // retrieve row index of date on parsed csv
                  var idx = bisect(d.values, xDate);

                  d3.select(".mouse-line")
                    .attr("d", function () {
                      var data = "M" + xScale(d.values[idx].date) + "," + (height);
                      data += " " + xScale(d.values[idx].date) + "," + 0;
                      return data;
                    });
                  return "translate(" + xScale(d.values[idx].date) + "," + yScale(d.values[idx].rate) + ")";

                });

              updateTooltipContent(mouse, res_nested)

            })
          }

      function updateTooltipContent(mouse, res_nested) {

        sortingObj = []
        res_nested.map(d => {
          var xDate = xScale.invert(mouse[0])
          var bisect = d3.bisector(function (d) { return d.date; }).left
          var idx = bisect(d.values, xDate)
          sortingObj.push({key: d.values[idx].state, rate: d.values[idx].rate, year: d.values[idx].date.getFullYear()})
        })

        sortingObj.sort(function(x, y){
           return d3.descending(x.rate, y.rate);
        })

        var sortingArr = sortingObj.map(d=> d.key)

        var res_nested1 = res_nested.slice().sort(function(a, b){
          return sortingArr.indexOf(a.key) - sortingArr.indexOf(b.key) // rank vehicle category based on price of rate
        })

        tooltip2.html(sortingObj[0].date)
          .style('display', 'block')
          .style('left', d3.event.pageX - 110)
          .style('top', d3.event.pageY + 20)
          .style('opacity', 0.8)
          .selectAll()
          .data(res_nested1).enter() // for each vehicle category, list out name and price of rate
          .append('div')
          .attr("class", "tooltiptext")
          .style('color', "black")
          .style('font-size', 14)
          // .style('font-weight', "bold")
          .style("font-family", "Roboto")
          .html(d => {
            var xDate = xScale.invert(mouse[0])
            var bisect = d3.bisector(function (d) { return d.date; }).left
            var idx = bisect(d.values, xDate)
            return d.key + ": " + d.values[idx].rate.toString()
          })
      }

    })
