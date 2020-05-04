const dims = {width : 300, height: 300, radius : 150};
const cent = {x : dims.width/2 + 5, y : dims.height/2 +5};
const svg = d3.select(".canvas")
              .append("svg")
              .attr("width", dims.width + 150)
              .attr("height", dims.height + 150)

const graph = svg.append("g").attr("transform", `translate(${cent.x}, ${cent.y})`);

const pie = d3.pie().sort(null).value(d => d.gdp);

const arcPath = d3.arc().outerRadius(dims.radius).innerRadius(dims.radius/2);

const colors = d3.scaleOrdinal(d3["schemeSet3"]);

//setup legend
const legendsGroup = svg.append("g").attr("transform", `translate(${dims.width + 50}, 10)`);
const legend = d3.legendColor().shape("circle").shapePadding(10).scale(colors);

//setup tooltip
const tooltip = d3
  .tip()
  .attr("class", "tooltip card")
  .html((d) => {
    let content = `
      <div class="name">${d.data.name}</div>
      <div class="cost">${d.data.gdp}</div>
      <div class="delete">Click to delete</div>
    `;
    return content;
  });
graph.call(tooltip);
const update = data => {

  //update colors legend 
  colors.domain(data.map(({name}) => name));
  //update legend color
  legendsGroup.call(legend);
  legendsGroup.selectAll("text").attr("fill", "#fff");
  //join data into paths
  const paths =  graph.selectAll("path").data(pie(data));

  //remove component has been deleted
  paths
    .exit()
    .transition().duration(700)
    .attrTween("d", arcTweenExit)
      .remove();
  paths
    .attr("d", arcPath)
    .transition().duration(700)
      .attrTween("d", arcTweenUpdate)
  
  //append enter path selection into the DOM
  paths
    .enter()    
    .append("path")
    .attr("class", "arc")
    .attr("d", arcPath)
    .attr("stroke", "#fff")
    .attr("stroke-width",2)    
    .each(function(d){this._current = d})
    .transition().duration(700)
      .attrTween("d", arcTweenEnter)
      .attr("fill", d => colors(d.data.name))

  graph
    .selectAll("path")
    .on("click", handleClick)
    .on("mouseover", (d,i,n) => {
      tooltip.show(d,n[i]);
      handleMouseOver(d,i,n);
    })
    .on("mouseout", (d,i,n)=>{
      tooltip.hide();
      handleMouseOut(d,i,n);
    })
}

let data= [];
db.collection("countries").onSnapshot(res => {
  res.docChanges().forEach(change => {
    let doc = {...change.doc.data(), id : change.doc.id } ;
    switch(change.type ){
      case "added" : 
        data.push(doc);
        break;
      case "removed" : 
        data = data.filter(dataItem => dataItem.id !== doc.id);
        break;
      case "modified" :
        let index = data.findIndex(dataItem => dataItem.id == doc.id);
        data[index] = doc ;
        break;
    }
  });
  console.log(data);
  update(data);
})


const arcTweenEnter = d => {
  const  i = d3.interpolate(d.endAngle, d.startAngle);
  return function(t){
    d.startAngle = i(t);
    return arcPath(d);
  }
};

const arcTweenExit = d => {
  const  i = d3.interpolate(d.startAngle, d.endAngle);
  return function(t){
    d.startAngle = i(t);
    return arcPath(d);
  }
}

function arcTweenUpdate(d){
  const i = d3.interpolate(this._current, d);
  //update the current prop with new updated data
  this._current = i(1) ; 
  return function(t){
    return arcPath(i(t));
  }
}

const  handleClick = (d,i,n) => {
  db.collection("countries").doc(d.data.id).delete();
}

const handleMouseOver = (d,i,n) => {
  d3.select(n[i]).transition("MouseHover").duration(200).attr("fill", "#fff")
}

const  handleMouseOut= (d,i,n) => {
  d3.select(n[i]).transition("MouseHover").duration(200).attr("fill", colors(d.data.name));
}

