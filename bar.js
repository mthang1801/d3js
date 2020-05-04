const landScape = { width: 600, height: 600 };
const margin = { top: 20, right: 20, bottom: 80, left: 100 };
const graphWidth = 600 - margin.left - margin.right;
const graphHeight = 600 - margin.top - margin.bottom;
const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", landScape.width)
  .attr("height", landScape.height)
  .style("background-color", "#424242");
svg.selectAll("text").style("color", "#fff")
const graph = svg
  .append("g")
  .attr("width", graphWidth)
  .attr("height", graphHeight)
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//scales
const yScale = d3.scaleLinear().range([graphHeight,0]);
const xScale = d3
                .scaleBand()
                .range([0, graphWidth])
                .paddingInner(0.2)
                .paddingOuter(0.2);

//setup colors 
const colors = d3.scaleOrdinal(d3["schemeSet3"]);

//tooltip
const tip = d3
  .tip()
  .attr("class", "tip")
  .html((d) => {
    let content = `
    <div class="name">${d.name}</div>
    <div class="cost">${d.gdp}</div>
    <div class="delete">Click to delete</div>
  `;
    return content;
  });
graph.call(tip);
//Axes
const xAxisGroup = graph.append("g").attr("transform", `translate(0, ${graphHeight})`);
const yAxisGroup = graph.append("g");
const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);

xAxisGroup.selectAll("text")
  .attr("transform", "rotate(-40)")
  .attr("text-anchor", "end")
  .attr("fill", "#fff")
const update = data => {
  //update scale
  yScale.domain([0, d3.max(data, d => d.gdp)]);
  xScale.domain(data.map(({ name }) => name));
  colors.domain(data.map(({ name }) => name));
  
  //join data rect into the DOM
  const rects = graph.selectAll("rect").data(data);
  //exit 
  rects.exit()       
      .remove();
  rects
    .attr("width", xScale.bandwidth)
    .attr("height", (d) => graphHeight- yScale(d.gdp))
    .attr("x", (d, i) => xScale(d.name))
    .attr("y", d => yScale(d.gdp))
    .attr("fill", "#ffc107")
    .transition().duration(700)
      .attrTween("width", witdhTween)
  rects
    .enter()
    .append("rect")   
    .attr("x", (d, i) => xScale(d.name))
    .attr("y", d => graphHeight)
    .attr("fill", d => colors(d.name))
    .each(function(d){this._current = d })
    .transition().duration(700)
      .attrTween("width", witdhTween)
    .attr("y", d => yScale(d.gdp))
    .attr("height", (d) => graphHeight- yScale(d.gdp))
  
  //recall axes group
  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);

  graph.selectAll("rect")
      .on("mouseover", (d,i,n) => {
        tip.show(d,n[i]);
        handleMouseOver(d,i,n);
      })
      .on("mouseout", (d,i,n) => {
        tip.hide();
        handleMouseOut(d,i,n);
      })
      .on("click", (d,i,n) => {
        handleClick(d,i,n);
      })
}

let data = [];
db.collection("countries").onSnapshot((res) => {
  res.docChanges().forEach((change) => {
    let doc = { ...change.doc.data(), id: change.doc.id };
    switch (change.type) {
      case "added":
        data.push(doc);
        break;
      case "modified":
        let index = data.findIndex((dataItem) => dataItem.id === doc.id);
        data[index] = doc;
        break;
      case "removed":
        data = data.filter((dataItem) => dataItem.id !== doc.id);
        break;
    }
  });
  update(data);

});

const witdhTween = d => {
  const i = d3.interpolate(0, xScale.bandwidth());
  return function(t){
    return i(t);
  }
}
const  handleMouseOver = (d,i,n) => {
  d3.select(n[i]).transition().duration(200).attr("fill", "#ff6f00");
}
const  handleMouseOut = (d,i,n) => {
  d3.select(n[i]).transition().duration(200).attr("fill", colors(d.name));
}

const handleClick = (d,i,n) => {
  db.collection("countries").doc(d.id).delete();
}