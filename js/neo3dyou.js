/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */


/** 
 * Class: OpenLayers.Layer.NEO3DYOUXYZ
 * The NEO3DYOUXYZ class is designed to make it easier for people who have tiles
 * arranged by a standard NEO3DYOUXYZ grid. 
 * 
 * Inherits from:
 *  - <OpenLayers.Layer.Grid>
 */
OpenLayers.Layer.NEO3DYOUXYZ = OpenLayers.Class(OpenLayers.Layer.Grid, {
    
    /**
     * APIProperty: isBaseLayer
     * Default is true, as this is designed to be a base tile source. 
     */
    isBaseLayer: true,
    
    /**
     * APIProperty: sphericalMecator
     * Whether the tile extents should be set to the defaults for 
     *    spherical mercator. Useful for things like OpenStreetMap.
     *    Default is false, except for the OSM subclass.
     */
    sphericalMercator: false,

    /**
     * APIProperty: zoomOffset
     * {Number} If your cache has more zoom levels than you want to provide
     *     access to with this layer, supply a zoomOffset.  This zoom offset
     *     is added to the current map zoom level to determine the level
     *     for a requested tile.  For example, if you supply a zoomOffset
     *     of 3, when the map is at the zoom 0, tiles will be requested from
     *     level 3 of your cache.  Default is 0 (assumes cache level and map
     *     zoom are equivalent).  Using <zoomOffset> is an alternative to
     *     setting <serverResolutions> if you only want to expose a subset
     *     of the server resolutions.
     */
    zoomOffset: 0,
    
    /**
     * APIProperty: serverResolutions
     * {Array} A list of all resolutions available on the server.  Only set this
     *     property if the map resolutions differs from the server.
     */
    serverResolutions: null,

    /**
     * Constructor: OpenLayers.Layer.NEO3DYOUXYZ
     *
     * Parameters:
     * name - {String}
     * url - {String}
     * options - {Object} Hashtable of extra options to tag onto the layer
     */
    initialize: function(name, url, options) {
        if (options && options.sphericalMercator || this.sphericalMercator) {
            options = OpenLayers.Util.extend({
                maxExtent: new OpenLayers.Bounds(
                    -128 * 156543.03390625,
                    -128 * 156543.03390625,
                    128 * 156543.03390625,
                    128 * 156543.03390625
                ),
                maxResolution: 156543.03390625,
                numZoomLevels: 19,
                units: "m",
                projection: "EPSG:900913"
            }, options);
        }
        url = url || this.url;
        name = name || this.name;
        var newArguments = [name, url, {}, options];
        OpenLayers.Layer.Grid.prototype.initialize.apply(this, newArguments);
    },
    
    /**
     * APIMethod: clone
     * Create a clone of this layer
     *
     * Parameters:
     * obj - {Object} Is this ever used?
     * 
     * Returns:
     * {<OpenLayers.Layer.NEO3DYOUXYZ>} An exact clone of this OpenLayers.Layer.NEO3DYOUXYZ
     */
    clone: function (obj) {
        
        if (obj == null) {
            obj = new OpenLayers.Layer.NEO3DYOUXYZ(this.name,
                                            this.url,
                                            this.getOptions());
        }

        //get all additions from superclasses
        obj = OpenLayers.Layer.Grid.prototype.clone.apply(this, [obj]);

        return obj;
    },    

    /**
     * Method: getURL
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     *
     * Returns:
     * {String} A string with the layer's url and parameters and also the
     *          passed-in bounds and appropriate tile size specified as
     *          parameters
     */
    getURL: function (bounds) {
        var xyz = this.getNEO3DYOUXYZ(bounds);
        var url = this.url;
        if (OpenLayers.Util.isArray(url)) {
            var s = '' + xyz.x + xyz.y + xyz.z;
            url = this.selectUrl(s, url);
        }
        
        return OpenLayers.String.format(url, xyz);
    },
    
    /**
     * Method: getNEO3DYOUXYZ
     * Calculates x, y and z for the given bounds.
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     *
     * Returns:
     * {Object} - an object with x, y and z properties.
     */
    getNEO3DYOUXYZ: function(bounds) {
        var res = this.map.getResolution();
		//console.log(bounds,this.maxExtent);
        var x = Math.round((bounds.left - this.maxExtent.left) /
            (res * this.tileSize.w));
        var y = Math.round((this.maxExtent.top - bounds.top) /
            (res * this.tileSize.h));
        var z = this.serverResolutions != null ?
            OpenLayers.Util.indexOf(this.serverResolutions, res) :
            this.map.getZoom() + this.zoomOffset;

        //var limit = Math.pow(2, z);
        //if (this.wrapDateLine)
        //{
         //  x = ((x % limit) + limit) % limit;
        //}

        return {'x': x, 'y': y, 'z': z};
    },
    
    /* APIMethod: setMap
     * When the layer is added to a map, then we can fetch our origin 
     *    (if we don't have one.) 
     * 
     * Parameters:
     * map - {<OpenLayers.Map>}
     */
    setMap: function(map) {
        OpenLayers.Layer.Grid.prototype.setMap.apply(this, arguments);
        if (!this.tileOrigin) { 
            this.tileOrigin = new OpenLayers.LonLat(this.maxExtent.left,
                                                this.maxExtent.bottom);
        }                                       
    },

    CLASS_NAME: "OpenLayers.Layer.NEO3DYOUXYZ"
});

 
/**
 * Class: OpenLayers.Layer.TileCache
 * A read only TileCache layer.  Used to requests tiles cached by TileCache in
 *     a web accessible cache.  This means that you have to pre-populate your
 *     cache before this layer can be used.  It is meant only to read tiles
 *     created by TileCache, and not to make calls to TileCache for tile
 *     creation.  Create a new instance with the
 *     <OpenLayers.Layer.TileCache> constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Layer.Grid>
 */
/** 
 * 对自定义规则切割的图片进行拼装的类 
 */  
OpenLayers.Layer.neo3dyou = OpenLayers.Class(OpenLayers.Layer.NEO3DYOUXYZ, {
     name: "3dyou",
     attribution: "Data CC-By-SA by <a href='http://3dyou.cn/'>3dyou</a>",
     sphericalMercator: true,
	 maxExtent: new OpenLayers.Bounds(
		-128 * 156543.03390625,
		-128 * 156543.03390625,
		128 * 156543.03390625,
		128 * 156543.03390625
	),
	maxResolution: 156543.03390625,
	numZoomLevels: 19,
	 
	 tileSize: new OpenLayers.Size(128, 128),	 
     url: 'http://3dyou.cn/3dyou/tileAPP2/maps/x${x}y${y}z1.jpg',
	 //url: 'http://127.0.0.1/maps/x${x}y${y}z1.jpg',     
     clone: function(obj) {
         if (obj == null) {
             obj = new OpenLayers.Layer.neo3dyou(
                 this.name, this.url, this.getOptions());
         }
         obj = OpenLayers.Layer.NEO3DYOUXYZ.prototype.clone.apply(this, [obj]);
         return obj;
     },
     wrapDateLine: true,
     CLASS_NAME: "OpenLayers.Layer.neo3dyou"
});



OpenLayers.Layer.neo3dyou256 = OpenLayers.Class(OpenLayers.Layer.NEO3DYOUXYZ, {
     name: "neo3dyou256",
     attribution: "Data CC-By-SA by <a href='http://3dyou.cn/'>neo3dyou256</a>",
     sphericalMercator: true,
	 maxExtent: new OpenLayers.Bounds(
		-128 * 156543.03390625,
		-128 * 156543.03390625,
		128 * 156543.03390625,
		128 * 156543.03390625
	),
	maxResolution: 156543.03390625,
	numZoomLevels: 19,
	 
	 tileSize: new OpenLayers.Size(256, 256),	 
	 url: 'http://127.0.0.1/maps256/x${x}y${y}z1.jpg',
	 //url: 'http://3dyou.cn/data/uploads/scenic/'+scenicinfo.url+'/${z}/x${x}y${y}.jpg',					
     clone: function(obj) {
         if (obj == null) {
             obj = new OpenLayers.Layer.neo3dyou256(
                 this.name, this.url, this.getOptions());
         }
         obj = OpenLayers.Layer.NEO3DYOUXYZ.prototype.clone.apply(this, [obj]);
         return obj;
     },
     wrapDateLine: true,
     CLASS_NAME: "OpenLayers.Layer.neo3dyou256"
});
