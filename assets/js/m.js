const { coords, ini_zoom, min_zoom, max_zoom, filter } = OpenStreetParams;

const maps = new Map();
const ol_minzoom = parseInt(min_zoom); // 9
const ol_maxzoom = parseInt(max_zoom); // 18
const ol_zooms = ol_maxzoom - ol_minzoom;
const ol_lat = parseFloat(coords[0].lat);
const ol_lon = parseFloat(coords[0].lon);
const EPSG = ["EPSG:4326", "EPSG:3857"];
const ol_path = (() => {
  const url = document.currentScript.src;
  const regex = /\/(.*)\//;
  const pathname = new URL(url).pathname;
  const matches = pathname.match(regex);
  return matches.length && matches[0];
})();
const ol_features = (() => {
  return coords.map((coord) => {
    const { lat, lon, lab: name } = coord;
    return new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat])),
      name,
    });
  });
})();
const ol_ordered = (() => {
  const lats = coords
    .map((coord) => parseFloat(coord.lat))
    .sort((a, b) => (parseFloat(a) > parseFloat(b) ? 1 : -1));
  const lons = coords
    .map((coord) => parseFloat(coord.lon))
    .sort((a, b) => (parseFloat(a) > parseFloat(b) ? 1 : -1));

  return [lons[0], lats[0], lons[lons.length - 1], lats[lats.length - 1]];
})();

let ol_deltax = 0.7;
let ol_deltay = 0.3;
let ol_tileerror = 0;
let ol_failover = 0;
let ol_zoom;
let ol_view;
let off = 1;
let ol_center;
let ol_extent;

const ol_source = new ol.source.OSM({
  crossOrigin: null,
  url: `${ol_path.replace(
    "/assets/js",
    ""
  )}${"proxy/index.php?z={z}&x={x}&y={y}&r=osm"}${filter ? "&f=1" : ""}`,
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
      `${ol_path.replace(
        "/assets/js",
        ""
      )}${"proxy/index.php?z={z}&x={x}&y={y}&r=osm"}${filter ? "&f=1" : ""}`
    );
  }
});

function ol_initView() {
  var off = 1;
  ol_extent = ol.proj.transformExtent(
    [
      ol_ordered[0] - ol_deltax * off,
      ol_ordered[1] - ol_deltay * off,
      ol_ordered[2] + ol_deltax * off,
      ol_ordered[3] + ol_deltay * off,
    ],
    EPSG[0],
    EPSG[1]
  );

  ol_center = [
    (ol_extent[2] + ol_deltax * off + (ol_extent[0] - ol_deltax * off)) / 2,
    (ol_extent[3] + ol_deltay * off + (ol_extent[1] - ol_deltay * off)) / 2,
  ];
}

function ol_addMarker(map) {
  const layer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: ol_features,
    }),
    style: new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        src: ol_path + "marker.png",
      }),
    }),
  });

  map.addLayer(layer);
}

function ol_getPath() {
  const url = document.currentScript.src;
  const regex = /\/(.*)\//;
  const pathname = new URL(url).pathname;
  const matches = pathname.match(regex);
  return matches.length && matches[0];
}

function ol_initAll() {
  ol_initView();

  const off_y = ol_ordered[3] - ol_ordered[1];
  if (off_y <= 1) {
    ol_deltay = 0.05;
  } else if (off_y <= 2) {
    ol_deltay = 0.1;
  } else if (off_y <= 6) {
    ol_deltay = 0.2;
  } else if (off_y <= 10) {
    ol_deltay = 0.3;
  } else if (off_y <= 18) {
    ol_deltay = 0.5;
  } else {
    ol_deltay = 1.9;
  }

  let ol_mouseWheelZoom = true;
  if (window && window.screen) {
    if (
      window.screen.width * window.devicePixelRatio < 800 ||
      window.screen.width < 600
    ) {
      ol_mouseWheelZoom = false;
    }
  }

  window.app = {};
  const ol_app = window.app;

  // Centerpoint of all bounding box positions
  ol_app.IC = function (e = {}) {
    const button = document.createElement("img");
    button.setAttribute(
      "src",
      "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTcwLjk1bW0iIGhlaWdodD0iMTcwLjk1bW0iIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDE3MC45NSAxNzAuOTUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6Y2M9Imh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL25zIyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogPG1ldGFkYXRhPgogIDxyZGY6UkRGPgogICA8Y2M6V29yayByZGY6YWJvdXQ9IiI+CiAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgIDxkYzp0eXBlIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiLz4KICAgIDxkYzp0aXRsZS8+CiAgIDwvY2M6V29yaz4KICA8L3JkZjpSREY+CiA8L21ldGFkYXRhPgogPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTY0Ny4yOCAtNTkuMjYyKSI+CiAgPGNpcmNsZSBjeD0iNzMyLjc1IiBjeT0iMTQ0Ljc0IiByPSI2NS43NjgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEwIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogIDxnPgogICA8Y2lyY2xlIGN4PSI3MzIuNzUiIGN5PSIxNDQuNzQiIHI9IjEwIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogICA8cmVjdCB4PSI3NjguMjMiIHk9IjE0MC4zMSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwIiByeT0iMS43NDAzIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogICA8cmVjdCB0cmFuc2Zvcm09InJvdGF0ZSg5MCkiIHg9IjE4MC4yMSIgeT0iLTczNy43NSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwIiByeT0iMS43NDAzIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogICA8cmVjdCB0cmFuc2Zvcm09InJvdGF0ZSg5MCkiIHg9IjU5LjI2MiIgeT0iLTczNy43NSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwIiByeT0iMS43NDAzIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogICA8cmVjdCB4PSI2NDcuMjgiIHk9IjE0MC4zMSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwIiByeT0iMS43NDAzIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogIDwvZz4KIDwvZz4KPC9zdmc+Cg=="
    );
    const this_ = this;
    const handledrdsgvo_Init = function (e) {
      this_.getMap().getView().setCenter(ol_center);
    };

    button.addEventListener("click", handledrdsgvo_Init, false);
    button.addEventListener("touchstart", handledrdsgvo_Init, false);

    const element = document.createElement("div");
    element.className = "ol-init-btn ol-unselectable ol-control";
    element.appendChild(button);

    ol.control.Control.call(this, {
      element: element,
      target: e?.target,
    });
  };
  ol.inherits(ol_app.IC, ol.control.Control);

  ol_app.RC = function (e = {}) {
    const button = document.createElement("button");
    button.className = "ol-btn";
    const abutton = document.createElement("a");
    abutton.setAttribute("style", "color:#fff !important");
    abutton.innerHTML = "Vollbild";

    abutton.setAttribute(
      "href",
      "https://www.openstreetmap.org/?mlat=" +
        ol_lat +
        "&mlon=" +
        ol_lon +
        "#map=" +
        14 +
        "/" +
        ol_lat +
        "/" +
        ol_lon +
        "&layers=N"
    );
    abutton.setAttribute("target", "_blank");
    button.appendChild(abutton);

    const element = document.createElement("div");
    element.className = "ol-route-btn ol-unselectable ol-control";
    element.appendChild(button);

    ol.control.Control.call(this, {
      element,
      target: e?.target,
    });
  };
  ol.inherits(ol_app.RC, ol.control.Control);

  ol_app.RM = function (e = {}) {
    const button = document.createElement("button");
    button.className = "ol-btn";
    const abutton = document.createElement("a");
    abutton.setAttribute("style", "color:#fff !important");
    abutton.innerHTML = "Routenplaner";

    abutton.setAttribute(
      "href",
      "https://map.project-osrm.org/?z=14&center=" +
        ol_lat +
        "," +
        ol_lon +
        "&loc=" +
        ol_lat +
        "," +
        ol_lon +
        "&hl=de" +
        "&alt=0" +
        "&srv=0"
    );
    abutton.setAttribute("target", "_blank");
    button.appendChild(abutton);

    const element = document.createElement("div");
    element.className = "ol-routeplanner-btn ol-unselectable ol-control";
    element.appendChild(button);

    ol.control.Control.call(this, {
      element,
      target: e?.target,
    });
  };
  ol.inherits(ol_app.RM, ol.control.Control);

  const labelStyle = new ol.style.Style({
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
  const iconStyle = new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 46],
      anchorXUnits: "fraction",
      anchorYUnits: "pixels",
      src: ol_path + "marker.png",
      scale: 0.1,
    }),
  });
  const style = [iconStyle, labelStyle];

  const targets = document.querySelectorAll(".ol-map");
  targets.forEach((el) => {
    const id = el.dataset.id;

    const ol_view = new ol.View({
      minZoom: ol_minzoom,
      maxZoom: ol_maxzoom,
    });

    const map = new ol.Map({
      controls: ol.control
        .defaults({ attribution: false })
        .extend([new ol.control.Attribution({ collapsible: false })])
        .extend([new ol_app.IC()])
        .extend([new ol_app.RC()])
        .extend([new ol_app.RM()]),
      interactions: ol.interaction.defaults({
        mouseWheelZoom: ol_mouseWheelZoom,
      }),
      layers: [
        ol_tileserver,
        new ol.layer.Vector({
          source: new ol.source.Vector({
            features: ol_features,
          }),
          style: function (feature) {
            labelStyle.getText().setText(feature.get("name"));
            return style;
          },
        }),
      ],
      target: "ol-map-" + id,
      view: ol_view,
    });
    maps.set(id, { map });

    if ("zoom" in el.dataset) {
      ol_zoom = parseInt(el.dataset.zoom);
    }

    console.log(id, ol_zoom);

    map.on("moveend", function () {
      const zoom = map.getView().getZoom();
      if (zoom > ol_zooms) {
        // map.getView().setZoom(ol_zooms);
      }
    });

    ol_initView();
    ol_addMarker(map);

    const size = map.getSize();
    ol_view.setCenter(ol_center);
    ol_view.fit(ol_extent, size, { constrainResolution: true });
    ol_view.setZoom(ol_zoom);
  });
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
