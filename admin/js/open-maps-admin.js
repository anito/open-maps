(function ($) {
  "use strict";

  /**
   * All of the code for your admin-facing JavaScript source
   * should reside in this file.
   *
   * Note: It has been assumed you will write jQuery code here, so the
   * $ function reference has been prepared for usage within the scope
   * of this function.
   *
   * This enables you to define handlers, for when the DOM is ready:
   *
   * $(function() {
   *
   * });
   *
   * When the window is loaded:
   *
   * $( window ).load(function() {
   *
   * });
   *
   * ...and/or other possibilities.
   *
   * Ideally, it is not considered best practise to attach more than a
   * single DOM-ready or window-load handler for a particular page.
   * Although scripts in the WordPress core, Plugins and Themes may be
   * practising this, we should strive to set a better example in our own work.
   */

  function open_maps_init(key) {
    if (isNaN(key)) return;

    const { groupEl, addEl, dupEl, remEl } =
      OpenStreetAdminParams.get_elements(key);

    $(remEl).on("click", function (e) {
      e.preventDefault();
      $(groupEl).remove();
    });

    $(addEl).on("click", add.bind(this, false));

    $(dupEl).on("click", add.bind(this, true));
  }

  function get_elements(key) {
    const groupEl = $(`#open-maps-coords-group-${key}`);
    return {
      groupEl,
      addEl: $(".action-add", groupEl),
      dupEl: $(".action-duplicate", groupEl),
      remEl: $(".action-remove", groupEl),
    };
  }

  const add = function (dup, e) {
    e.preventDefault();

    const el = e.target;
    const containerEl = $(el).parents(".group").parent();
    const key = containerEl.children().length + 1;
    const curGroup = $(el).parents(".group")[0];

    const newGroup = $("#open-maps-coords-group-template")
      .clone()
      .removeClass("template")
      .attr("id", `open-maps-coords-group-${key}`);

    if (dup) {
      $("input", curGroup).val((idx, val) => {
        $(`input:nth-child(${idx + 1})`, newGroup).val(val);
        return val;
      });
			$("input[type=hidden]", newGroup).val(key);
    }

    $(newGroup).appendTo(containerEl);

    OpenStreetAdminParams.sanitize_fields(newGroup);
    OpenStreetAdminParams.open_maps_init(key);
  };

  function sanitize_fields(group) {
    const inputs = $("input", group);
    const aId = $(group).attr("id");
    const regex = /\d{1,}/g;
    const index = aId.search(regex);
    const id = aId.substr(index);
    $(inputs).each((i, el) => {
      $(el).attr("name", $(el).attr("name").replace("[template]", `[${id}]`));
    });
  }

  OpenStreetAdminParams = {
    ...OpenStreetAdminParams,
    open_maps_init,
    get_elements,
    sanitize_fields,
  };
})(jQuery);
