###
	EDITOR: USED FOR CREATING THE MAP
###

class Editor
	selected: null
	currentMode: "add"
	colors: ["#fff","#fe3a10","#70ebcf","#3d2ad1","#ff456b","#546c6e"]
	constructor: (@dataUrl) ->
		@dom = 			$('#editor')
		@svgContainer = $('#svgContainer')
		# @save = 		$('#save')
		@saveToFile = 	$('#saveToFile')
		@load = 		$("#load")
		@btnAdd = 		$('#add')
		@btnToggles = 	$(".button.toggle")

		groupLink = $('<a href="#" class="button group"></a>')

		for i in [1..@colors.length-1]
			nl = groupLink.clone()
			nl.html(i)
			nl.css "background-color", @colors[i]
			j = i
			nl.click (e) => 
				console.log $(e.target).html()
				@currentGroup = parseFloat($(e.target).html())
				@selectButton($("#group"))
			$("body").append(nl)


		# @svg = $('<svg x="0" y="0" width="1024" height="786" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg>')
		@svg = d3.select("#svgContainer")
			.append("svg:svg")
			.attr("width", $(window).width())
			.attr("height", $(window).height())
		
		# @svg = $('<svg id="svg" x="0" y="0" width="500" height="500" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g fill="none" stroke="none" stroke-width="none" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="sans-serif" font-size="12" text-anchor="start" mix-blend-mode="normal"><line x1="5" y1="5" x2="45" y2="45" stroke="rgb(0,0,255)" stroke-width="10"></line><line x1="20" y1="20" x2="99" y2="77" stroke="rgb(255,0,0)" stroke-width="2"></line><line x1="50" y1="55" x2="200" y2="300" stroke="rgb(255,255,0)" stroke-width="5"></line></g></svg>')
		@dom.click @clickEvent
		# @save.click @saveEvent
		@saveToFile.click @saveToFileEvent

		@load.click (e) => 
			@loadData()
			e.preventDefault()
		@btnToggles.click (e) => 
			@selectButton($(e.currentTarget))
			e.preventDefault()
		@selectButton(@btnAdd)

		# $("body").append(@svg)

		@nodes = []
		@links = []


		if @doLocal
			@loadData localStorage.getItem("data")
		else 
			$.get(@dataUrl,(e)=> @loadData e )
		return

	selectButton: (button)->
		@btnToggles.removeClass("selected")
		button.addClass("selected")
		@currentMode = button.attr('id')
		@selected = null
		return

	loadData: (data) =>
		data = JSON.parse(data)
		for n in data.nodes
			node = new Node(@nodes.length)
			node.editor = @
			node.setData(n)
			node.data.realId = @nodes.length
			@addNode node

		for l in data.links
			n1 = @nodeById(l.source)
			n2 = @nodeById(l.target)
			if n1 and n2
				link = new Link(n1,n2)
				@addLink link
			else 
				console.log "not found: ", n1 , n2 , l.source, l.target

		saveCount = 0
		for n in @nodes
			r = n.data.realId
			if n.data.id != r
				console.log "fixed ", n.data.id, r
				n.data.id = r
				for l in @links
					if l.a == n
						l.data.source = r
					else if l.b == n
						l.data.target = r
				saveCount++

		if saveCount > 0
			@saveToFileEvent()


		@selected = null

		@selectButton($("#"+data.tool))
		return

	nodeById: (id) ->
		id = parseFloat(id)
		for n in @nodes
			return n if n.data.id == id
		return null

	getData: =>
		dataNodes = []
		for n in @nodes
			n.update()

			dataNodes.push n.data

		dataLinks = []
		for l in @links
			l.update()
			dataLinks.push l.data

		data = {
			"nodes": dataNodes,
			"links": dataLinks,
			"tool": @currentMode

		};
		JSON.stringify(data)

	saveToFileEvent: =>
		strData = @getData()
		$.post("save.php", {"data": strData}, (e) ->
			console.log e
		)

	saveEvent: (e) =>
		strData = @getData()
		console.log strData
		localStorage.setItem("data", strData)
		e.preventDefault()

	clickEvent: (e) =>
		console.log e
		if e.target == @dom[0] # clicks background
			@handleClick(e)
		else if $(e.target).is("input")
			@handleSelection(e.target)
		return

	handleClick:(e) ->
		if @selected
			@selected = null
			return

		switch @currentMode
			when "add"
				n = new Node(@nodes.length)
				n.editor = @
				n.setPosition e.clientX , n.data.y = e.clientY
				n.group(@currentGroup)
				@addNode n

				return

	handleSelection: (t) ->
		switch @currentMode
			when "link"
				if @selected 
					n = @findNodeByInput(t)
					if n != null and n != @selected and !@findLink(@selected,n)
						@addLink new Link( @selected, n )
						return
			when "unlink"
				if @selected
					n = @findNodeByInput(t)
					console.log "unlink", @selected, n
					link = @findLink(@selected,n)
					if n != null and n != @selected and link
						link.dom.remove()
						@links.splice(@links.indexOf(link),1)
						return
			when "clear"
				n = @findNodeByInput(t)
				if n != null 
					n.dom.remove()
					console.log n
					@nodes.splice(@nodes.indexOf(n),1)
					return

			when "group"
				@selected = @nodeById $(t).parent().attr("data-id")
				@selected.group(@currentGroup)


		@selected = @nodeById $(t).parent().attr("data-id")
		@selectedChooseGroup


	findNodeByInput: (t) ->
		for n in @nodes
			if n.input[0] == t
				return n
		return null

	findLink: (a,b)->
		for l in @links
			if (l.a == a && l.b == b) ||  (l.b == a && l.a == b)
				return l
		return false

	addNode: (node) ->
		node.editor = @
		@nodes.push node
		@selected = node
		@dom.append(node.render())

	addLink: (link) ->
		@links.push link
		link.render(@svg)
		# @svg.append($(link.render()))
		# @svgContainer.html(@svg.html())
		return

class Node
	data: null
	constructor: (id) ->
		@data = {
			name:""
			x:0
			y:0
			id:-1
			group: 1
		}
		@data.id = id
		@dom = $('<div class="textNode" data-id="'+id+'"><input></input></div>')
		@dom.bind 'drag', @drag

		@input = $(@dom).find('input')

	group: (i) ->
		@data.group = i
		@dom.css("background-color",@editor.colors[i])

	drag: (e) =>

		@data.x = e.offsetX
		@data.y = e.offsetY

		@dom.css
			top: @data.y
			left: @data.x

		e.preventDefault()

		for link in @editor.links
			link.update()

		return
	
	setData: (data) ->
		@data = data
		@setPosition(@data.x,@data.y)
		@setInput(@data.name)
		@group(@data.group)

	setInput: (str) ->
		@input.val(str)

	setPosition: (x,y) ->
		@data.x = x
		@data.y = y
		@dom.css "top", 	y
		@dom.css "left", 	x


	render: ->
		@dom

	update: ->
		@data.group = 1 unless @data.group
		@data.name = $(@dom).find("input").val()

class Link
	data: null
	a: null
	b: null
	constructor: (@a,@b) ->
		@data = {
			source: @a.data.id
			target: @b.data.id
			value: @dist()
		}

	dist: () ->
		x = (@b.data.x - @a.data.x)
		y = (@b.data.y - @a.data.y)
		Math.sqrt( x * x + y * y )

	render: (svg) ->
		@dom = svg.append("svg:line")
			.attr("x1", @a.data.x)
			.attr("y1", @a.data.y)
			.attr("x2", @b.data.x)
			.attr("y2", @b.data.y)
			.style("stroke", "#666");
		
	update: =>
		@dom
			.attr("x1", @a.data.x)
			.attr("y1", @a.data.y)
			.attr("x2", @b.data.x)
			.attr("y2", @b.data.y)

		@data.value = @dist()
		return

window.Editor = Editor;