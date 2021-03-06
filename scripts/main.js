// Generated by CoffeeScript 1.8.0

/*
	EDITOR: USED FOR CREATING THE MAP
 */

(function() {
  var Editor, Graph, GraphLink, GraphNode, Link, Node, controller, sh2, stageHeight, stageWidth, sw2,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Editor = (function() {
    Editor.prototype.selected = null;

    Editor.prototype.currentMode = "add";

    Editor.prototype.colors = ["#fff", "#fe3a10", "#70ebcf", "#3d2ad1", "#ff456b", "#546c6e"];

    function Editor(dataUrl) {
      var groupLink, i, j, nl, _i, _ref;
      this.dataUrl = dataUrl;
      this.clickEvent = __bind(this.clickEvent, this);
      this.saveEvent = __bind(this.saveEvent, this);
      this.saveToFileEvent = __bind(this.saveToFileEvent, this);
      this.getData = __bind(this.getData, this);
      this.loadData = __bind(this.loadData, this);
      this.dom = $('#editor');
      this.svgContainer = $('#svgContainer');
      this.saveToFile = $('#saveToFile');
      this.load = $("#load");
      this.btnAdd = $('#add');
      this.btnToggles = $(".button.toggle");
      groupLink = $('<a href="#" class="button group"></a>');
      for (i = _i = 1, _ref = this.colors.length - 1; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
        nl = groupLink.clone();
        nl.html(i);
        nl.css("background-color", this.colors[i]);
        j = i;
        nl.click((function(_this) {
          return function(e) {
            console.log($(e.target).html());
            _this.currentGroup = parseFloat($(e.target).html());
            return _this.selectButton($("#group"));
          };
        })(this));
        $("body").append(nl);
      }
      this.svg = d3.select("#svgContainer").append("svg:svg").attr("width", $(window).width()).attr("height", $(window).height());
      this.dom.click(this.clickEvent);
      this.saveToFile.click(this.saveToFileEvent);
      this.load.click((function(_this) {
        return function(e) {
          _this.loadData();
          return e.preventDefault();
        };
      })(this));
      this.btnToggles.click((function(_this) {
        return function(e) {
          _this.selectButton($(e.currentTarget));
          return e.preventDefault();
        };
      })(this));
      this.selectButton(this.btnAdd);
      this.nodes = [];
      this.links = [];
      if (this.doLocal) {
        this.loadData(localStorage.getItem("data"));
      } else {
        $.get(this.dataUrl, (function(_this) {
          return function(e) {
            return _this.loadData(e);
          };
        })(this));
      }
      return;
    }

    Editor.prototype.selectButton = function(button) {
      this.btnToggles.removeClass("selected");
      button.addClass("selected");
      this.currentMode = button.attr('id');
      this.selected = null;
    };

    Editor.prototype.loadData = function(data) {
      var l, link, n, n1, n2, node, r, saveCount, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
      data = JSON.parse(data);
      _ref = data.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        node = new Node(this.nodes.length);
        node.editor = this;
        node.setData(n);
        node.data.realId = this.nodes.length;
        this.addNode(node);
      }
      _ref1 = data.links;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        l = _ref1[_j];
        n1 = this.nodeById(l.source);
        n2 = this.nodeById(l.target);
        if (n1 && n2) {
          link = new Link(n1, n2);
          this.addLink(link);
        } else {
          console.log("not found: ", n1, n2, l.source, l.target);
        }
      }
      saveCount = 0;
      _ref2 = this.nodes;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        n = _ref2[_k];
        r = n.data.realId;
        if (n.data.id !== r) {
          console.log("fixed ", n.data.id, r);
          n.data.id = r;
          _ref3 = this.links;
          for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
            l = _ref3[_l];
            if (l.a === n) {
              l.data.source = r;
            } else if (l.b === n) {
              l.data.target = r;
            }
          }
          saveCount++;
        }
      }
      if (saveCount > 0) {
        this.saveToFileEvent();
      }
      this.selected = null;
      this.selectButton($("#" + data.tool));
    };

    Editor.prototype.nodeById = function(id) {
      var n, _i, _len, _ref;
      id = parseFloat(id);
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        if (n.data.id === id) {
          return n;
        }
      }
      return null;
    };

    Editor.prototype.getData = function() {
      var data, dataLinks, dataNodes, l, n, _i, _j, _len, _len1, _ref, _ref1;
      dataNodes = [];
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        n.update();
        dataNodes.push(n.data);
      }
      dataLinks = [];
      _ref1 = this.links;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        l = _ref1[_j];
        l.update();
        dataLinks.push(l.data);
      }
      data = {
        "nodes": dataNodes,
        "links": dataLinks,
        "tool": this.currentMode
      };
      return JSON.stringify(data);
    };

    Editor.prototype.saveToFileEvent = function() {
      var strData;
      strData = this.getData();
      return $.post("save.php", {
        "data": strData
      }, function(e) {
        return console.log(e);
      });
    };

    Editor.prototype.saveEvent = function(e) {
      var strData;
      strData = this.getData();
      console.log(strData);
      localStorage.setItem("data", strData);
      return e.preventDefault();
    };

    Editor.prototype.clickEvent = function(e) {
      console.log(e);
      if (e.target === this.dom[0]) {
        this.handleClick(e);
      } else if ($(e.target).is("input")) {
        this.handleSelection(e.target);
      }
    };

    Editor.prototype.handleClick = function(e) {
      var n;
      if (this.selected) {
        this.selected = null;
        return;
      }
      switch (this.currentMode) {
        case "add":
          n = new Node(this.nodes.length);
          n.editor = this;
          n.setPosition(e.clientX, n.data.y = e.clientY);
          n.group(this.currentGroup);
          this.addNode(n);
      }
    };

    Editor.prototype.handleSelection = function(t) {
      var link, n;
      switch (this.currentMode) {
        case "link":
          if (this.selected) {
            n = this.findNodeByInput(t);
            if (n !== null && n !== this.selected && !this.findLink(this.selected, n)) {
              this.addLink(new Link(this.selected, n));
              return;
            }
          }
          break;
        case "unlink":
          if (this.selected) {
            n = this.findNodeByInput(t);
            console.log("unlink", this.selected, n);
            link = this.findLink(this.selected, n);
            if (n !== null && n !== this.selected && link) {
              link.dom.remove();
              this.links.splice(this.links.indexOf(link), 1);
              return;
            }
          }
          break;
        case "clear":
          n = this.findNodeByInput(t);
          if (n !== null) {
            n.dom.remove();
            console.log(n);
            this.nodes.splice(this.nodes.indexOf(n), 1);
            return;
          }
          break;
        case "group":
          this.selected = this.nodeById($(t).parent().attr("data-id"));
          this.selected.group(this.currentGroup);
      }
      this.selected = this.nodeById($(t).parent().attr("data-id"));
      return this.selectedChooseGroup;
    };

    Editor.prototype.findNodeByInput = function(t) {
      var n, _i, _len, _ref;
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        if (n.input[0] === t) {
          return n;
        }
      }
      return null;
    };

    Editor.prototype.findLink = function(a, b) {
      var l, _i, _len, _ref;
      _ref = this.links;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        l = _ref[_i];
        if ((l.a === a && l.b === b) || (l.b === a && l.a === b)) {
          return l;
        }
      }
      return false;
    };

    Editor.prototype.addNode = function(node) {
      node.editor = this;
      this.nodes.push(node);
      this.selected = node;
      return this.dom.append(node.render());
    };

    Editor.prototype.addLink = function(link) {
      this.links.push(link);
      link.render(this.svg);
    };

    return Editor;

  })();

  Node = (function() {
    Node.prototype.data = null;

    function Node(id) {
      this.drag = __bind(this.drag, this);
      this.data = {
        name: "",
        x: 0,
        y: 0,
        id: -1,
        group: 1
      };
      this.data.id = id;
      this.dom = $('<div class="textNode" data-id="' + id + '"><input></input></div>');
      this.dom.bind('drag', this.drag);
      this.input = $(this.dom).find('input');
    }

    Node.prototype.group = function(i) {
      this.data.group = i;
      return this.dom.css("background-color", this.editor.colors[i]);
    };

    Node.prototype.drag = function(e) {
      var link, _i, _len, _ref;
      this.data.x = e.offsetX;
      this.data.y = e.offsetY;
      this.dom.css({
        top: this.data.y,
        left: this.data.x
      });
      e.preventDefault();
      _ref = this.editor.links;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        link = _ref[_i];
        link.update();
      }
    };

    Node.prototype.setData = function(data) {
      this.data = data;
      this.setPosition(this.data.x, this.data.y);
      this.setInput(this.data.name);
      return this.group(this.data.group);
    };

    Node.prototype.setInput = function(str) {
      return this.input.val(str);
    };

    Node.prototype.setPosition = function(x, y) {
      this.data.x = x;
      this.data.y = y;
      this.dom.css("top", y);
      return this.dom.css("left", x);
    };

    Node.prototype.render = function() {
      return this.dom;
    };

    Node.prototype.update = function() {
      if (!this.data.group) {
        this.data.group = 1;
      }
      return this.data.name = $(this.dom).find("input").val();
    };

    return Node;

  })();

  Link = (function() {
    Link.prototype.data = null;

    Link.prototype.a = null;

    Link.prototype.b = null;

    function Link(a, b) {
      this.a = a;
      this.b = b;
      this.update = __bind(this.update, this);
      this.data = {
        source: this.a.data.id,
        target: this.b.data.id,
        value: this.dist()
      };
    }

    Link.prototype.dist = function() {
      var x, y;
      x = this.b.data.x - this.a.data.x;
      y = this.b.data.y - this.a.data.y;
      return Math.sqrt(x * x + y * y);
    };

    Link.prototype.render = function(svg) {
      return this.dom = svg.append("svg:line").attr("x1", this.a.data.x).attr("y1", this.a.data.y).attr("x2", this.b.data.x).attr("y2", this.b.data.y).style("stroke", "#666");
    };

    Link.prototype.update = function() {
      this.dom.attr("x1", this.a.data.x).attr("y1", this.a.data.y).attr("x2", this.b.data.x).attr("y2", this.b.data.y);
      this.data.value = this.dist();
    };

    return Link;

  })();

  window.Editor = Editor;


  /*
  	GRAPH: VIEWER
   */

  stageWidth = 0;

  stageHeight = 0;

  sw2 = 0;

  sh2 = 0;

  controller = null;

  Graph = (function() {
    Graph.prototype.selectedNode = null;

    Graph.prototype.origColor = null;

    Graph.prototype.fontSize = "16px";

    Graph.prototype.graphNodes = null;

    Graph.prototype.graphLinks = null;

    Graph.prototype.selectedGraphNode = null;

    Graph.prototype.selectedNode = null;

    Graph.prototype.colorRange = ["#fff", "#e56c9c", "#2efd41", "#5a00ff", "#00c3c8", "#bababa"];

    Graph.prototype.groupsAdded = {};

    function Graph(file, options, callback) {
      this.callback = callback;
      this.unhighlight = __bind(this.unhighlight, this);
      this.highlight = __bind(this.highlight, this);
      this.highlightByName = __bind(this.highlightByName, this);
      this.addAll = __bind(this.addAll, this);
      this.nodeById = __bind(this.nodeById, this);
      this.linkByConnections = __bind(this.linkByConnections, this);
      this.addLink = __bind(this.addLink, this);
      this.addNeighbors = __bind(this.addNeighbors, this);
      this.addNode = __bind(this.addNode, this);
      this.getGroup = __bind(this.getGroup, this);
      this.addGroup = __bind(this.addGroup, this);
      this.getGroup = __bind(this.getGroup, this);
      this.removeNodeLinks = __bind(this.removeNodeLinks, this);
      this.removeNode = __bind(this.removeNode, this);
      this.removeGroup = __bind(this.removeGroup, this);
      this.addAllNodes = __bind(this.addAllNodes, this);
      this.removeAll = __bind(this.removeAll, this);
      this.key = __bind(this.key, this);
      this.loaded = __bind(this.loaded, this);
      if (options) {
        this.colorRange = options.colorRange || this.colorRange;
      }
      this.graphNodes = [];
      this.graphLinks = [];
      stageWidth = this.width = $(window).width();
      stageHeight = this.height = $(window).height();
      sw2 = stageWidth / 2;
      sh2 = stageHeight / 2;
      this.force = d3.layout.force().friction(0.92).gravity(0.05).charge(-200).linkDistance(150).size([this.width, this.height]);
      this.centerPull = d3.layout.force();
      this.centerPull.on("tick", (function(_this) {
        return function() {
          var p;
          if (_this.selectedGraphNode) {
            return p = _this.selectedGraphNode.centerPull();
          }
        };
      })(this));
      this.svg = d3.select("body").append("svg").attr("width", this.width).attr("height", this.height);
      $("#nav li").each((function(_this) {
        return function(i, v) {
          var n;
          $(v).css("background-color", _this.colorRange[i + 1]);
          n = i + 1;
          return $(v).click(function(e) {
            _this.removeAll();
            return _this.addGroup(n);
          });
        };
      })(this));
      this.force.on("tick", (function(_this) {
        return function() {
          var link, node, _i, _j, _len, _len1, _ref, _ref1, _results;
          _ref = _this.graphLinks;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            link = _ref[_i];
            link.update();
          }
          _ref1 = _this.graphNodes;
          _results = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            node = _ref1[_j];
            _results.push(node.update());
          }
          return _results;
        };
      })(this));
      controller = this;
      $(window).keypress(this.key);
      $.getJSON(file, this.loaded);
    }

    Graph.prototype.loaded = function(data) {
      this.nodes = this.force.nodes();
      this.links = this.force.links();
      this.data = data;
      if (this.callback) {
        return this.callback();
      }
    };

    Graph.prototype.key = function(e) {
      switch (e.charCode) {
        case 49:
          return this.addGroup(0);
        case 50:
          return this.addGroup(1);
        case 51:
          return this.addGroup(2);
        case 52:
          return this.addGroup(3);
        case 53:
          return this.addGroup(4);
        case 54:
          return this.addGroup(5);
        case 55:
          break;
        case 56:
          break;
        case 57:
          this.removeAllLinks();
          break;
        case 48:
      }
    };

    Graph.prototype.removeAll = function() {
      var n, _i, _len, _ref;
      _ref = this.graphNodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        n.animateOut();
      }
      this.graphNodes = [];
      return this.removeAllLinks();
    };

    Graph.prototype.removeAllLinks = function() {
      var l, _i, _len, _ref;
      if (this.selectedNode) {
        this.unhighlight(this.selectedNode);
      }
      _ref = this.graphLinks;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        l = _ref[_i];
        l.animateOut();
      }
      return this.graphLinks = [];
    };

    Graph.prototype.addAllNodes = function() {
      var found, gn, n, _i, _j, _len, _len1, _ref, _ref1, _results;
      _ref = this.data.nodes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        found = false;
        _ref1 = this.graphNodes;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          gn = _ref1[_j];
          if (gn.node.name === n.name) {
            found = true;
            break;
          }
        }
        if (!found) {
          _results.push(this.addNode(n));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Graph.prototype.removeGroup = function(num) {
      var gn, newNodes, _i, _len, _ref;
      newNodes = [];
      _ref = this.graphNodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        gn = _ref[_i];
        if (gn.node.group === num) {
          this.removeNode(gn);
        } else {
          newNodes.push(gn);
        }
      }
      this.graphNodes = newNodes;
    };

    Graph.prototype.removeNode = function(node) {
      this.removeNodeLinks(node);
      return node.animateOut();
    };

    Graph.prototype.removeNodeLinks = function(node) {
      var l, newLinks, _i, _len, _ref;
      newLinks = [];
      _ref = this.graphLinks;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        l = _ref[_i];
        if (!(l.link.source.graphNode === node || l.link.target.graphNode === node)) {
          newLinks.push(l);
        } else {
          l.animateOut();
        }
      }
      this.graphLinks = newLinks;
    };

    Graph.prototype.getGroup = function(num) {
      var ar, n, _i, _len, _ref;
      ar = [];
      _ref = this.data.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        if (n.group === num) {
          ar.push(n);
        }
      }
      return ar;
    };

    Graph.prototype.addGroup = function(num) {
      var found, gn, n, _i, _j, _len, _len1, _ref, _ref1;
      if (this.groupsAdded[num] && this.groupsAdded[num] === true) {
        this.removeGroup(num);
        this.groupsAdded[num] = false;
      } else {
        this.groupsAdded[num] = true;
        _ref = this.data.nodes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          n = _ref[_i];
          if (n.group === num) {
            found = false;
            _ref1 = this.graphNodes;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              gn = _ref1[_j];
              if (gn.node.name === n.name) {
                found = true;
                break;
              }
            }
            if (!found) {
              this.addNode(n);
            }
          }
        }
        this.force.start();
      }
    };

    Graph.prototype.getGroup = function(num) {
      var found, gn, group, n, _i, _j, _len, _len1, _ref, _ref1;
      group = [];
      _ref = this.data.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        if (n.group === num) {
          found = false;
          _ref1 = this.graphNodes;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            gn = _ref1[_j];
            if (gn.node.name === n.name) {
              found = true;
              break;
            }
          }
          if (!found) {
            group.push(n);
          }
        }
      }
      return group;
    };

    Graph.prototype.addNode = function(data) {
      var found, gn, n, _i, _len, _ref;
      _ref = this.graphNodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        gn = _ref[_i];
        if (gn.node.name === data.name) {
          found = true;
          return gn.node;
        }
      }
      n = new GraphNode(data, this);
      this.graphNodes.push(n);
      return n;
    };

    Graph.prototype.addNeighbors = function(graphNode, connect) {
      var connection, i, l, newSources, newTargets, r, radius, totalCount, _i, _j, _k, _len, _len1, _len2, _ref;
      if (connect == null) {
        connect = true;
      }
      i = graphNode.id();
      r = 0;
      newSources = [];
      newTargets = [];
      _ref = this.data.links;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        l = _ref[_i];
        if (l.source === i) {
          newSources.push(l);
        } else if (l.target === i) {
          newTargets.push(l);
        }
      }
      totalCount = newSources.length + newTargets.length;
      radius = 50 + totalCount * 5;
      for (_j = 0, _len1 = newSources.length; _j < _len1; _j++) {
        l = newSources[_j];
        connection = this.nodeById(l.target);
        if (!connection) {
          this.addNeighborNode(graphNode, l.target, r, radius);
          r += 1;
        }
        if (connect) {
          this.addLink(l);
        }
      }
      for (_k = 0, _len2 = newTargets.length; _k < _len2; _k++) {
        l = newTargets[_k];
        connection = this.nodeById(l.source);
        if (!connection) {
          this.addNeighborNode(graphNode, l.source, r, radius);
          r += 1;
        }
        if (connect) {
          this.addLink(l);
        }
      }
      this.force.start();
      return null;
    };

    Graph.prototype.addNeighborNode = function(graphNode, id, r, radius) {
      var connection, dataNode;
      if (r == null) {
        r = 0;
      }
      if (radius == null) {
        radius = 50;
      }
      dataNode = this.data.nodes[id];
      dataNode.x = graphNode.node.x + Math.cos(r) * radius;
      dataNode.y = graphNode.node.y + Math.sin(r) * radius;
      connection = new GraphNode(dataNode, this);
      this.graphNodes.push(connection);
      return connection;
    };

    Graph.prototype.addLink = function(link) {
      var source, target;
      link = $.extend({}, link);
      source = this.nodeById(link.source);
      target = this.nodeById(link.target);
      if (!(source && target)) {
        return;
      }
      link.source = this.graphNodes.indexOf(source);
      link.target = this.graphNodes.indexOf(target);
      if (!this.linkByConnections(link.source, link.target)) {
        this.graphLinks.push(new GraphLink(link, this));
      }
      return null;
    };

    Graph.prototype.linkByConnections = function(source, target) {
      var l, _i, _len, _ref;
      _ref = this.graphLinks;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        l = _ref[_i];
        if (l.link.source === source && l.link.target === target) {
          return l;
        }
        if (l.link.source === target && l.link.source === source) {
          return l;
        }
      }
      return null;
    };

    Graph.prototype.nodeById = function(id) {
      var n, _i, _len, _ref;
      _ref = this.graphNodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        if (n.id() === id) {
          return n;
        }
      }
      return null;
    };

    Graph.prototype.addAll = function() {
      var i, n, _i, _j, _ref, _ref1;
      for (i = _i = 0, _ref = this.data.nodes.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (!this.nodeById(this.data.nodes[i])) {
          n = this.data.nodes[i];
          this.addNode(n);
        }
      }
      for (i = _j = 0, _ref1 = this.data.links.length - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        n = this.data.links[i];
        if (!this.linkByConnections(n.source, n.target)) {
          this.graphLinks.push(new GraphLink(n, this));
        }
      }
      return this.force.start();
    };

    Graph.prototype.highlightByName = function(str) {
      var d, n, _i, _j, _len, _len1, _ref, _ref1;
      _ref = this.graphNodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        if (n.node.name === str) {
          this.highlight(n.dom);
          return;
        }
      }
      _ref1 = this.data.nodes;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        d = _ref1[_j];
        if (d.name === str) {
          n = this.addNode(d);
          this.highlight(n.dom);
          this.force.start();
          return;
        }
      }
    };

    Graph.prototype.highlight = function(node, connect) {
      if (connect == null) {
        connect = true;
      }
      if (this.selectedNode) {
        this.unhighlight(this.selectedNode);
      }
      node.select("text").transition().duration(300).style("font-size", "36px");
      this.selectedNode = node;
      this.selectedGraphNode = node.data()[0].graphNode;
      this.force.charge(-300);
      this.centerPull.start();
      this.selectedGraphNode.fadeInPull();
      this.addNeighbors(node.data()[0].graphNode, connect);
    };

    Graph.prototype.unhighlight = function(node) {
      this.selectedGraphNode.resetPull();
      this.selectedGraphNode = null;
      this.selectedNode = null;
      return node.select("text").transition().duration(750).style("font-size", this.fontSize);
    };

    return Graph;

  })();

  window.Graph = Graph;

  GraphLink = (function() {
    function GraphLink(link, graph) {
      this.link = link;
      this.graph = graph;
      this.animateOut = __bind(this.animateOut, this);
      this.update = __bind(this.update, this);
      this.dom = this.graph.svg.data([this.link]).insert("line", ":first-child").attr("class", "link").style("stroke-width", function(d) {
        return 2;
      });
      this.element = d3.select(this.dom);
      this.graph.links.push(this.link);
      return this;
    }

    GraphLink.prototype.update = function() {
      return this.dom.attr("x1", function(d) {
        return d.source.x;
      }).attr("y1", function(d) {
        return d.source.y;
      }).attr("x2", function(d) {
        return d.target.x;
      }).attr("y2", function(d) {
        return d.target.y;
      });
    };

    GraphLink.prototype.animateOut = function() {
      this.dom.transition().duration(300).style("stroke", "#000").each("end", (function(_this) {
        return function() {
          return _this.dom.remove();
        };
      })(this));
      return this.graph.links.splice(this.graph.links.indexOf(this.link), 1);
    };

    return GraphLink;

  })();

  GraphNode = (function() {
    GraphNode.prototype.pullAmount = 0.0;

    GraphNode.padding = 70;

    function GraphNode(node, graph) {
      var dom, wh, ww;
      this.node = node;
      this.graph = graph;
      this.animateOut = __bind(this.animateOut, this);
      this.clampToScreen = __bind(this.clampToScreen, this);
      this.outerPull = __bind(this.outerPull, this);
      this.centerPull = __bind(this.centerPull, this);
      this.moveTo = __bind(this.moveTo, this);
      this.resetPull = __bind(this.resetPull, this);
      this.fadeInPull = __bind(this.fadeInPull, this);
      this.update = __bind(this.update, this);
      this.id = __bind(this.id, this);
      this.node = $.extend({}, this.node);
      this.node.graphNode = this;
      this.dom = dom = this.graph.svg.append("g").data([this.node]).attr("class", "node").call(this.graph.force.drag).on("click", (function(_this) {
        return function(e) {
          return controller.highlight(_this.dom);
        };
      })(this));
      ww = window.innerWidth;
      this.node.x = ww * 0.5 + (Math.random() * ww * 0.3) - (ww * 0.15);
      wh = window.innerHeight;
      this.node.y = wh * 0.5 + (Math.random() * wh * 0.2) - (wh * 0.1);
      this.dom.append("text").attr("dy", ".35em").attr("text-anchor", "middle").text(function(d) {
        return d.name;
      }).style("fill", (function(_this) {
        return function(d) {
          return _this.graph.colorRange[d.group];
        };
      })(this)).style("font-size", "3px").transition().style("font-size", this.graph.fontSize).duration(300);
      this.element = d3.select(this.dom);
      this.graph.nodes.push(this.node);
      return this;
    }

    GraphNode.prototype.id = function() {
      return this.node.id;
    };

    GraphNode.prototype.update = function() {
      return this.dom.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    };

    GraphNode.prototype.fadeInPull = function() {
      var pullInterval;
      return pullInterval = setInterval((function(_this) {
        return function() {
          _this.pullAmount += 0.0001;
          if (_this.pullAmount > 0.02) {
            return clearInterval(pullInterval);
          }
        };
      })(this), 1000.0 / 60);
    };

    GraphNode.prototype.resetPull = function() {
      return this.pullAmount = 0.0;
    };

    GraphNode.prototype.moveTo = function(x, y) {
      this.node.x = x;
      this.node.y = y;
      return this.update();
    };

    GraphNode.prototype.centerPull = function() {
      var centerX, centerY;
      centerX = sw2;
      centerY = sh2;
      this.node.x += (centerX - this.node.x) * this.pullAmount;
      this.node.y += (centerY - this.node.y) * this.pullAmount;
      return [this.node.x, this.node.y];
    };

    GraphNode.prototype.dist = function(x1, x2, y1, y2) {
      return Math.sqrt((x1 * x2) + (y1 * y2));
    };

    GraphNode.prototype.outerPull = function(o) {
      if (this.dist(this.node.x, o[0], this.node.y, o[1]) < GraphNode.padding) {
        this.node.x += (40 - (this.node.x - o.node.x)) * .01;
        this.node.y += (40 - (this.node.y - o.node.y)) * .01;
      }
    };

    GraphNode.prototype.clampToScreen = function() {
      this.node.x = Math.max(GraphNode.padding, Math.min(window.innerWidth - GraphNode.padding, this.node.x));
      this.node.y = Math.max(GraphNode.padding, Math.min(window.innerHeight - GraphNode.padding, this.node.y));
    };

    GraphNode.prototype.animateOut = function() {
      this.dom.select("text").transition().duration(300).style("font-size", "3px").each("end", (function(_this) {
        return function() {
          return _this.dom.remove();
        };
      })(this));
      return this.graph.nodes.splice(this.graph.nodes.indexOf(this.node), 1);
    };

    return GraphNode;

  })();

}).call(this);
