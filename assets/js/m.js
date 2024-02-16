((params) => {
  const { coords, min_zoom, max_zoom, filter } = params;

  const maps = new Map();
  const minZoom = parseInt(min_zoom);
  const maxZoom = parseInt(max_zoom);
  const lat = parseFloat(coords[0].lat);
  const lon = parseFloat(coords[0].lon);
  const EPSG = ["EPSG:4326", "EPSG:3857"];
  const path = (() => {
    const url = document.currentScript.src;
    const pathname = new URL(url).pathname;
    const matches = pathname.match(/\/(.*)\//);
    return matches.length && matches[0];
  })();
  const filterCoords = (id) => {
    const points = maps.get(id).points || [];
    let c = coords.slice();
    if (points.length) {
      c = coords.filter((coord) => -1 != points.indexOf(coord["index"]));
    }
    return c;
  };
  const createFeatures = (id) => {
    let coords = filterCoords(id);

    return coords.map((coord) => {
      const { lat, lon, lab } = coord;
      const name = lab.split(/\\n/).reduce((a, b) => `${a}\n${b}`);
      return new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat])),
        name
      });
    });
  };
  const getOrdered = (id) => {
    const coords = filterCoords(id);

    const lats = coords
      .map((coord) => parseFloat(coord.lat))
      .sort((a, b) => (parseFloat(a) > parseFloat(b) ? 1 : -1));
    const lons = coords
      .map((coord) => parseFloat(coord.lon))
      .sort((a, b) => (parseFloat(a) > parseFloat(b) ? 1 : -1));

    return [lons[0], lats[0], lons[lons.length - 1], lats[lats.length - 1]];
  };
  const updateMap = (id, value) => {
    let m;
    if (!maps.has(id)) {
      maps.set(id, {});
    }
    m = maps.get(id);

    maps.set(id, { ...m, ...value });
    return maps.get(id);
  };

  let deltax = 0.7;
  let deltay = 0.3;
  let tileerror = 0;
  let failover = 0;
  let zoom;

  const source = new ol.source.OSM({
    crossOrigin: null,
    url: `${path.replace(
      "/assets/js",
      ""
    )}${"proxy/index.php?z={z}&x={x}&y={y}&r=osm"}${filter ? "&f=1" : ""}`,
    attributions: [
      ol.source.OSM.ATTRIBUTION,
      '&middot; <a target="_blank" href="https://dr-dsgvo.de/?karte">Lösung von Dr. DSGVO</a>',
    ],
    minZoom,
    maxZoom,
  });
  const tileserver = new ol.layer.Tile({
    source,
    maxZoom,
    declutter: true,
  });

  source.on("tileloadend", function () {
    tileerror = 0;
  });
  source.on("tileloaderror", function () {
    tileerror++;
    if (tileerror > 0 && failover < 50) {
      failover++;
      source.setUrl(
        `${path.replace(
          "/assets/js",
          ""
        )}${"proxy/index.php?z={z}&x={x}&y={y}&r=osm"}${filter ? "&f=1" : ""}`
      );
    }
  });
  const initView = (id) => {
    const ordered = getOrdered(id);

    const off_y = ordered[3] - ordered[1];
    if (off_y <= 1) {
      deltay = 0.05;
    } else if (off_y <= 2) {
      deltay = 0.1;
    } else if (off_y <= 6) {
      deltay = 0.2;
    } else if (off_y <= 10) {
      deltay = 0.3;
    } else if (off_y <= 18) {
      deltay = 0.5;
    } else {
      deltay = 1.9;
    }

    const off = 1;
    const extent = ol.proj.transformExtent(
      [
        ordered[0] - deltax * off,
        ordered[1] - deltay * off,
        ordered[2] + deltax * off,
        ordered[3] + deltay * off,
      ],
      EPSG[0],
      EPSG[1]
    );

    // Centerpoint of all the bounding box positions
    const center = [
      (extent[2] + deltax * off + (extent[0] - deltax * off)) / 2,
      (extent[3] + deltay * off + (extent[1] - deltay * off)) / 2,
    ];
    return updateMap(id, { extent, center });
  };

  const addMarker = (id) => {
    const { map, features } = maps.get(id);
    const layer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features,
      }),
      style: new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 1],
          src: path + "marker.png",
        }),
      }),
    });

    map.addLayer(layer);
  };

  function init() {
    let mouseWheelZoom = true;
    if (window && window.screen) {
      if (
        window.screen.width * window.devicePixelRatio < 800 ||
        window.screen.width < 600
      ) {
        mouseWheelZoom = false;
      }
    }

    window.app = {};
    const app = window.app;

    app.IC = function (e = {}) {
      const button = document.createElement("img");
      button.setAttribute(
        "src",
        "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTcwLjk1bW0iIGhlaWdodD0iMTcwLjk1bW0iIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDE3MC45NSAxNzAuOTUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6Y2M9Imh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL25zIyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogPG1ldGFkYXRhPgogIDxyZGY6UkRGPgogICA8Y2M6V29yayByZGY6YWJvdXQ9IiI+CiAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgIDxkYzp0eXBlIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiLz4KICAgIDxkYzp0aXRsZS8+CiAgIDwvY2M6V29yaz4KICA8L3JkZjpSREY+CiA8L21ldGFkYXRhPgogPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTY0Ny4yOCAtNTkuMjYyKSI+CiAgPGNpcmNsZSBjeD0iNzMyLjc1IiBjeT0iMTQ0Ljc0IiByPSI2NS43NjgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEwIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogIDxnPgogICA8Y2lyY2xlIGN4PSI3MzIuNzUiIGN5PSIxNDQuNzQiIHI9IjEwIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogICA8cmVjdCB4PSI3NjguMjMiIHk9IjE0MC4zMSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwIiByeT0iMS43NDAzIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogICA8cmVjdCB0cmFuc2Zvcm09InJvdGF0ZSg5MCkiIHg9IjE4MC4yMSIgeT0iLTczNy43NSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwIiByeT0iMS43NDAzIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogICA8cmVjdCB0cmFuc2Zvcm09InJvdGF0ZSg5MCkiIHg9IjU5LjI2MiIgeT0iLTczNy43NSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwIiByeT0iMS43NDAzIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogICA8cmVjdCB4PSI2NDcuMjgiIHk9IjE0MC4zMSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwIiByeT0iMS43NDAzIiBzdHlsZT0icGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIvPgogIDwvZz4KIDwvZz4KPC9zdmc+Cg=="
      );
      const this_ = this;
      const clickHandler = function (e) {
        const id = e.target.closest(".ol-map").dataset.id;
        const center = maps.get(id).center;
        this_.getMap().getView().setCenter(center);
      };

      button.addEventListener("click", clickHandler, false);
      button.addEventListener("touchstart", clickHandler, false);

      const element = document.createElement("div");
      element.className = "ol-init-btn ol-unselectable ol-control";
      element.appendChild(button);

      ol.control.Control.call(this, {
        element,
        target: e?.target,
      });
    };
    ol.inherits(app.IC, ol.control.Control);

    app.RC = function (e = {}) {
      const button = document.createElement("button");
      button.className = "ol-btn";
      const abutton = document.createElement("a");
      abutton.setAttribute("style", "color:#fff !important");
      abutton.innerHTML = "Vollbild";

      abutton.setAttribute(
        "href",
        "https://www.openstreetmap.org/?mlat=" +
          lat +
          "&mlon=" +
          lon +
          "#map=" +
          14 +
          "/" +
          lat +
          "/" +
          lon +
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
    ol.inherits(app.RC, ol.control.Control);

    app.RM = function (e = {}) {
      const button = document.createElement("button");
      button.className = "ol-btn";
      const abutton = document.createElement("a");
      abutton.setAttribute("style", "color:#fff !important");
      abutton.innerHTML = "Routenplaner";

      abutton.setAttribute(
        "href",
        "https://map.project-osrm.org/?z=14&center=" +
          lat +
          "," +
          lon +
          "&loc=" +
          lat +
          "," +
          lon +
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
    ol.inherits(app.RM, ol.control.Control);

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
        src: path + "marker.png",
        scale: 0.1,
      }),
    });
    const style = [iconStyle, labelStyle];

    const targets = document.querySelectorAll(".ol-map");
    targets.forEach((el) => {
      const id = el.dataset.id;

      if ("zoom" in el.dataset) {
        zoom = parseFloat(el.dataset.zoom);
      }
      let points = [];
      if ("points" in el.dataset) {
        const getPoints = () => {
          return el.dataset.points
            .trim()
            .split(",")
            .map((p) => parseInt(p));
        };
        points = getPoints();
      }

      updateMap(id, { points });
      const features = createFeatures(id);
      updateMap(id, { features });

      const view = new ol.View({
        minZoom,
        maxZoom,
      });

      const map = new ol.Map({
        controls: ol.control
          .defaults({ attribution: false })
          .extend([new ol.control.Attribution({ collapsible: false })])
          .extend([new app.IC()])
          .extend([new app.RC()])
          .extend([new app.RM()]),
        interactions: ol.interaction.defaults({
          mouseWheelZoom,
        }),
        layers: [
          tileserver,
          new ol.layer.Vector({
            source: new ol.source.Vector({
              features,
            }),
            style: function (feature) {
              labelStyle.getText().setText(feature.get("name"));
              return style;
            },
          }),
        ],
        target: "ol-map-" + id,
        view,
      });
      updateMap(id, { map });
      addMarker(id);

      map.on("moveend", function () {});

      const { extent, center } = initView(id);

      view.setCenter(center);
      view.fit(extent, map.getSize(), { constrainResolution: true });
      view.setZoom(zoom);
    });
  }

  function docReady(fn) {
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      setTimeout(fn, 1);
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  docReady(() => init());
})(OpenStreetParams);
