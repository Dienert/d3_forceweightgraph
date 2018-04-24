/**
 * Author: Diénert Vieira
 * Em@il: dienert.vieira@dataprev.gov.br
 * Company: Dataprev
 * Creation Year: 2018
 */

(function() {

var paramOperator = Qva.Remote.indexOf('?') >= 0 ? '&' : '?';
var EXTENSION_PATH = Qva.Remote + paramOperator + "public=only&name=Extensions/d3_forceweightgraph/";

Qva.LoadCSS(EXTENSION_PATH + "css/graph.css");

Qva.LoadScript(EXTENSION_PATH + "js/d3js/vendor/jquery-1.11.2.min.js", function() {
	Qva.LoadScript(EXTENSION_PATH + "js/d3js/d3.v4.min.js", function() {
			WEIGHT_GRAPH();
		});
});


function WEIGHT_GRAPH() {
	
	_this = this;

	function generateGraph(dataArray) {
		var links = [];
		var ids = new Set();
		var azulMarinho = 'rgb(56, 108, 176)',
			cyan= 'rgb(23, 190, 207)';
		var nodesObj = {};
		graph = {};
		for(let a=0;a<dataArray.length;a++) {
			var row = dataArray[a];
			var link = {};
			var source = row[0].text
				target = row[1].text,
				value = parseInt(row[2].text);
			link['source'] = source;
			link['target'] = target;
			link['value'] = parseInt(row[2].text);
			links.push(link);
			var nodeSource = {}
			nodeSource['id'] = source;
			nodeSource['color'] = cyan;
			if (nodesObj[nodeSource.id] != null) {
				nodeSource['value'] = nodesObj[nodeSource.id]['value'] + value;
			} else {
				nodeSource['value'] = value;
			}
			nodesObj[nodeSource.id] = nodeSource;
			var nodeTarget = {}
			nodeTarget['id'] = target;
			nodeTarget['color'] = azulMarinho;
			if (nodesObj[nodeTarget.id] != null) {
				nodeTarget['value'] = nodesObj[nodeTarget.id]['value'] + value;
			} else {
				nodeTarget['value'] = value;
			}
			nodesObj[nodeTarget.id] = nodeTarget;
		}
		// let nodes = [];
		var nodes = $.map(nodesObj, function(value, index) {
			return [value];
		});
		// nodesObj.forEach(function(node){
		// 	nodes.push(node);
		// });
		graph['nodes'] = nodes;
		graph['links'] = links;
		return graph;
	}
	
	Qv.AddExtension(
		"d3_forceweightgraph",
		function() {
			try {
				var canvasID = 'div'+this.Name.slice('Document.'.length, this.Name.length);
				
				var alreadyHasComp = $("#"+canvasID).length;
				
				if(!alreadyHasComp) {
					var canvas = document.createElement("div");
					canvas.setAttribute("id",canvasID);
					canvas.setAttribute("class","grafico");
					this.Element.appendChild(canvas);
				} else {
					$("#"+canvasID).remove();
					var canvas = document.createElement("div");
					canvas.setAttribute("id",canvasID);
					this.Element.appendChild(canvas);
				}

				var width = this.GetWidth(),
					height = this.GetHeight();

				$("#"+canvasID).css({
					"width": width+"px",
					"height": height+"px"
				});
				
				console.log('Quantidade de linhas de dados:'+this.Data.Rows.length);

				var graph = generateGraph(this.Data.Rows);
				//console.log(JSON.stringify(graph));
				
				var zoomListener = d3.zoom().on("zoom", zoom);

				function zoom() {
					if(d3.event.transform != null) {
					t = d3.event.transform
					console.log("atualizando transformação: "+t)
					svg.attr("transform", t);
					}
				}


				var svg = d3.select("#"+canvasID)
					.append("svg")
					.attr("width", width)
					.attr("height", height)
					.call(zoomListener)
						.append("g")
						.attr("id", "svgGroup")
						.attr("width", width)
						.attr("height", height);

				var color = d3.scaleOrdinal(d3.schemeCategory20);

				var simulation = d3.forceSimulation()
					.force("link", d3.forceLink().id(function(d) { return d.id; }))
					.force("charge", d3.forceManyBody().strength(-2000))
					//.force("collide", d3.forceCollide().radius(50))
					.force("center", d3.forceCenter(width / 2, height / 2));

				//d3.json(EXTENSION_PATH + "data/miserables.json", function(error, graph) {
				//if (error) throw error;

				var link = svg.append("g")
					.attr("class", "links")
					.selectAll("line")
					.data(graph.links)
					.enter().append("line")
					.attr("stroke-width", function(d) { return Math.sqrt(d.value); });

				// var node = svg.append("g")
				// 	.attr("class", "nodes")
				// 	.selectAll("circle")
				// 	.data(graph.nodes)
				// 	.enter().append("circle")
				// 	.attr("r", 20)
				// 	.attr("visibility", "hidden")
				// 	//.attr("fill", function(d) { return color(d.group); })
				// 	.attr("fill", function(d) { return d.color; })
				// 	.call(d3.drag()
				// 		.on("start", dragstarted)
				// 		.on("drag", dragged)
				// 		.on("end", dragended));

				// node.append("title")
				// 	.text(function(d) { return d.id; });

				var nodeText = svg.append("g")
					.attr("class", "text")
					.selectAll("g")
					.data(graph.nodes)
					.enter().append("g");

				var rect = nodeText.append("rect")
					.attr("rx", 4)
					.attr("ry", 4)
					//.attr("fill", "black")
					.attr("fill", function(d) { return d.color; })
					//.attr("opacity", 0.5)
					//.attr("visibility", "hidden")
					.attr("height", 20)
					.call(d3.drag()
						.on("start", dragstarted)
						.on("drag", dragged)
						.on("end", dragended));

				var text = nodeText.append("text")
					.text(function(d) { return d.id + ' (' + d.value + ')'; })
					.attr("fill", "white")
					.call(d3.drag()
						.on("start", dragstarted)
						.on("drag", dragged)
						.on("end", dragended));;
					//.attr("visibility", "hidden");

				rect.attr("width", function(d) {return this.parentNode.getBBox().width+10;})


				simulation
					.nodes(graph.nodes)
					.on("tick", ticked);

				simulation.force("link")
					.links(graph.links);

				var deslocX = 0
					deslocY = 0;

				function ticked() {
					link
						.attr("x1", function(d) { return d.source.x; })
						.attr("y1", function(d) { return d.source.y; })
						.attr("x2", function(d) { return d.target.x; })
						.attr("y2", function(d) { return d.target.y; });

					// node
					// 	.attr("cx", function(d) { return d.x; })
					// 	.attr("cy", function(d) { return d.y; });

					rect
						.attr("x", function(d) { return d.x-this.parentNode.getBBox().width/2; })
						.attr("y", function(d) { return d.y-this.parentNode.getBBox().height/2; });

					text
						.attr("x", function(d) { return d.x-this.parentNode.getBBox().width/2+5; })
						.attr("y", function(d) { return d.y-this.parentNode.getBBox().height/2+15; });
				}
				//});

				function dragstarted(d) {
				if (!d3.event.active) simulation.alphaTarget(0.3).restart();
				d.fx = d.x;
				d.fy = d.y;
				}

				function dragged(d) {
				d.fx = d3.event.x;
				d.fy = d3.event.y;
				}

				function dragended(d) {
				if (!d3.event.active) simulation.alphaTarget(0);
				d.fx = null;
				d.fy = null;
				}

				if(!alreadyHasComp) {
					//DTPTree.drawTree("#"+canvasID, EXTENSION_PATH, treeData[0]);
					//chart2(canvasID, this.GetWidth(), this.GetHeight());
				} else {
					//DTPTree.resizeSVG("#"+canvasID, this.GetWidth(), thisGetHeight());
					//console.log("elzi");
					//resizeSVG(canvasID, this.GetWidth(), this.GetHeight());
				}


			} catch(e) {
				console.error(e.stack);
			}
		},
		false
	);
}
})();