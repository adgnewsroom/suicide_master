var width = 900;
    height = 700;

var currentYear = 1999;

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-5, 0])
  .html(function(d) {
    var dataRow = countryById.get(d.properties.name);
       if (dataRow) {
           console.log(dataRow);
           return dataRow.states + ": " + dataRow.rate;
       } else {
           console.log("no dataRow", d);
           return d.properties.name + ": No data.";
       }
  })


var svg = d3.select('#vis').append('svg')
    .attr("width", "80%")
    .attr("height", "80%")
    .attr("viewBox", "20 20 " + width + " " + height)

svg.call(tip);

var projection = d3.geoAlbersUsa()
    .scale(1200) // mess with this if you want
    .translate([width / 2, height / 2]);

var path = d3.geoPath()
    .projection(projection);

var colorScale = d3.scaleLinear().range(["#f7f7f7", "#252525"]).interpolate(d3.interpolateLab);

var countryById = d3.map();

// we use queue because we have 2 data files to load.
queue()
    .defer(d3.json, "USA.json")
    .defer(d3.csv, "rate.csv", typeAndSet) // process
    .await(loaded);


    Promise.all([
      d3.json("USA.json"),
      d3.csv("rate.csv")
])

function typeAndSet(d) {
    d.rate = +d.rate;
    countryById.set(d.states, d);
    return d;
}

function getColor(d) {
    var dataRow = countryById.get(d.properties.name);
    if (dataRow) {
        console.log(dataRow);
        return colorScale(dataRow.rate);
    } else {
        console.log("no dataRow", d);
        return "#ccc";
    }
}


function loaded(error, usa, rate) {

    console.log(usa);
    console.log(rate);

    colorScale.domain(d3.extent(rate, function(d) {return d.rate;}));

    var states = topojson.feature(usa, usa.objects.units).features;

    svg.selectAll('path.states')
        .data(states)
        .enter()
        .append('path')
        .attr('class', 'states')
        .attr('d', path)
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .attr('fill', function(d,i) {
            console.log(d.properties.name);
            return getColor(d);
        })
        .append("title");

    var linear = colorScale;

    svg.append("g")
      .attr("class", "legendLinear")
      .attr("transform", "translate(80,20)")
      .attr("stroke", "black")
      .attr("stroke-width", 0.5);


    var legendLinear = d3.legendColor()
      .shapeWidth(30)
      .orient('horizontal')
      .scale(linear);

    svg.select(".legendLinear")
      .call(legendLinear);

}




//
//
//
//
//
//

//DATE PICKER
var datepicker = svg.append("g")
                  .attr("transform","translate(480,680)");

datepicker.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("rx", 10)
  .attr("ry", 10)
  .attr("width", 60)
  .attr("height", 30)
  .style("fill", "gray");

datepicker.append("text")
    .attr("id", "yearText")
    .attr("x", 8)
    .attr("y", 7)
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "hanging")
    .style("font-size", "20px")
    .style("padding", "100px")
    .style("fill", "white")
    .style("font-family", "'Roboto', sans-serif")
    .html(currentYear);

    //left arrow
    var leftarrow = datepicker.append("g")
       .attr("transform","translate(-30,3)");

    leftarrow.append("rect")
        .attr("x", 3)
        .attr("y", 0)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "#cccccc")
        .style("cursor", "pointer")
        .on("click", function(){

          //make right reappear if it's invisible

          d3.select("#rightArrow")
            .style("display", "block");

          if(currentYear > 1999){
            currentYear -= 1;
          }

          if(currentYear == 1999) {
            d3.select("#leftArrow")
              .style("display", "none")
              .style("cursor", "default");
          }

          d3.select("#yearText")
            .html(currentYear);

          updateBubbleMap(currentYear);
        });

    leftarrow.append("path")
       .attr("d", "M12 0c6.623 0 12 5.377 12 12s-5.377 12-12 12-12-5.377-12-12 5.377-12 12-12zm0 1c6.071 0 11 4.929 11 11s-4.929 11-11 11-11-4.929-11-11 4.929-11 11-11zm3 5.753l-6.44 5.247 6.44 5.263-.678.737-7.322-6 7.335-6 .665.753z")
       .attr("id", "leftArrow")
       .attr("fill", "gray")
       .attr("fill-rule", "evenodd")
       .attr("clip-rule", "evenodd")
       .style("display", "none")
       .style("cursor", "pointer")
       .on("click", function(){

         //make right reappear if it's invisible

         d3.select("#rightArrow")
           .style("display", "block");

         if(currentYear > 1999){
           currentYear -= 1;
         }

         if(currentYear == 1999) {
           d3.select("#leftArrow")
             .style("display", "none")
             .style("cursor", "default");
         }

         d3.select("#yearText")
           .html(currentYear);

         updateBubbleMap(currentYear);
       });



  //right arrow

  var rightarrow = datepicker.append("g")
     .attr("transform","translate(65,3)");

  rightarrow.append("rect")
      .attr("x", 3)
      .attr("y", 0)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", "#cccccc")
      .style("cursor", "pointer")
      .on("click", function(){

        d3.select("#leftArrow")
          .style("display", "block");

          if(currentYear < 2017){
              currentYear += 1;
                }

          if(currentYear == 2017) {
            d3.select("#rightArrow")
            .style("display", "none")
            .style("cursor", "default");
                }

          d3.select("#yearText")
            .html(currentYear);

          updateBubbleMap(currentYear);

            });

   rightarrow.append("path")
      .attr("id", "rightArrow")
      .attr("d", "M12 0c6.623 0 12 5.377 12 12s-5.377 12-12 12-12-5.377-12-12 5.377-12 12-12zm0 1c6.071 0 11 4.929 11 11s-4.929 11-11 11-11-4.929-11-11 4.929-11 11-11zm-3 5.753l6.44 5.247-6.44 5.263.678.737 7.322-6-7.335-6-.665.753z")
      .attr("fill", "gray")
      .attr("fill-rule", "evenodd")
      .attr("clip-rule", "evenodd")
      .style("cursor","pointer")
      .on("click", function(){
          d3.select("#leftArrow")
            .style("display", "block");
          if(currentYear < 2017){
            currentYear += 1;
          }
          if(currentYear == 2017) {
            d3.select("#rightArrow")
              .style("display", "none")
              .style("cursor", "default");
          }
          d3.select("#yearText")
            .html(currentYear);
          updateBubbleMap(currentYear);
      });



      var updateBubbleMap = function(newYear){


        console.log(data[1].filter(function(d){ return d["CAL_YR"] == newYear; }));

        var bubbles = svg.selectAll(".bubbles")
          .data(data[1].filter(function(d){ return d["CAL_YR"] == newYear; }).filter(function(d){ return d["LATITUDE"] != 0;}))
          .enter()
          .append("circle")
          .attr("class", "bubbles")
          .attr("cx", function (d) {
            if(projectLatLong([d["LONGITUDE"], d["LATITUDE"]]) != null){
              return projectLatLong([d["LONGITUDE"], d["LATITUDE"]])[0];
            }
          })
          .attr("cy", function (d) {
            if(projectLatLong([d["LONGITUDE"], d["LATITUDE"]]) != null){
              return projectLatLong([d["LONGITUDE"], d["LATITUDE"]])[1];
            }
          })
          .attr("r", function(d){ return accidentScale(d["accident_rate"]); })
          .attr("fill", "#de2d26")
          .attr("opacity", 0.5)
          .attr("stroke", "white")
          .attr("stroke-width", 0.5)
          .on("mouseover", function(d) {
                d3.select(".tooltip")
                  .style("opacity", 1)
                  .style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY-5) + "px")
                  .style("font-size", "12px")
                  .style("font-family", "'Roboto', sans-serif")
                  .html("<strong style='color:firebrick; font-size:11pt;'>" + d["CURRENT_MINE_NAME"] +
                  "</strong>" + "<br>" + "<br>" + "Accident rate: " + "<strong style='color:firebrick;'>" +
                  d["accident_rate"] + "</strong>" + "<br>" + "Owned by " + "<strong style='color:steelblue;'>" +
                  d["CONTROLLER_NAME"] + "</strong>" + "<br>" + "Located near " + "<strong style='color:steelblue;'>" +
                  d["NEAREST_TOWN"] + ", " + d["STATE"]) + "</strong>";
          })
          .on("mouseout", function(d) {
                d3.select(".tooltip")
                  .style("opacity",0);
          })
      }
