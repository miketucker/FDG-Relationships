###
	GRAPH: VIEWER 
###

stageWidth = 0
stageHeight = 0
sw2 = 0
sh2 = 0
controller = null
class Graph
	selectedNode: null
	origColor: null
	fontSize: "16px"
	graphNodes: null
	graphLinks: null
	selectedGraphNode: null
	selectedNode: null
	colorRange: ["#fff","#e56c9c","#2efd41","#5a00ff","#00c3c8","#bababa"]

	groupsAdded: {}

	constructor: (file,options,@callback) ->
		if options
			@colorRange = options.colorRange || @colorRange

		# document.ontouchstart = (e)->
		    # e.preventDefault()

		@graphNodes = []
		@graphLinks = []
		stageWidth = @width = $(window).width()
		stageHeight = @height = $(window).height()
		sw2 = stageWidth/2
		sh2 = stageHeight/2
		# @colorRange = ["#fff","#e0d08d","#ff3100","#c8fbff","#ff8d72","#00717a"];
		@force = d3.layout.force().friction(0.92).gravity(0.05).charge(-200).linkDistance(150).size([@width, @height])

		@centerPull = d3.layout.force()
		@centerPull.on "tick", =>
			if @selectedGraphNode
				p = @selectedGraphNode.centerPull() 
				# for n in @graphNodes
				# 	n.outerPull(p) if p && n && n != @selectedGraphNode

	
		@svg = d3.select("body").append("svg").attr("width", @width).attr("height", @height)

		$("#nav li").each (i,v) =>
			$(v).css("background-color", @colorRange[i+1])
			n = i+1
			$(v).click (e) =>
				@removeAll()
				@addGroup(n)


		@force.on "tick", =>
			link.update() for link in @graphLinks
			node.update() for node in @graphNodes

		controller = @

		$(window).keypress @key

		$.getJSON file, @loaded




	loaded: (data) =>
		@nodes = @force.nodes()
		@links = @force.links()
		@data = data
		@callback() if @callback


		# $("#nav").show()

	key: (e) =>
		# console.log e.keyCode, 'keycode', e
		# e.preventDefault()
		switch e.charCode
			when 49 #1
				# @removeAll()
				@addGroup(0)
			when 50 #2
				# @removeAll()
				@addGroup(1)
			when 51 #3
				# @removeAll()
				@addGroup(2)
			when 52 #4
				# @removeAll()
				@addGroup(3)
			when 53 #5
				# @removeAll()
				@addGroup(4)
			when 54 #5
				# @removeAll()
				@addGroup(5)
			when 55 #6
				break
			when 56 #7
				break
			when 57 #8
				@removeAllLinks()
				# console.log 'boo'
				break
			when 48 # 0 
				# @removeAll()
				# @addAll()
				return
		# console.log e.keyCode, 'keycode'

	# use the group to dictate the central pieces, and use clicks to open up pieces

	removeAll: =>
		for n in @graphNodes
			n.animateOut()
		@graphNodes = []

		# for n in @nodes
		# 	n.remove()

		@removeAllLinks()

		# for l in @links
		# 	l.remove()

	removeAllLinks: ->
		if @selectedNode
			@unhighlight(@selectedNode) 
		for l in @graphLinks
			l.animateOut()
		@graphLinks = []

	addAllNodes: =>
		for n in @data.nodes
			found = false
			for gn in @graphNodes
				if gn.node.name == n.name
					found = true
					break
			@addNode(n) unless found

	removeGroup: (num) =>
		newNodes = []
		for gn in @graphNodes
			if gn.node.group == num
				@removeNode(gn)
			else
				newNodes.push gn
		@graphNodes = newNodes
		return

	removeNode: (node) =>
		@removeNodeLinks(node)
		node.animateOut()


	removeNodeLinks: (node) =>
		newLinks = []
		for l in @graphLinks
			# console.log 'remove node links', node, l.link
			unless l.link.source.graphNode == node || l.link.target.graphNode == node
				newLinks.push l
			else
				l.animateOut()

		@graphLinks = newLinks
		return

	getGroup: (num) =>
		ar = []
		for n in @data.nodes
			ar.push n if n.group == num
		return ar


	addGroup: (num) =>
		if @groupsAdded[num] && @groupsAdded[num] == true
			@removeGroup(num)
			@groupsAdded[num] = false
		else
			@groupsAdded[num] = true
			for n in @data.nodes
				if n.group == num
					found = false
					for gn in @graphNodes
						if gn.node.name == n.name
							found = true
							break
					@addNode(n) unless found

			@force.start()
		return

	getGroup: (num) =>
		group = []
		for n in @data.nodes
			if n.group == num
				found = false
				for gn in @graphNodes
					if gn.node.name == n.name
						found = true
						break
				group.push n unless found

		return group

	addNode: (data) =>
		for gn in @graphNodes
			if gn.node.name == data.name
				found = true
				return gn.node
		n = new GraphNode( data , @ )
		@graphNodes.push( n )
		n

	addNeighbors: (graphNode, connect = true) =>
		i = graphNode.id()

		r = 0

		newSources = []
		newTargets = []

		for l in @data.links
			if l.source == i
				newSources.push l
			else if l.target == i
				newTargets.push l


		totalCount = newSources.length + newTargets.length
		radius = 50 + totalCount * 5

		for l in newSources
			connection = @nodeById(l.target)
			unless connection
				@addNeighborNode(graphNode, l.target, r, radius)
				r += 1
			@addLink(l) if connect

		for l in newTargets
			connection = @nodeById(l.source)
			unless connection
				@addNeighborNode(graphNode, l.source , r, radius)
				r += 1
			@addLink(l) if connect


		# @force.start()
		@force.start()
		return null

	addNeighborNode: (graphNode, id, r = 0, radius = 50) ->
		dataNode = @data.nodes[id]
		dataNode.x = graphNode.node.x + Math.cos(r) * radius
		dataNode.y = graphNode.node.y + Math.sin(r) * radius
		connection = new GraphNode( dataNode, @)
		@graphNodes.push connection
		return connection

	addLink: (link) =>
		link = $.extend({}, link)
		source = @nodeById(link.source)
		target = @nodeById(link.target)
		return unless source and target
		link.source = @graphNodes.indexOf source
		link.target = @graphNodes.indexOf target
		unless @linkByConnections(link.source, link.target)
			@graphLinks.push new GraphLink(link, @)
		return null

	linkByConnections: (source, target) =>
		for l in @graphLinks
			return l if l.link.source == source and l.link.target == target
			return l if l.link.source == target and l.link.source == source
		return null


	nodeById: (id) =>
		for n in @graphNodes
			return n if n.id() == id
		return null

	addAll: =>
		for i in [0..@data.nodes.length-1]
			unless @nodeById(@data.nodes[i])
				n = @data.nodes[i] 
				@addNode(n)

		for i in [0..@data.links.length-1]
			n = @data.links[i]
			unless @linkByConnections(n.source,n.target)
				@graphLinks.push( new GraphLink( n , @ ) )

		@force.start()




	highlightByName: (str) =>
		# @addAllNodes()

		for n in @graphNodes
			if n.node.name == str
				@highlight(n.dom)
				return

		for d in @data.nodes
			if d.name == str
				n = @addNode(d)
				@highlight(n.dom) 
				@force.start()
				return
		
		return

	highlight: (node, connect = true) =>
		if @selectedNode
			@unhighlight(@selectedNode) 
	
		node.select("text").transition()
			.duration(300)
			.style("font-size","36px")
		@selectedNode = node
		@selectedGraphNode = node.data()[0].graphNode
		@force.charge(-300)
		@centerPull.start()
		@selectedGraphNode.fadeInPull()
		# setTimeout () =>
		@addNeighbors(node.data()[0].graphNode, connect)
		# , 500
		return


	unhighlight: (node) =>
		@selectedGraphNode.resetPull()
		@selectedGraphNode = null
		@selectedNode = null
		node.select("text").transition()
			.duration(750)
			.style("font-size",@fontSize)

window.Graph = Graph;