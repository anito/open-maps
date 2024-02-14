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

    const { group, add, remove } = OpenStreetAdminParams.get_elements(key);

    $(remove).on("click", function (e) {
      e.preventDefault();
			$(group).remove();
    });

    $(add).on("click", function (e) {
      e.preventDefault();

      const newGroup = $("#open-maps-coords-group-template")
        .clone()
        .removeClass("template")
        .attr("id", `open-maps-coords-group-${++key}`);

			const containerEl = $(this).parents(".group").parent();
      $(newGroup).appendTo(containerEl);

      OpenStreetAdminParams.sanitize_fields(newGroup);
      OpenStreetAdminParams.open_maps_init(key);
    });
  }

  function get_elements(key) {
    const group = $(`#open-maps-coords-group-${key}`);
    return {
      group,
      add: $(".action-add", group),
      remove: $(".action-remove", group),
    };
  }

  function sanitize_fields(group) {
    const inputs = $("input", group);
		const aId = $(group).attr("id");
		const regex = /\d{1,}/g;
		const index = aId.search(regex);
		const id = aId.substr(index);
    $(inputs).each((i, el) => {
      $(el).attr("name", $(el).attr('name').replace('[template]', `[${id}]`));
    });
  }

  OpenStreetAdminParams = {
    ...OpenStreetAdminParams,
    open_maps_init,
    get_elements,
    sanitize_fields,
  };
})(jQuery);
