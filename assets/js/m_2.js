var drdsgvo_map_version = 5.1;

var p_2_1 = new ol.Feature({
  geometry: new ol.geom.Point(ol.proj.fromLonLat([8.2762513, 50.0012314])),
  name: "Tempo 30 überall",
});
var p_2_2 = new ol.Feature({
  geometry: new ol.geom.Point(ol.proj.fromLonLat([8.2416556, 50.0820384])),
  name: "Gutes Weinfest",
});
var p_2_3 = new ol.Feature({
  geometry: new ol.geom.Point(ol.proj.fromLonLat([8.6820917, 50.1106444])),
  name: "Immer viel Verkehr",
});
var p_2_4 = new ol.Feature({
  geometry: new ol.geom.Point(ol.proj.fromLonLat([8.269554, 50.2212764])),
  name: "Nettes Ausflugsziel",
});

var res_ordered_2 = [8.2416556, 50.0012314, 8.6820917, 50.2212764];
var drdsgvo_mouseWheelZoom_2 = true;
var drdsgvo_script1_2 = document.currentScript;
var drdsgvo_fullUrl_2 = drdsgvo_script1_2.src;
var drdsgvo_root_2 = document.location.hostname;
var drdsgvo_idx1_2 = (" " + drdsgvo_fullUrl_2).indexOf(drdsgvo_root_2);
var drdsgvo_relpath_2 = "/interaktive_karte/";
if (drdsgvo_idx1_2 > 0) {
  drdsgvo_idx1_2--;
  drdsgvo_idx1_2 += drdsgvo_root_2.length_2;
  var drdsgvo_idx2_2 = drdsgvo_fullUrl_2.indexOf("/", drdsgvo_idx1_2);
  if (drdsgvo_idx2_2 > 0) {
    drdsgvo_relpath_2 = drdsgvo_fullUrl_2.substr(drdsgvo_idx2_2);
    var drdsgvo_idx3_2 = drdsgvo_relpath_2.lastIndexOf("/");
    if (drdsgvo_idx3_2 > 0) {
      drdsgvo_relpath_2 = drdsgvo_relpath_2.substr(0, drdsgvo_idx3_2 + 1);
    }
  }
}

var drdsgvo_zoom_2 = null;
var drdsgvo_minzoom_2 = 8;
var drdsgvo_maxzoom_2 = 22;
var drdsgvo_zooms_2 = 17;

var drdsgvo_attribution_2 = new ol.control.Attribution({
  collapsible: false,
});

var drdsgvo_tileerror_2 = 0;
var drdsgvo_failover_2 = 0;
var drdsgvo_view_2;

var drdsgvo_map_2;
var drdsgvo_deltax_2 = 0.7;
var drdsgvo_deltay_2 = 0.3;
var drdsgvo_extent_2;
var drdsgvo_center_2 = null;
var drdsgvo_layer_2 = null;
var drdsgvo_my_x_2;
var drdsgvo_my_y_2;

var drdsgvo_mysource_2 = new ol.source.OSM({
  crossOrigin: null,
  url:
    drdsgvo_relpath_2.replace("/public/js", "") +
    "/proxy/index.php?z={z}&x={x}&y={y}&r=osm",
  attributions: [
    ol.source.OSM.ATTRIBUTION,
    ' &middot; <a target="_blank" href="https://dr-dsgvo.de/?karte">Lösung von Dr. DSGVO</a>',
  ],
  minZoom: drdsgvo_minzoom_2,
  maxZoom: drdsgvo_maxzoom_2,
});

var drdsgvo_tileserver_2 = new ol.layer.Tile({
  source: drdsgvo_mysource_2,
  declutter: true,
  maxZoom: drdsgvo_maxzoom_2,
});

drdsgvo_mysource_2.on("tileloadend", function () {
  drdsgvo_tileerror_2 = 0;
});
drdsgvo_mysource_2.on("tileloaderror", function () {
  drdsgvo_tileerror_2++;
  if (drdsgvo_tileerror_2 > 0 && drdsgvo_failover_2 < 50) {
    drdsgvo_failover_2++;
  }
});

function drdsgvo_initAll_2() {
  var off_y = res_ordered_2[3] - res_ordered_2[1];
  if (off_y <= 1) {
    drdsgvo_deltay_2 = 0.05;
  } else if (off_y <= 2) {
    drdsgvo_deltay_2 = 0.1;
  } else if (off_y <= 6) {
    drdsgvo_deltay_2 = 0.2;
  } else if (off_y <= 10) {
    drdsgvo_deltay_2 = 0.3;
  } else if (off_y <= 18) {
    drdsgvo_deltay_2 = 0.5;
  } else {
    drdsgvo_deltay_2 = 1.9;
  }
  drdsgvo_view_2 = new ol.View({
    minZoom: drdsgvo_minzoom_2,
    maxZoom: drdsgvo_maxzoom_2,
  });
  //var drdsgvo_mouseWheelZoom_2 = true;
  if (window && window.screen) {
    if (
      window.screen.width * window.devicePixelRatio < 800 ||
      window.screen.width < 600
    ) {
      drdsgvo_mouseWheelZoom_2 = false;
    }
  }
  window.app = {};
  var drdsgvo_app = window.app;
  var handledrdsgvo_Init = null;
  var of1 = 1;
  drdsgvo_extent_2 = ol.proj.transformExtent(
    [
      res_ordered_2[0] - drdsgvo_deltax_2 * of1,
      res_ordered_2[1] - drdsgvo_deltay_2 * of1,
      res_ordered_2[2] + drdsgvo_deltax_2 * of1,
      res_ordered_2[3] + drdsgvo_deltay_2 * of1,
    ],
    "EPSG:4326",
    "EPSG:3857"
  );
  //============Center=Mittelpunkt der Bounding Box aller Standorte
  drdsgvo_center_2 = [
    (drdsgvo_extent_2[2] +
      drdsgvo_deltax_2 * of1 +
      (drdsgvo_extent_2[0] - drdsgvo_deltax_2 * of1)) /
      2,
    (drdsgvo_extent_2[3] +
      drdsgvo_deltay_2 * of1 +
      (drdsgvo_extent_2[1] - drdsgvo_deltay_2 * of1)) /
      2,
  ];
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
      this_.getMap().getView().setCenter(drdsgvo_center_2);
    };

    button.addEventListener("click", handledrdsgvo_Init, false);
    button.addEventListener("touchstart", handledrdsgvo_Init, false);

    var element = document.createElement("div");
    element.className = "drdsgvo_initbtn ol-unselectable ol-control";
    element.appendChild(button);

    ol.control.Control.call(this, {
      element: element,
      target: options.target,
    });
  };
  ol.inherits(drdsgvo_app.drdsgvo_IC, ol.control.Control);
  drdsgvo_app.drdsgvo_RC = function (opt_options) {
    var options = opt_options || {};
    var button = document.createElement("button");
    button.className = "drdsgvo_btn";
    var abutton = document.createElement("a");
    abutton.setAttribute("style", "color:#fff !important");
    abutton.innerHTML = "Vollbild";
    var center11 = ol.proj.transform(
      drdsgvo_center_2,
      "EPSG:3857",
      "EPSG:4326"
    );
    var zoomx = 8;

    abutton.setAttribute(
      "href",
      "https://www.openstreetmap.org/#map=" +
        zoomx +
        "/" +
        center11[1] +
        "/" +
        center11[0] +
        "&layers=N"
    );
    abutton.setAttribute("target", "_blank");
    button.appendChild(abutton);

    var element = document.createElement("div");
    element.className = "drdsgvo_routebtn ol-unselectable ol-control";
    element.appendChild(button);

    ol.control.Control.call(this, {
      element: element,
      target: options.target,
    });
  };
  ol.inherits(drdsgvo_app.drdsgvo_RC, ol.control.Control);

  var labelStyle = new ol.style.Style({
    text: new ol.style.Text({
      font: "12px Calibri,sans-serif",
      overflow: true,
      fill: new ol.style.Fill({
        color: "#2e85cb",
      }),
      stroke: new ol.style.Stroke({
        color: "#fff",
        width: 3,
      }),
      offsetY: -55,
    }),
  });
  var iconStyle = new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 46],
      anchorXUnits: "fraction",
      anchorYUnits: "pixels",
      src: drdsgvo_relpath_2 + "/marker.png",
      scale: 0.1,
    }),
  });
  var style = [iconStyle, labelStyle];
  drdsgvo_map_2 = new ol.Map({
    controls: ol.control
      .defaults({ attribution: false })
      .extend([drdsgvo_attribution_2])
      .extend([new drdsgvo_app.drdsgvo_IC()])
      .extend([new drdsgvo_app.drdsgvo_RC()]),
    interactions: ol.interaction.defaults({
      mouseWheelZoom: drdsgvo_mouseWheelZoom_2,
    }),
    layers: [
      drdsgvo_tileserver_2,
      new ol.layer.Vector({
        source: new ol.source.Vector({
          features: [p_2_1, p_2_2, p_2_3, p_2_4],
        }),
        style: function (feature) {
          labelStyle.getText().setText(feature.get("name"));
          return style;
        },
      }),
    ],
    target: "ol-map-2",
    view: drdsgvo_view_2,
  });

  drdsgvo_map_2.on("moveend", function () {
    var zoom = drdsgvo_map_2.getView().getZoom();
    if (zoom > drdsgvo_zooms_2) {
      drdsgvo_map_2.getView().setZoom(drdsgvo_zooms_2);
    }
  });
  drdsgvo_initView_2();
  drdsgvo_addMarker_2();
  var size = drdsgvo_map_2.getSize();
  drdsgvo_view_2.setCenter(drdsgvo_center_2);
  drdsgvo_view_2.fit(drdsgvo_extent_2, size, { constrainResolution: true });
  drdsgvo_view_2.setZoom(13);
}

function drdsgvo_initView_2() {
  var of1 = 1;
  drdsgvo_extent_2 = ol.proj.transformExtent(
    [
      res_ordered_2[0] - drdsgvo_deltax_2 * of1,
      res_ordered_2[1] - drdsgvo_deltay_2 * of1,
      res_ordered_2[2] + drdsgvo_deltax_2 * of1,
      res_ordered_2[3] + drdsgvo_deltay_2 * of1,
    ],
    "EPSG:4326",
    "EPSG:3857"
  );
}
function drdsgvo_addMarker_2(center1) {
  drdsgvo_layer_2 = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [p_2_1, p_2_2, p_2_3, p_2_4],
    }),
    style: new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        src: drdsgvo_relpath_2 + "/marker.png",
      }),
    }),
  });

  drdsgvo_map_2.addLayer(drdsgvo_layer_2);
}

function drdsgvo_docReady_2(fn) {
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}
drdsgvo_docReady_2(function () {
  drdsgvo_initAll_2();
});
