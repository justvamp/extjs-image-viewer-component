<!DOCTYPE html>
<html>
	<head>
		<title></title>

        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <!-- ** CSS ** -->
        <!-- base library -->
        <!--link rel="stylesheet" type="text/css" href="../ext-sources/resources/css/ext-all.css" /-->
		<link href="imageviewer.css" rel="stylesheet" />

        <!-- overrides to base library -->

        <!-- ** Javascript ** -->
        <!-- ExtJS library: base/adapter -->
        <script src="ext-sources/adapter/ext/ext-base.js"></script>
        <!-- ExtJS library: all widgets -->
        <script src="ext-sources/ext-all.js"></script>

        <!-- overrides to library -->

        <!-- extensions -->
		<script src="imageviewer.js"></script>

        <!-- page specific -->

		<style type="text/css">
			body {
				background-color: black;
				color: white;
				text-align: center;
			}
			img.thumb {
				border: 5px solid #ddd;
				margin: 3px;
			}
		</style>

        <script type="text/javascript">
			// Path to the blank image should point to a valid location on your server
			Ext.BLANK_IMAGE_URL = 'ext-sources/resources/images/default/s.gif';

			Ext.onReady(function() {
				Ext.ux.imageViewer.register('#imagebox', true);
				
				Ext.ux.imageViewer.slideshowDelay = 5000;
				Ext.ux.imageViewer.isAnimationEnabled = false;
				
			});
		</script>
	</head>
	<body>
		<div id="imagebox">
			<?php include_once 'getimages.php'; ?>
		</div>
	</body>
</html>