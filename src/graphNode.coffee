class GraphNode
	pullAmount: 0.0
	@padding: 70

	constructor: (@node, @graph) ->
		@node = $.extend({}, @node)
		@node.graphNode = @
		@dom = dom = @graph.svg.append("g")
			.data([@node])
			.attr("class", "node")
			.call(@graph.force.drag)
			.on "click",(e) => controller.highlight(@dom)

		ww = window.innerWidth
		@node.x = ww * 0.5 + (Math.random() * ww * 0.3) - (ww * 0.15)
		wh = window.innerHeight
		@node.y = wh * 0.5 + (Math.random() * wh * 0.2) - (wh * 0.1)

		@dom.append("text")
			# .attr("x",-50)
			.attr("dy",".35em")
			.attr("text-anchor","middle")
			.text((d)-> d.name)
			.style("fill", (d) => @graph.colorRange[d.group] )
			.style("font-size","3px")
			.transition()
			.style("font-size",@graph.fontSize)
			.duration(300)

		@element = d3.select(@dom)
		@graph.nodes.push @node
		return @

	id: =>
		@node.id

	update: =>
		# @clampToScreen()
		@dom.attr "transform", (d) -> "translate(" + d.x + "," + d.y + ")"

	fadeInPull: =>
		pullInterval = setInterval ()=> 
			@pullAmount += 0.0001
			if @pullAmount > 0.02
				clearInterval pullInterval
		, 1000.0 / 60

	resetPull: =>
		@pullAmount = 0.0

	moveTo: (x,y) =>
		@node.x = x
		@node.y = y
		@update()
		
	centerPull: =>
		centerX = sw2
		centerY = sh2
		@node.x += (centerX - @node.x) * @pullAmount
		@node.y += (centerY - @node.y) * @pullAmount		

		return [@node.x , @node.y]

	dist: (x1,x2,y1,y2) ->
		return Math.sqrt((x1 * x2) + (y1 * y2))
		
	outerPull: (o) =>
		if @dist(@node.x,o[0], @node.y, o[1]) < GraphNode.padding
			@node.x += (40 - (@node.x - o.node.x)) * .01
			@node.y += (40 - (@node.y - o.node.y)) * .01
		return

	clampToScreen: =>
		@node.x = Math.max(GraphNode.padding, Math.min(window.innerWidth - GraphNode.padding, @node.x))
		@node.y = Math.max(GraphNode.padding, Math.min(window.innerHeight - GraphNode.padding, @node.y))	
		return


	animateOut: =>
		@dom.select("text").transition()
			.duration(300)
			.style("font-size","3px")
			.each "end" , ()=> 
				@dom.remove()
				# @graph.graphNodes.splice @graph.graphNodes.indexOf(@node), 1
		@graph.nodes.splice @graph.nodes.indexOf(@node), 1
			