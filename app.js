$(document).ready(() => {
  const svgSize = {
    width: 1400,
    height: 700
  }
  const WIDTH = "width", HEIGHT = "height", X = "x", Y = "y";

  const svg = d3.select("svg").attr(WIDTH, svgSize.width).attr(HEIGHT, svgSize.height);
  const us = svg.append("g").attr("id", "us");
  const legend = svg.append("g").attr("id", "legend")
  const tooltip = d3.select("#tooltip");
  
  const UScontryData = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
  const USeducationData = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
  
  const jsonParse = (value, callback) => {
    d3.json(value).then(data => callback(null, data));
  }

  d3.queue()
  .defer(jsonParse, UScontryData)
  .defer(jsonParse, USeducationData)
  .await((error, result1, result2) => {
    if (error) {
      console.log(error);
    } else {
      svgHandle(result1, result2);
    }
  })

  const svgHandle = (map, edu) => {
    const state = topojson.mesh(map, map.objects.states, (a, b) => a !== b);
    const countries = topojson.feature(map, map.objects.counties);

    const domainOfEdu = [3, 12, 21, 30, 39, 48, 57, 66];
    const colorScale = d3.scaleThreshold().domain(domainOfEdu).range(d3.schemeGreens[domainOfEdu.length]);

    us.selectAll("path").data(countries.features).enter().append("path").attr("d", d3.geoPath())
    .attr("class", "county")
    .attr("fill", d => {
      return colorScale(edu.filter(val => val.fips === d.id)[0].bachelorsOrHigher);
    }).attr("data-fips", d => d.id).attr("data-education", d => edu.filter(val => val.fips === d.id)[0].bachelorsOrHigher)
    .on("mouseover", event => {
      const fipsData = parseInt(event.target.attributes["data-fips"].value);
      tooltip.style("opacity", 0.7).text(`${edu.filter(val => val.fips === fipsData)[0]["area_name"]}, ${edu.filter(val => val.fips === fipsData)[0].state}: ${edu.filter(val => val.fips === fipsData)[0].bachelorsOrHigher}`)
      .style("top", `${$(event.target)[0].getBoundingClientRect().top + window.scrollY}px`)
      .style("left", `${$(event.target)[0].getBoundingClientRect().left + 20}px`)
      .attr("data-education", edu.filter(val => val.fips === fipsData)[0].bachelorsOrHigher);
    })
    .on("mouseout", event => {
      tooltip.style("opacity", 0).style("top", 0).style("left", 0);
    });

    us.append("path").datum(state).attr("d", d3.geoPath()).attr("stroke", "white").attr("fill", "transparent").attr("stroke-width", 1.5);


    us.attr("transform", `translate(${svgSize.width / 2 - $('#us')[0].getBoundingClientRect().width / 2}, 60)`)

    const legendScale = d3.scalePoint().domain(domainOfEdu).range([0, 200])
    const legendAxis = d3.axisBottom(legendScale);
    legend.append("g").attr("transform", "translate(0, 25)").call(legendAxis);
    legend.selectAll("rect").data(domainOfEdu.filter((_, i) => i !== domainOfEdu.length - 1)).enter().append("rect")
    .attr("x", (_, i) => i * legendScale.step()).attr("y", 0)
    .attr("width", legendScale.step()).attr("height", 25)
    .attr("fill", d => colorScale(d));
    legend.attr("transform", "translate(800, 70)");

  }
})