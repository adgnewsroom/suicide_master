var width = 900;
    height = 700;

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

var colorScale = d3.scaleLinear().range(["#fee5d9", "#a50f15"]).interpolate(d3.interpolateLab);

var countryById = d3.map();

// we use queue because we have 2 data files to load.
queue()
    .defer(d3.json, "USA.json")
    .defer(d3.csv, "rate.csv", typeAndSet) // process
    .await(loaded);

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
      .attr("transform", "translate(80,20)");

    var legendLinear = d3.legendColor()
      .shapeWidth(30)
      .orient('horizontal')
      .scale(linear);

    svg.select(".legendLinear")
      .call(legendLinear);

}
