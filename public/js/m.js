const { latitude, longitude, ini_zoom, min_zoom, max_zoom, filter } =
  OpenStreetParams;

console.log(OpenStreetParams);

const ol_zoom = ini_zoom + 1;
const ol_minzoom = min_zoom; // 9
const ol_maxzoom = max_zoom; // 18
const ol_lat = parseFloat(latitude);
const ol_lon = parseFloat(longitude);
const ol_script = document.currentScript;
const ol_script_url = ol_script.src;
const ol_root = document.location.hostname;
const ol_deltax = 0.7;
const ol_deltay = 0.3;
const ol_zooms = ol_maxzoom - ol_minzoom;
const ol_attribution = new ol.control.Attribution({ collapsible: false });
const EPSG = ["EPSG:4326", "EPSG:3857"];

let ol_path;
let ol_idx1 = (" " + ol_script_url).indexOf(ol_root);
if (ol_idx1 > 0) {
  ol_idx1--;
  ol_idx1 += ol_root.length;
  let ol_idx2 = ol_script_url.indexOf("/", ol_idx1);
  if (ol_idx2 > 0) {
    ol_path = ol_script_url.substr(ol_idx2);
    let ol_idx3 = ol_path.lastIndexOf("/");
    if (ol_idx3 > 0) {
      ol_path = ol_path.substr(0, ol_idx3 + 1);
    }
  }
}

let ol_tileerror = 0;
let ol_failover = 0;

let ol_map;
let ol_extent;
let ol_maxResolution;
let ol_resolution = 0;
let ol_center = null;
let ol_layer = null;
let ol_x;
let ol_y;

const ol_view = new ol.View({
  center: ol.proj.transform([ol_lon, ol_lat], EPSG[0], EPSG[1]),
  zoom: 100,
  minZoom: ol_minzoom,
  maxZoom: ol_maxzoom,
});

function ol_res_change_handler(e) {
  let oldView = ol_map.getView();
  if (ol_resolution == 0 || oldView.getZoom() % 1 == 0) {
    ol_resolution = oldView.getResolution();
    let width = ol_map.getSize()[0] * ol_resolution;
    let height = ol_map.getSize()[1] * ol_resolution;
    let ozoom = oldView.getZoom();
    let ol_extent2;
    if (ozoom <= 4 || ozoom > 6) {
      let of = 1;
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
      ol_extent2 = ol.proj.transformExtent(
        [
          ol_lon - ol_deltax * of,
          ol_lat - ol_deltay * of,
          ol_lon + ol_deltax * of,
          ol_lat + ol_deltay * of,
        ],
        EPSG[0],
        EPSG[1]
      );
    } else {
      ol_extent2 = ol_extent;
    }
    const newView = new ol.View({
      projection: oldView.getProjection(),
      extent: [
        ol_extent2[0] + width / 2,
        ol_extent2[1] + height / 2,
        ol_extent2[2] - width / 2,
        ol_extent2[3] - height / 2,
      ],
      resolution: ol_resolution,
      maxResolution: ol_maxResolution,
      minZoom: ol_minzoom,
      maxZoom: ol_maxzoom,
      rotation: oldView.getRotation(),
    });
    newView.setCenter(newView.constrainCenter(oldView.getCenter()));
    newView.on("change:resolution", ol_res_change_handler);
    ol_map.setView(newView);
  }
}
let ol_source = new ol.source.OSM({
  crossOrigin: null,
  url: `${ol_path.replace("/public/js", "")}${"proxy/index.php?u={u}&z={z}&x={x}&y={y}&r=osm"}${filter ? "&f=1" : ""}`,
  attributions: [
    ol.source.OSM.ATTRIBUTION,
    '&middot; <a target="_blank" href="https://dr-dsgvo.de/?karte">Lösung von Dr. DSGVO</a>',
  ],
  minZoom: ol_minzoom,
  maxZoom: ol_maxzoom,
});

const ol_tileserver = new ol.layer.Tile({
  source: ol_source,
  declutter: true,
  maxZoom: ol_maxzoom,
});

ol_source.on("tileloadend", function () {
  ol_tileerror = 0;
});
ol_source.on("tileloaderror", function () {
  ol_tileerror++;
  if (ol_tileerror > 0 && ol_failover < 50) {
    ol_failover++;
    ol_source.setUrl(
      `${ol_path.replace("/public/js", "")}${"proxy/index.php?z={z}&x={x}&y={y}&r=osm"}${filter ? "&f=1" : ""}`
    );
  }
});

function ol_initAll() {
  
  let ol_mouseWheelZoom = true;
  if (window?.screen) {
    if (
      window.screen.width * window.devicePixelRatio < 800 ||
      window.screen.width < 600
    ) {
      ol_mouseWheelZoom = false;
    }
  }
  ol_center = ol_view.getCenter();
  window.app = {};
  const ol_app = window.app;

  let ol_init_handler;
  ol_app.IC = function (e = {}) {
    const button = document.createElement("img");
    button.setAttribute(
      "src",
      "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTcwLjk1bW0iIGhlaWdodD0iMTcwLjk1bW0iIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDE3MC45NSAxNzAuOTUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6Y2M9Imh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL25zIyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogPG1ldGFkYXRhPgogIDxyZGY6UkRGPgogICA8Y2M6V29yayByZGY6YWJvdXQ9IiI+CiAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgIDxkYzp0eXBlIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiLz4KICAgIDxkYzp0aXRsZS8+CiAgIDwvY2M6V29yaz4KICA8L3JkZjpSREY+CiA8L21ldGFkYXRhPgogPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTY0Ny4yOCAtNTkuMjYyKSI+CiAgPGNpcmNsZSBjeD0iNzMyLjc1IiBjeT0iMTQ0Ljc0IiByPSI2NS43NjgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEwIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogIDxnPgogICA8Y2lyY2xlIGN4PSI3MzIuNzUiIGN5PSIxNDQuNzQiIHI9IjEwIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogICA8cmVjdCB4PSI3NjguMjMiIHk9IjE0MC4zMSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwIiByeT0iMS43NDAzIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogICA8cmVjdCB0cmFuc2Zvcm09InJvdGF0ZSg5MCkiIHg9IjE4MC4yMSIgeT0iLTczNy43NSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwIiByeT0iMS43NDAzIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogICA8cmVjdCB0cmFuc2Zvcm09InJvdGF0ZSg5MCkiIHg9IjU5LjI2MiIgeT0iLTczNy43NSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwIiByeT0iMS43NDAzIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogICA8cmVjdCB4PSI2NDcuMjgiIHk9IjE0MC4zMSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwIiByeT0iMS43NDAzIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogIDwvZz4KIDwvZz4KPC9zdmc+Cg=="
    );
    let this_ = this;
    ol_init_handler = function (e) {
      this_.getMap().getView().setCenter(ol_center);
    };

    button.addEventListener("click", ol_init_handler, false);
    button.addEventListener("touchstart", ol_init_handler, false);

    let element = document.createElement("div");
    element.className = "ol-init-btn ol-unselectable ol-control";
    element.appendChild(button);

    ol.control.Control.call(this, {
      element: element,
      target: e?.target,
    });
  };
  ol.inherits(ol_app.IC, ol.control.Control);
  ol_app.RC = function (e = {}) {
    let button = document.createElement("button");
    button.className = "ol-btn";
    let abutton = document.createElement("a");
    abutton.setAttribute("style", "color:#fff !important");
    abutton.innerHTML = "Vollbild";

    abutton.setAttribute(
      "href",
      "https://www.openstreetmap.org/?mlat=" +
        ol_lat +
        "&mlon=" +
        ol_lon +
        "#map=" +
        ol_zoom +
        "/" +
        ol_lat +
        "/" +
        ol_lon +
        "&layers=N"
    );
    abutton.setAttribute("target", "_blank");
    button.appendChild(abutton);

    let element = document.createElement("div");
    element.className = "ol-route-btn ol-unselectable ol-control";
    element.appendChild(button);

    ol.control.Control.call(this, {
      element,
      target: e?.target,
    });
  };
  ol.inherits(ol_app.RC, ol.control.Control);

  const targets = document.querySelectorAll(".ol-map");
  targets.forEach((el, index) => {
    let idx = index + 1;
    ol_map = new ol.Map({
      controls: ol.control
        .defaults({ attribution: false })
        .extend([ol_attribution])
        .extend([new ol_app.IC()])
        .extend([new ol_app.RC()]),
      interactions: ol.interaction.defaults({
        mouseWheelZoom: ol_mouseWheelZoom,
      }),
      layers: [ol_tileserver],
      target: "ol-map-" + idx,
      view: ol_view,
    });

    ol_map.on("moveend", function () {
      let zoom = ol_map.getView().getZoom();
      if (zoom > ol_zooms) {
        ol_map.getView().setZoom(ol_zooms);
      }
    });
    if (!ol_initView(ol_map)) return;
    ol_maxResolution = ol_view.getResolution();
    ol_res_change_handler();
    ol_map.getView().setZoom(ol_zoom - ol_minzoom);
    ol_init_handler();
    ol_addMarker();
  });
}

function ol_initView(map) {
  ol_extent = ol.proj.transformExtent(
    [
      ol_lon - ol_deltax,
      ol_lat - ol_deltay,
      ol_lon + ol_deltax,
      ol_lat + ol_deltay,
    ],
    EPSG[0],
    EPSG[1]
  );
  let size = map.getSize();
  if (!size || size == undefined) return false;
  let width = ol.extent.getWidth(ol_extent);
  let height = ol.extent.getHeight(ol_extent);
  if (size[0] / size[1] > width / height) {
    ol_view.fit(
      [
        ol_extent[0],
        (ol_extent[1] + ol_extent[3]) / 2,
        ol_extent[2],
        (ol_extent[1] + ol_extent[3]) / 2,
      ],
      { constrainResolution: true }
    );
  } else {
    ol_view.fit(
      [
        (ol_extent[0] + ol_extent[2]) / 2,
        ol_extent[1],
        (ol_extent[0] + ol_extent[2]) / 2,
        ol_extent[3],
      ],
      { constrainResolution: true }
    );
  }
  return true;
}
function ol_addMarker(center1) {
  if (!center1 || center1 == null || center1 == undefined) {
    let center = ol.proj.transform(
      ol_map.getView().getCenter(),
      EPSG[1],
      EPSG[0]
    );
    ol_x = center[0];
    ol_y = center[1];
  } else {
    let center = ol.proj.transform(center1, EPSG[1], EPSG[0]);
    ol_x = center[0];
    ol_y = center[1];
  }
  ol_layer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [
        new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat([ol_x, ol_y])),
        }),
      ],
    }),
    style: new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        src: ol_path + "marker.png",
      }),
    }),
  });

  ol_map.addLayer(ol_layer);
}

function ol_addMarker2(coord_x, coord_y) {
  let ol_layer2 = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [
        new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat([coord_x, coord_y])),
        }),
      ],
    }),
    style: new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        src: ol_path + "marker.png",
      }),
    }),
  });

  ol_map.addLayer(ol_layer2);
}

function ol_docReady(fn) {
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
ol_docReady(() => ol_initAll());
