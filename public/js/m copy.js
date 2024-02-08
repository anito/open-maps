const { latitude, longitude, ini_zoom, min_zoom, max_zoom, filter } = OpenStreetParams;
const wbp_lat = parseFloat(latitude);
const wbp_long = parseFloat(longitude);
const drdsgvo_script = document.currentScript;
const drdsgvo_script_url = drdsgvo_script.src;
const drdsgvo_root = document.location.hostname;
const EPSG = [
  "EPSG:4326",
  "EPSG:3857"
]

let drdsgvo_path;
let drdsgvo_idx1 = (" " + drdsgvo_script_url).indexOf(drdsgvo_root);
if (drdsgvo_idx1 > 0) {
  drdsgvo_idx1--;
  drdsgvo_idx1 += drdsgvo_root.length;
  let drdsgvo_idx2 = drdsgvo_script_url.indexOf("/", drdsgvo_idx1);
  if (drdsgvo_idx2 > 0) {
    drdsgvo_path = drdsgvo_script_url.substr(drdsgvo_idx2);
    let drdsgvo_idx3 = drdsgvo_path.lastIndexOf("/");
    if (drdsgvo_idx3 > 0) {
      drdsgvo_path = drdsgvo_path.substr(0, drdsgvo_idx3 + 1);
    }
  }
}

let drdsgvo_center_x = null;
let drdsgvo_center_y = null;
let drdsgvo_zoom = null;

let drdsgvo_minzoom = min_zoom;
let drdsgvo_maxzoom = max_zoom;

let drdsgvo_zooms = drdsgvo_maxzoom - drdsgvo_minzoom;
let drdsgv_attribution = new ol_dsgvo.control.Attribution({
  collapsible: false,
});

let drdsgvo_tileerror = 0;
let drdsgvo_failover = 0;
let drdsgvo_view;

let drdsgvo_map;
let drdsgvo_deltax = 0.7;
let drdsgvo_deltay = 0.3;
let drdsgvo_extent;
let drdsgvo_maxResolution;
let drdsgvo_resolution = 0;
let drdsgvo_center = null;
let drdsgvo_layer = null;
let drdsgvo_x;
let drdsgvo_y;

function drdsgvo_resChange() {
  let oldView = drdsgvo_map.getView();
  if (drdsgvo_resolution == 0 || oldView.getZoom() % 1 == 0) {
    drdsgvo_resolution = oldView.getResolution();
    let width = drdsgvo_map.getSize()[0] * drdsgvo_resolution;
    let height = drdsgvo_map.getSize()[1] * drdsgvo_resolution;
    let ozoom = oldView.getZoom();
    let drdsgvo_extent2;
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
    const newView = new ol_dsgvo.View({
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
let drdsgvo_source = new ol_dsgvo.source.OSM({
  crossOrigin: null,
  url: `${drdsgvo_path.replace('/public/js', '')}${'proxy/index.php?z={z}&x={x}&y={y}&r=osm'}${filter ? '&f=1' : ''}`,
  attributions: [
    ol_dsgvo.source.OSM.ATTRIBUTION,
    ' &middot; <a target="_blank" href="https://dr-dsgvo.de/?karte">Lösung von Dr. DSGVO</a>',
  ],
  minZoom: drdsgvo_minzoom,
  maxZoom: drdsgvo_maxzoom,
});

let drdsgv_tileserver = new ol_dsgvo.layer.Tile({
  source: drdsgvo_source,
  declutter: true,
  maxZoom: drdsgvo_maxzoom,
});

drdsgvo_source.on("tileloadend", function () {
  drdsgvo_tileerror = 0;
});
drdsgvo_source.on("tileloaderror", function () {
  drdsgvo_tileerror++;
  if (drdsgvo_tileerror > 0 && drdsgvo_failover < 50) {
    drdsgvo_failover++;
    drdsgvo_source.setUrl(
      `${drdsgvo_path.replace('/public/js', '')}${'proxy/index.php?z={z}&x={x}&y={y}&r=osm'}`
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
    zoom: ini_zoom,
    minZoom: drdsgvo_minzoom,
    maxZoom: drdsgvo_maxzoom,
  });
  let drdsgvo_mouseWheelZoom = true;
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
  let drdsgvo_app = window.app;
  let handledrdsgvo_Init = null;
  drdsgvo_app.drdsgvo_IC = function (opt_options) {
    let options = opt_options || {};
    let button = document.createElement("img");
    button.setAttribute("style", "max-width:16px;cursor:pointer");
    button.setAttribute(
      "src",
      "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTcwLjk1bW0iIGhlaWdodD0iMTcwLjk1bW0iIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDE3MC45NSAxNzAuOTUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6Y2M9Imh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL25zIyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogPG1ldGFkYXRhPgogIDxyZGY6UkRGPgogICA8Y2M6V29yayByZGY6YWJvdXQ9IiI+CiAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgIDxkYzp0eXBlIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiLz4KICAgIDxkYzp0aXRsZS8+CiAgIDwvY2M6V29yaz4KICA8L3JkZjpSREY+CiA8L21ldGFkYXRhPgogPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTY0Ny4yOCAtNTkuMjYyKSI+CiAgPGNpcmNsZSBjeD0iNzMyLjc1IiBjeT0iMTQ0Ljc0IiByPSI2NS43NjgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEwIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogIDxnPgogICA8Y2lyY2xlIGN4PSI3MzIuNzUiIGN5PSIxNDQuNzQiIHI9IjEwIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogICA8cmVjdCB4PSI3NjguMjMiIHk9IjE0MC4zMSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwIiByeT0iMS43NDAzIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogICA8cmVjdCB0cmFuc2Zvcm09InJvdGF0ZSg5MCkiIHg9IjE4MC4yMSIgeT0iLTczNy43NSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwIiByeT0iMS43NDAzIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogICA8cmVjdCB0cmFuc2Zvcm09InJvdGF0ZSg5MCkiIHg9IjU5LjI2MiIgeT0iLTczNy43NSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwIiByeT0iMS43NDAzIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogICA8cmVjdCB4PSI2NDcuMjgiIHk9IjE0MC4zMSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwIiByeT0iMS43NDAzIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogIDwvZz4KIDwvZz4KPC9zdmc+Cg=="
    );
    let this_ = this;
    handledrdsgvo_Init = function (e) {
      this_.getMap().getView().setCenter(drdsgvo_center);
    };

    button.addEventListener("click", handledrdsgvo_Init, false);
    button.addEventListener("touchstart", handledrdsgvo_Init, false);

    let element = document.createElement("div");
    element.className = "drdsgvo_initbtn ol-unselectable ol-control";
    element.appendChild(button);

    ol_dsgvo.control.Control.call(this, {
      element: element,
      target: options.target,
    });
  };
  ol_dsgvo.inherits(drdsgvo_app.drdsgvo_IC, ol_dsgvo.control.Control);
  drdsgvo_app.drdsgvo_RC = function (opt_options) {
    let options = opt_options || {};
    let button = document.createElement("button");
    button.className = "drdsgvo_btn";
    let abutton = document.createElement("a");
    abutton.setAttribute("style", "color:#fff !important");
    abutton.innerHTML = "Vollbild";

    abutton.setAttribute(
      "href",
      "https://www.openstreetmap.org/?mlat=" +
        wbp_lat +
        "&mlon=" +
        wbp_long +
        "#map=" +  ini_zoom + "/" +
        wbp_lat +
        "/" +
        wbp_long +
        "&layers=N"
    );
    abutton.setAttribute("target", "_blank");
    button.appendChild(abutton);

    let element = document.createElement("div");
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
      let zoom = drdsgvo_map.getView().getZoom();
      if (zoom > drdsgvo_zooms) {
        drdsgvo_map.getView().setZoom(drdsgvo_zooms);
      }
    });
    if (!drdsgvo_initView(drdsgvo_map)) return;
    drdsgvo_maxResolution = drdsgvo_view.getResolution();
    drdsgvo_resChange();
    drdsgvo_map.getView().setZoom(ini_zoom - drdsgvo_minzoom);
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
  let size = map.getSize();
  if (!size || size == undefined) return false;
  let width = ol_dsgvo.extent.getWidth(drdsgvo_extent);
  let height = ol_dsgvo.extent.getHeight(drdsgvo_extent);
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
    let center = ol_dsgvo.proj.transform(
      drdsgvo_map.getView().getCenter(),
      "EPSG:3857",
      "EPSG:4326"
    );
    drdsgvo_x = center[0];
    drdsgvo_y = center[1];
  } else {
    let center = ol_dsgvo.proj.transform(center1, "EPSG:3857", "EPSG:4326");
    drdsgvo_x = center[0];
    drdsgvo_y = center[1];
  }
  drdsgvo_layer = new ol_dsgvo.layer.Vector({
    source: new ol_dsgvo.source.Vector({
      features: [
        new ol_dsgvo.Feature({
          geometry: new ol_dsgvo.geom.Point(
            ol_dsgvo.proj.fromLonLat([drdsgvo_x, drdsgvo_y])
          ),
        }),
      ],
    }),
    style: new ol_dsgvo.style.Style({
      image: new ol_dsgvo.style.Icon({
        anchor: [0.5, 1],
        src: drdsgvo_path + "marker.png",
      }),
    }),
  });

  drdsgvo_map.addLayer(drdsgvo_layer);
}

function drdsgvo_addMarker2(coord_x, coord_y) {
  let drdsgvo_layer2 = new ol_dsgvo.layer.Vector({
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
        src: drdsgvo_path + "marker.png",
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