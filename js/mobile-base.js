
// initialize map when page ready
var map;



var gg = new OpenLayers.Projection("EPSG:4326");
var sm = new OpenLayers.Projection("EPSG:900913");

var init = function (onSelectFeatureFunction) {
	OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
		defaultHandlerOptions: {
			'single': true,
			'double': false,
			'pixelTolerance': 0,
			'stopSingle': false,
			'stopDouble': false
		},

		initialize: function(options) {
			this.handlerOptions = OpenLayers.Util.extend(
				{}, this.defaultHandlerOptions
			);
			OpenLayers.Control.prototype.initialize.apply(
				this, arguments
			); 
			this.handler = new OpenLayers.Handler.Click(
				this, {
					'click': this.onClick,
					'dblclick': this.onDblclick 
				}, this.handlerOptions
			);
		}, 

		onClick: function(evt) {
			s = map.getLonLatFromViewPortPx( evt.xy );
			console.log(s);
		}

	});
	
    var sprintersLayer = new OpenLayers.Layer.Vector("Sprinters", {
        styleMap: new OpenLayers.StyleMap({
            externalGraphic: "http://www.3dyou.cn/apps/scenic/Tpl/default/Public/img/scenicmap_loc.png",
            graphicOpacity: 1.0,
            graphicWith: 16,
            graphicHeight: 26,
            graphicYOffset: -26
        })
    });

	function get3DyouXY(id)
	{
		sprintersLayer.removeAllFeatures();
		var sprinters = getFeatures(id);
		sprintersLayer.addFeatures(sprinters);	
	}
	

	var selectControl = new OpenLayers.Control.SelectFeature(sprintersLayer, {
			autoActivate:true,
			onSelect: onSelectFeatureFunction});
			
	var can_edit = 1;
	if(can_edit){
		// allow testing of specific renderers via "?renderer=Canvas", etc
		var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
		renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
	
		vectors = new OpenLayers.Layer.Vector("New Vector Layer", {
			renderers: renderer
		});




		controls = {
			point: new OpenLayers.Control.DrawFeature(sprintersLayer,
						OpenLayers.Handler.Point),						
			drag: new OpenLayers.Control.DragFeature(sprintersLayer)
		};
		controls.drag.onComplete = function(feature, pixel){
			geojson = new OpenLayers.Format.GeoJSON();
            var str = geojson.write(vectors.features, true);
			s = map.getLonLatFromViewPortPx( pixel );
			console.log(s,pixel,str);
		}
	}
			
	var geolocate = new OpenLayers.Control.Geolocate({
		id: 'locate-control',
		geolocationOptions: {
			enableHighAccuracy: false,
			maximumAge: 0,
			timeout: 7000
		}
	});
	
	var R2003 = 20037508;

	function get3DyouRestrictedExtent(){
		maxnum = Math.max(scenicinfo.w,scenicinfo.h);
		log2   = Math.ceil(Math.log(maxnum) / Math.LN2);
		maxnum = Math.pow(2,log2);
		return new OpenLayers.Bounds(
				-20037508 + (20037508*2) *(maxnum - scenicinfo.w)/(maxnum*2) ,
				 20037508  -  20037508*2  + (20037508*2) *(maxnum - scenicinfo.h)/(maxnum*2) ,
				-20037508 +  20037508*2 - (20037508*2) *(maxnum - scenicinfo.w)/(maxnum*2) ,
				20037508 - (20037508*2) *(maxnum - scenicinfo.h)/(maxnum*2)
			);
	}
    // create map
    //map = get3DyouToue({w:3555,h:2000});
	
	map = new OpenLayers.Map({
			div: "map",
			theme: null,
			projection: sm,
			units: "m",
			resolutions: [1.40625,0.703125,0.3515625],
			maxExtent: new OpenLayers.Bounds(
				-20037508, -20037508, 20037508, 20037508
			),
			restrictedExtent: get3DyouRestrictedExtent(),
			controls: [
				new OpenLayers.Control.Attribution(),
				new OpenLayers.Control.TouchNavigation({
					dragPanOptions: {
						enableKinetic: true
					}
				}),
				new OpenLayers.Control.Click({
					handlerOptions: {
						"single": true
					}
				}),
				geolocate,
				selectControl
			],
			layers: [
				new OpenLayers.Layer.neo3dyou256("中山纪念堂", 
					'http://3dyou.cn/data/uploads/scenic/'+scenicinfo.url[0]+'/${z}/x${x}y${y}.jpg', 
					{
					uuu:scenicinfo.url[0],
					transitionEffect: 'resize',
					buffer:2,
					numZoomLevels: (scenicinfo.zmax + 1) ,
					minZoomLevels: scenicinfo.zmin	 
					}
				),
				new OpenLayers.Layer.neo3dyou256("玫瑰宝趣园", 
					'http://3dyou.cn/data/uploads/scenic/'+scenicinfo.url[1]+'/${z}/x${x}y${y}.jpg', 
					{
					uuu:scenicinfo.url[1],
					transitionEffect: 'resize',
					buffer:2,
					numZoomLevels: (scenicinfo.zmax + 1) ,
					minZoomLevels: scenicinfo.zmin	 
					}
				),
				new OpenLayers.Layer.neo3dyou256("宝墨园", 
					'http://3dyou.cn/data/uploads/scenic/'+scenicinfo.url[2]+'/${z}/x${x}y${y}.jpg', 
					{
					uuu:scenicinfo.url[2],
					transitionEffect: 'resize',
					buffer:2,
					numZoomLevels: (scenicinfo.zmax + 1) ,
					minZoomLevels: scenicinfo.zmin	 
					}
				),
				sprintersLayer
			],
			center: new OpenLayers.LonLat(0,0),
			zoom: 4
		});
	//alert(map.buffer);
	get3DyouXY("0/237/navi");
	
	map.events.register('changelayer', null, function(evt) 
		{ 
			get3DyouXY(evt.layer.uuu);
		} 
	); 
	
	if(can_edit){
		for(var key in controls) {
			map.addControl(controls[key]);
		}
	}
	
	
    var style = {
        fillOpacity: 0.1,
        fillColor: '#000',
        strokeColor: '#f00',
        strokeOpacity: 0.6
    };
    geolocate.events.register("locationupdated", this, function(e) {
        vector.removeAllFeatures();
        vector.addFeatures([
            new OpenLayers.Feature.Vector(
                e.point,
                {},
                {
                    graphicName: 'cross',
                    strokeColor: '#f00',
                    strokeWidth: 2,
                    fillOpacity: 0,
                    pointRadius: 10
                }
            ),
            new OpenLayers.Feature.Vector(
                OpenLayers.Geometry.Polygon.createRegularPolygon(
                    new OpenLayers.Geometry.Point(e.point.x, e.point.y),
                    e.position.coords.accuracy / 2,
                    50,
                    0
                ),
                {},
                style
            )
        ]);
        map.zoomToExtent(vector.getDataExtent());
    });
	
    function getFeatures(id) {
        var features = [                
                { "id": "0/237/navi", "type": "Feature", "geometry": {"type": "Point", "coordinates": [733795,2064411]},
                    "properties": {"孙中山雕像": "孙中山（1866.11.12—1925.03.12），名孙文，字载之，号逸仙。中国近代民主主义革命的先行者，中华民国和中国国民党创始人，三民主义的倡导者。"}},
				{ "id": "0/237/navi", "type": "Feature", "geometry": {"type": "Point", "coordinates": [-322869,-1159474]},
                    "properties": {"Name": "华表"}},
				{ "id": "0/237/navi", "type": "Feature", "geometry": {"type": "Point", "coordinates": [-6701566,1944843]},
                    "properties": {"Name": "华表"}},
				{ "id": "0/315/navi", "type": "Feature", "geometry": {"type": "Point", "coordinates": [-1428454,2054627]},
                    "properties": {"Name": "花房1"}},
				{ "id": "0/315/navi", "type": "Feature", "geometry": {"type": "Point", "coordinates": [-5195271,1242560]},
                    "properties": {"Name": "花房2"}},
				{ "id": "0/304/navi", "type": "Feature", "geometry": {"type": "Point", "coordinates": [-322869,-1159474]},
                    "properties": {"Name": "荷花池"}}
            ];
		var results = {
            "type": "FeatureCollection",
            "features": [                
            ]
        };
		console.log(id);
			
        var reader = new OpenLayers.Format.GeoJSON();
		for(i=0;i<features.length;i++){
			if(features[i].id == String(id)){
				results.features.push(features[i]);		
			}
		}
        return reader.read(results);
    }
		
};
