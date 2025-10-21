<?php
/*
Plugin Name: Wellness App
Plugin URI: https://yourdomain.com
Description: Wellness dashboard and goal manager built by Tony Medina.
Version: 1.0
Author: Tony Medina
*/

if ( ! defined( 'ABSPATH' ) ) exit;

// Add item to WP sidebar menu
function wellness_app_menu() {
    add_menu_page(
        'Wellness App',
        'Wellness App',
        'read',
        'wellness-app',
        'wellness_app_display',
        'dashicons-heart',
        6
    );
}
add_action('admin_menu', 'wellness_app_menu');

// Display app inside an iframe
function wellness_app_display() {
    $plugin_dir = plugin_dir_url( __FILE__ );
    echo '<iframe src="' . $plugin_dir . 'index.html" style="width:100%; height:90vh; border:none;"></iframe>';
}

// Optional shortcode [wellness_app]
function wellness_app_shortcode() {
    $plugin_dir = plugin_dir_url( __FILE__ );
    return '<iframe src="' . $plugin_dir . 'index.html" style="width:100%; height:100vh; border:none;"></iframe>';
}
add_shortcode('wellness_app', 'wellness_app_shortcode');
