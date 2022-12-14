
const educationDataUri ="https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const usaCountyDataUri ="https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

const padding = 80,  width = 1000,  height = 550;

const  wrapper = d3.select("#map-holder");
const path = d3.geoPath();
const tooltip = wrapper.append("div")
                                        .attr("id", "tooltip")
                                        .attr("class", "tooltip");

function legend(svg, colorScale, dataRange) {
        const group = svg.append("g")
                                        .attr("id", "legend")
                                        .attr("transform", `translate(${(350)}, 0)`);

        const bottomScale = d3.scaleLinear()
                                                .domain(dataRange)
                                                .rangeRound([0, 300]);

        const bottomAxis = d3.axisBottom(bottomScale)
                                                .tickFormat(i => Math.floor(i) + "%")
                                                .tickValues(colorScale.domain())
                                                .tickSize(13);

        group.selectAll(".legend-item")
                .data(
                        colorScale.range().map(i => {
                                i = colorScale.invertExtent(i);
                                if (!i[0]) i[0] = bottomScale.domain()[0];
                                if (!i[1]) i[1] = bottomScale.domain()[1];
                                return i;
                        })
                )
                .enter()
                .append("rect")
                .attr("width", d => bottomScale(d[1]) - bottomScale(d[0]))
                .attr("height", 8)
                .attr("x", (d, i) => bottomScale(d[0]))
                .attr("fill", i => colorScale(i[0]))
                .attr("stroke", "blue")
                .attr("class", "legend-item");

        group.append("g")
                        .attr("id", "color-axis")
                        .attr("class", "color-tick")
                        .attr("transform", `translate(0, 0)`)
                        .call(bottomAxis);
        
        return svg;
}

d3.json(usaCountyDataUri).then(countyData => {
        d3.json(educationDataUri).then(educationData => {
          const svg = wrapper
            .append("svg")
            .attr("width", width + padding)
            .attr("height", height + padding)
            .style("margin", "0 auto")
            .style("display", "block")
            .attr("transform", `translate(70, 0)`)

      
          const dataRange = d3.extent(educationData, i => i.bachelorsOrHigher);
          const colorScale = d3
            .scaleThreshold()
            .domain(
              d3.range(dataRange[0], dataRange[1], (dataRange[1] - dataRange[0]) / 8)
            )
            .range(d3.schemeOranges[9]);
      
          legend(svg, colorScale, dataRange);
      
          svg
            .append("g")
            .selectAll("path")
            .data(topojson.feature(countyData, countyData.objects.counties).features)
            .join("path")
            .attr("d", path)
            .attr("class", "county")
            .attr("data-fips", d => d.id)
            .attr(
              "data-education",
              d => educationData.find(i => i.fips === d.id).bachelorsOrHigher
            )
            .attr("fill", d =>
              colorScale(educationData.find(i => i.fips === d.id).bachelorsOrHigher)
            )
           .on('mouseover', function (event, d) {
      tooltip.style('opacity', 0.9);
      tooltip
        .html(function () {
          var result = educationData.filter(function (obj) {
            return obj.fips === d.id;
          });
          if (result[0]) {
            return (
              result[0]['area_name'] +
              ', ' +
              result[0]['state'] +
              ': ' +
              result[0].bachelorsOrHigher +
              '%'
            );
          }
          return 0;
        })
        .attr('data-education', function () {
          var result = educationData.filter(function (obj) {
            return obj.fips === d.id;
          });
          if (result[0]) {
            return result[0].bachelorsOrHigher;
          }
          return 0;
        })
        .style('left', event.pageX + 10 + 'px')
        .style('top', event.pageY - 28 + 'px');
    })
    .on('mouseout', function () {
      tooltip.style('opacity', 0);
    });
      
          svg
            .append("path")
            .datum(
              topojson.mesh(countyData, countyData.objects.states, (a, b) => a !== b)
            )
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-linejoin", "round")
            .attr("d", path);
      
          svg
            .append("path")
            .datum(topojson.mesh(countyData, countyData.objects.nation))
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-linejoin", "round")
            .attr("d", path);
        });
      });
      