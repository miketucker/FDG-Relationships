class GraphLink
	constructor: (@link, @graph) ->
		@dom = @graph.svg
			.data([@link])
			.insert("line",":first-child")
			.attr("class", "link")
			.style "stroke-width", (d) -> 2


		@element = d3.select(@dom)
		@graph.links.push @link
		return @

	update: =>
		@dom.attr("x1", (d) ->
			d.source.x
		).attr("y1", (d) ->
			d.source.y
		).attr("x2", (d) ->
			d.target.x
		).attr "y2", (d) ->
			d.target.y

	animateOut: =>
		@dom.transition()
			.duration(300)
			.style("stroke","#000")
			.each "end" , ()=> 
				@dom.remove()
				# @graph.graphLinks.splice @graph.graphLinks.indexOf(@node), 1
		@graph.links.splice @graph.links.indexOf(@link), 1