<div id="<?php echo $args['id']; ?>" class="<?php echo implode(' ', $args['classes']); ?>">
  <input type="<?php echo $args['subtype'][0]; ?>" <?php echo $key != 0 ? 'required' : ''; ?> placeholder="<?php echo $args['placeholder'][0]; ?>" name="<?php echo  $args['name']; ?>[<?php echo $key; ?>][lat]" size="20" value="<?php echo esc_attr($val['lat']); ?>" />
  <input type="<?php echo $args['subtype'][1]; ?>" <?php echo $key != 0 ? 'required' : ''; ?> placeholder="<?php echo $args['placeholder'][1]; ?>" name="<?php echo  $args['name']; ?>[<?php echo $key; ?>][lon]" size="20" value="<?php echo esc_attr($val['lon']); ?>" />
  <input type="<?php echo $args['subtype'][2]; ?>" placeholder="<?php echo $args['placeholder'][2]; ?>" name="<?php echo  $args['name']; ?>[<?php echo $key; ?>][lab]" size="20" value="<?php echo esc_attr($val['lab']); ?>" />

  <a href="." class="button button-primary action-remove">
    <i class="dashicons dashicons-trash" style="font-size: 1.3em; vertical-align: middle"></i>
  </a>
  <a class="button button-primary action-add" style="min-width: 40px; text-align: center;">+</a>

  <script>
    (($) => {

      const key = parseInt('<?php echo $key; ?>');
      OpenStreetAdminParams.open_maps_init(key);

    })(jQuery)
  </script>
</div>