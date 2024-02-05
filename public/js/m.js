const { initial_zoomlevel, latitude, longitude } = OpenStreetParams;
const wbp_zoom = parseFloat(initial_zoomlevel);
const wbp_lat = parseFloat(latitude);
const wbp_long = parseFloat(longitude);
const drdsgvo_script1 = document.currentScript;
const drdsgvo_fullUrl = drdsgvo_script1.src;
const drdsgvo_root = document.location.hostname;

let drdsgvo_relpath;
let drdsgvo_idx1 = (" " + drdsgvo_fullUrl).indexOf(drdsgvo_root);
if (drdsgvo_idx1 > 0) {
  drdsgvo_idx1--;
  drdsgvo_idx1 += drdsgvo_root.length;
  var drdsgvo_idx2 = drdsgvo_fullUrl.indexOf("/", drdsgvo_idx1);
  if (drdsgvo_idx2 > 0) {
    drdsgvo_relpath = drdsgvo_fullUrl.substr(drdsgvo_idx2);
    var drdsgvo_idx3 = drdsgvo_relpath.lastIndexOf("/");
    if (drdsgvo_idx3 > 0) {
      drdsgvo_relpath = drdsgvo_relpath.substr(0, drdsgvo_idx3 + 1);
    }
  }
}

var drdsgvo_center_x = null;
var drdsgvo_center_y = null;
var drdsgvo_zoom = null;
var drdsgvo_minzoom = 9;
var drdsgvo_maxzoom = 18;
var drdsgvo_zooms = drdsgvo_maxzoom - drdsgvo_minzoom;
var drdsgv_attribution = new ol_dsgvo.control.Attribution({
  collapsible: false,
});

var drdsgvo_tileerror = 0;
var drdsgvo_failover = 0;
var drdsgvo_view;

var drdsgvo_map;
var drdsgvo_deltax = 0.7;
var drdsgvo_deltay = 0.3;
var drdsgvo_extent;
var drdsgvo_maxResolution;
var drdsgvo_resolution = 0;
var drdsgvo_center = null;
var drdsgvo_layer = null;
var drdsgvo_my_x;
var drdsgvo_my_y;

function drdsgvo_resChange() {
  var oldView = drdsgvo_map.getView();
  if (drdsgvo_resolution == 0 || oldView.getZoom() % 1 == 0) {
    drdsgvo_resolution = oldView.getResolution();
    var width = drdsgvo_map.getSize()[0] * drdsgvo_resolution;
    var height = drdsgvo_map.getSize()[1] * drdsgvo_resolution;
    var ozoom = oldView.getZoom();
    var drdsgvo_extent2;
    if (ozoom <= 4 || ozoom > 6) {
      var of = 1;
      if (ozoom == 3) {
        of = 2;
      } else if (ozoom == 2) {
        of = 2.5;
      } else if (ozoom == 1) {
        of = 3;
      } else if (ozoom <= 0) {
        of = 3.5;
      } else if (ozoom == 7) {
        of = 0.2;
      } else if (ozoom == 8) {
        of = 0.1;
      } else if (ozoom > 8) {
        of = 0.05;
      }
      drdsgvo_extent2 = ol_dsgvo.proj.transformExtent(
        [
          wbp_long - drdsgvo_deltax * of,
          wbp_lat - drdsgvo_deltay * of,
          wbp_long + drdsgvo_deltax * of,
          wbp_lat + drdsgvo_deltay * of,
        ],
        "EPSG:4326",
        "EPSG:3857"
      );
    } else {
      drdsgvo_extent2 = drdsgvo_extent;
    }
    var newView = new ol_dsgvo.View({
      projection: oldView.getProjection(),
      extent: [
        drdsgvo_extent2[0] + width / 2,
        drdsgvo_extent2[1] + height / 2,
        drdsgvo_extent2[2] - width / 2,
        drdsgvo_extent2[3] - height / 2,
      ],
      resolution: drdsgvo_resolution,
      maxResolution: drdsgvo_maxResolution,
      minZoom: drdsgvo_minzoom,
      maxZoom: drdsgvo_maxzoom,
      rotation: oldView.getRotation(),
    });
    newView.setCenter(newView.constrainCenter(oldView.getCenter()));
    newView.on("change:resolution", drdsgvo_resChange);
    drdsgvo_map.setView(newView);
  }
}
var drdsgvo_mysource = new ol_dsgvo.source.OSM({
  crossOrigin: null,
  url: drdsgvo_relpath + "/proxy/index.php?z={z}&x={x}&y={y}&r=osm",
  attributions: [
    ol_dsgvo.source.OSM.ATTRIBUTION,
    ' &middot; <a target="_blank" href="https://dr-dsgvo.de/?karte">Lösung von Dr. DSGVO</a>',
  ],
  minZoom: drdsgvo_minzoom,
  maxZoom: drdsgvo_maxzoom,
});

var drdsgv_tileserver = new ol_dsgvo.layer.Tile({
  source: drdsgvo_mysource,
  declutter: true,
  maxZoom: drdsgvo_maxzoom,
});

drdsgvo_mysource.on("tileloadend", function () {
  drdsgvo_tileerror = 0;
});
drdsgvo_mysource.on("tileloaderror", function () {
  drdsgvo_tileerror++;
  if (drdsgvo_tileerror > 0 && drdsgvo_failover < 50) {
    drdsgvo_failover++;
    drdsgvo_mysource.setUrl(
      drdsgvo_relpath + "/proxy/index.php?z={z}&x={x}&y={y}&r=osm"
    );
  }
});

function drdsgvo_initAll() {
  drdsgvo_view = new ol_dsgvo.View({
    center: ol_dsgvo.proj.transform(
      [wbp_long, wbp_lat],
      "EPSG:4326",
      "EPSG:3857"
    ),
    zoom: 15,
    minZoom: drdsgvo_minzoom,
    maxZoom: drdsgvo_maxzoom,
  });
  var drdsgvo_mouseWheelZoom = true;
  if (window && window.screen) {
    if (
      window.screen.width * window.devicePixelRatio < 800 ||
      window.screen.width < 600
    ) {
      drdsgvo_mouseWheelZoom = false;
    }
  }
  drdsgvo_center = drdsgvo_view.getCenter();
  window.app = {};
  var drdsgvo_app = window.app;
  var handledrdsgvo_Init = null;
  drdsgvo_app.drdsgvo_IC = function (opt_options) {
    var options = opt_options || {};
    var button = document.createElement("img");
    button.setAttribute("style", "max-width:16px;cursor:pointer");
    button.setAttribute(
      "src",
      "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTcwLjk1bW0iIGhlaWdodD0iMTcwLjk1bW0iIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDE3MC45NSAxNzAuOTUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6Y2M9Imh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL25zIyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogPG1ldGFkYXRhPgogIDxyZGY6UkRGPgogICA8Y2M6V29yayByZGY6YWJvdXQ9IiI+CiAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgIDxkYzp0eXBlIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiLz4KICAgIDxkYzp0aXRsZS8+CiAgIDwvY2M6V29yaz4KICA8L3JkZjpSREY+CiA8L21ldGFkYXRhPgogPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTY0Ny4yOCAtNTkuMjYyKSI+CiAgPGNpcmNsZSBjeD0iNzMyLjc1IiBjeT0iMTQ0Ljc0IiByPSI2NS43NjgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEwIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogIDxnPgogICA8Y2lyY2xlIGN4PSI3MzIuNzUiIGN5PSIxNDQuNzQiIHI9IjEwIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogICA8cmVjdCB4PSI3NjguMjMiIHk9IjE0MC4zMSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwIiByeT0iMS43NDAzIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogICA8cmVjdCB0cmFuc2Zvcm09InJvdGF0ZSg5MCkiIHg9IjE4MC4yMSIgeT0iLTczNy43NSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwIiByeT0iMS43NDAzIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogICA8cmVjdCB0cmFuc2Zvcm09InJvdGF0ZSg5MCkiIHg9IjU5LjI2MiIgeT0iLTczNy43NSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwIiByeT0iMS43NDAzIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogICA8cmVjdCB4PSI2NDcuMjgiIHk9IjE0MC4zMSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwIiByeT0iMS43NDAzIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogIDwvZz4KIDwvZz4KPC9zdmc+Cg=="
    );
    var this_ = this;
    handledrdsgvo_Init = function (e) {
      this_.getMap().getView().setCenter(drdsgvo_center);
    };

    button.addEventListener("click", handledrdsgvo_Init, false);
    button.addEventListener("touchstart", handledrdsgvo_Init, false);

    var element = document.createElement("div");
    element.className = "drdsgvo_initbtn ol-unselectable ol-control";
    element.appendChild(button);

    ol_dsgvo.control.Control.call(this, {
      element: element,
      target: options.target,
    });
  };
  ol_dsgvo.inherits(drdsgvo_app.drdsgvo_IC, ol_dsgvo.control.Control);
  drdsgvo_app.drdsgvo_RC = function (opt_options) {
    var options = opt_options || {};
    var button = document.createElement("button");
    button.className = "drdsgvo_btn";
    var abutton = document.createElement("a");
    abutton.setAttribute("style", "color:#fff !important");
    abutton.innerHTML = "Vollbild";

    abutton.setAttribute(
      "href",
      "https://www.openstreetmap.org/?mlat=" +
        wbp_lat +
        "&mlon=" +
        wbp_long +
        "#map=" +  wbp_zoom + "/" +
        wbp_lat +
        "/" +
        wbp_long +
        "&layers=N"
    );
    abutton.setAttribute("target", "_blank");
    button.appendChild(abutton);

    var element = document.createElement("div");
    element.className = "drdsgvo_routebtn ol-unselectable ol-control";
    element.appendChild(button);

    ol_dsgvo.control.Control.call(this, {
      element: element,
      target: options.target,
    });
  };
  ol_dsgvo.inherits(drdsgvo_app.drdsgvo_RC, ol_dsgvo.control.Control);

  const targets = document.querySelectorAll(".drdsgvo_map");
  console.log(targets)
  targets.forEach((el, index) => {
    let idx = index + 1;
    drdsgvo_map = new ol_dsgvo.Map({
      controls: ol_dsgvo.control
        .defaults({ attribution: false })
        .extend([drdsgv_attribution])
        .extend([new drdsgvo_app.drdsgvo_IC()])
        .extend([new drdsgvo_app.drdsgvo_RC()]),
      interactions: ol_dsgvo.interaction.defaults({
        mouseWheelZoom: drdsgvo_mouseWheelZoom,
      }),
      layers: [drdsgv_tileserver],
      target: "drdsgvo_map_" + idx,
      view: drdsgvo_view,
    });
  
    drdsgvo_map.on("moveend", function () {
      var zoom = drdsgvo_map.getView().getZoom();
      if (zoom > drdsgvo_zooms) {
        drdsgvo_map.getView().setZoom(drdsgvo_zooms);
      }
    });
    if (!drdsgvo_initView(drdsgvo_map)) return;
    drdsgvo_maxResolution = drdsgvo_view.getResolution();
    drdsgvo_resChange();
    drdsgvo_map.getView().setZoom(wbp_zoom - drdsgvo_minzoom);
    handledrdsgvo_Init();
    drdsgvo_addMarker();
  });

}

function drdsgvo_initView(map) {
  drdsgvo_extent = ol_dsgvo.proj.transformExtent(
    [
      wbp_long - drdsgvo_deltax,
      wbp_lat - drdsgvo_deltay,
      wbp_long + drdsgvo_deltax,
      wbp_lat + drdsgvo_deltay,
    ],
    "EPSG:4326",
    "EPSG:3857"
  );
  var size = map.getSize();
  if (!size || size == undefined) return false;
  var width = ol_dsgvo.extent.getWidth(drdsgvo_extent);
  var height = ol_dsgvo.extent.getHeight(drdsgvo_extent);
  if (size[0] / size[1] > width / height) {
    drdsgvo_view.fit(
      [
        drdsgvo_extent[0],
        (drdsgvo_extent[1] + drdsgvo_extent[3]) / 2,
        drdsgvo_extent[2],
        (drdsgvo_extent[1] + drdsgvo_extent[3]) / 2,
      ],
      { constrainResolution: true }
    );
  } else {
    drdsgvo_view.fit(
      [
        (drdsgvo_extent[0] + drdsgvo_extent[2]) / 2,
        drdsgvo_extent[1],
        (drdsgvo_extent[0] + drdsgvo_extent[2]) / 2,
        drdsgvo_extent[3],
      ],
      { constrainResolution: true }
    );
  }
  return true;
}
function drdsgvo_addMarker(center1) {
  if (!center1 || center1 == null || center1 == undefined) {
    var center = ol_dsgvo.proj.transform(
      drdsgvo_map.getView().getCenter(),
      "EPSG:3857",
      "EPSG:4326"
    );
    drdsgvo_my_x = center[0];
    drdsgvo_my_y = center[1];
  } else {
    var center = ol_dsgvo.proj.transform(center1, "EPSG:3857", "EPSG:4326");
    drdsgvo_my_x = center[0];
    drdsgvo_my_y = center[1];
  }
  drdsgvo_layer = new ol_dsgvo.layer.Vector({
    source: new ol_dsgvo.source.Vector({
      features: [
        new ol_dsgvo.Feature({
          geometry: new ol_dsgvo.geom.Point(
            ol_dsgvo.proj.fromLonLat([drdsgvo_my_x, drdsgvo_my_y])
          ),
        }),
      ],
    }),
    style: new ol_dsgvo.style.Style({
      image: new ol_dsgvo.style.Icon({
        anchor: [0.5, 1],
        src: drdsgvo_relpath + "/marker.png",
      }),
    }),
  });

  drdsgvo_map.addLayer(drdsgvo_layer);
}

function drdsgvo_addMarker2(coord_x, coord_y) {
  var drdsgvo_layer2 = new ol_dsgvo.layer.Vector({
    source: new ol_dsgvo.source.Vector({
      features: [
        new ol_dsgvo.Feature({
          geometry: new ol_dsgvo.geom.Point(
            ol.proj.fromLonLat([coord_x, coord_y])
          ),
        }),
      ],
    }),
    style: new ol_dsgvo.style.Style({
      image: new ol_dsgvo.style.Icon({
        anchor: [0.5, 1],
        src: drdsgvo_relpath + "/marker.png",
      }),
    }),
  });

  drdsgvo_map.addLayer(drdsgvo_layer2);
}

function drdsgvo_docReady(fn) {
  // see if DOM is already available
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}
drdsgvo_docReady(() => drdsgvo_initAll());