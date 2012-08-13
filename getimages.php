<?php

	function img_resize($src, $dest, $width, $height, $rgb = 0xFFFFFF, $quality = 100) {
		if (!file_exists($src)) {
			return false;
		}

		$size = getimagesize($src);

		if ($size === false) {
			return false;
		}

		$format = strtolower(substr($size['mime'], strpos($size['mime'], '/') + 1));
		$icfunc = 'imagecreatefrom'.$format;

		if (!function_exists($icfunc)) {
			return false;
		}

		$x_ratio = $width  / $size[0];
		$y_ratio = $height / $size[1];

		if ($height == 0) {

			$y_ratio = $x_ratio;
			$height  = $y_ratio * $size[1];

		} elseif ($width == 0) {

			$x_ratio = $y_ratio;
			$width   = $x_ratio * $size[0];

		}

		$ratio       = min($x_ratio, $y_ratio);
		$use_x_ratio = ($x_ratio == $ratio);

		$new_width   = $use_x_ratio  ? $width  : floor($size[0] * $ratio);
		$new_height  = !$use_x_ratio ? $height : floor($size[1] * $ratio);
		$new_left    = $use_x_ratio  ? 0 : floor(($width - $new_width)   / 2);
		$new_top     = !$use_x_ratio ? 0 : floor(($height - $new_height) / 2);

		$isrc  = $icfunc($src);
		$idest = imagecreatetruecolor($width, $height);

		imagefill($idest, 0, 0, $rgb);
		imagecopyresampled($idest, $isrc, $new_left, $new_top, 0, 0, $new_width, $new_height, $size[0], $size[1]);

		imagejpeg($idest, $dest, $quality);

		imagedestroy($isrc);
		imagedestroy($idest);

		return true;
	}

	function createThumbnail($img, $height) {
		$dirName = dirname($img);
		$fileName = basename($img);
		$thumbsDirPath = $dirName.'/'.THUMBS_DIR;
		$thumbPath = $thumbsDirPath.'/'.$fileName;
		if (!file_exists($thumbsDirPath)) mkdir($thumbsDirPath);
		$ans = $thumbPath;
		if (!file_exists($thumbPath)) {
			if (img_resize($img,$thumbPath,0,100)) {
				$ans = $thumbPath;
			} else {
				$ans = DEFAULT_IMAGE;
			}
		}
		return $ans;
	}

	const DEFAULT_IMAGE = 'default.gif';
	const THUMBS_DIR = 'thumbs';

	const THUMB_HEIGHT = 100;

	const EMULATE_SLOW_CONNECTION = false;

	$dir = "img/";   // задаём имя директории
	if (is_dir($dir)) {   // проверяем наличие директории
			$files = scandir($dir);    // сканируем (получаем массив файлов)
			shuffle($files);
			for ($i=0; $i < sizeof($files); $i++) {
				$imgName = $files[$i];
				$imgPath = $dir.$imgName;
				if (is_file($imgPath)) {
					$thumb = createThumbnail($imgPath, THUMB_HEIGHT);
					echo '<a href="'.$imgPath.'" title="'.$imgName.'"><img src="'.$thumb.'" class="thumb" /></a>';
				}
			}
	} else {
		echo 'Error: there is no such directory ('.$dir.').<br>';
	}
?>