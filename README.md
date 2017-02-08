# summernote-image-list

A plugin for [Summernote](https://github.com/summernote/summernote/) WYSIWYG editor.

Add a button that shows a dialog box which displays a list of images.
The list of images is generated using data retrieved from the provided endpoint.
The data must be in `JSON` format.
Selecting an image in the list will insert it into the editor.

## Dependencies
- [Bootstrap](http://getbootstrap.com/): `HTML` markup in the code depends on Bootstrap 3's styling.
- [Font Awesome](http://fontawesome.io/): Use some icons for button and spinner


## Installation

### 1. Include `CSS` & `JS` files

Include the following code after Summernote code:
```html
<link href="summernote-image-list.css">
```

and

```html
<script src="summernote-image-list.js"></script>
```

### 2. Customize Summernote options

Basic customization of the options:

```javascript
$(document).ready(function() {
	var summernoteOptions = {
		toolbar: [
			["style", ["bold", "italic", "underline", "clear"]],
			["fontname", ["fontname"]],
			["fontsize", ["fontsize"]],
			["color", ["color"]],
			["para", ["ul", "ol", "paragraph"]],
			["height", ["height"]],
			["insert", ["link", "picture", "imageList", "video", "hr"]],
			["help", ["help"]]
		],
		dialogsInBody: true,
		imageList: {
			endpoint: "image-list.php",
			fullUrlPrefix: "images/",
			thumbUrlPrefix: "images/thumb/"
		}
	};
});
```

### 3. Prepare the endpoint

Basic example for the endpoint, in `PHP`:

```php
<?php
$files = array_filter(glob('images/*'), 'is_file');

$response = [];

foreach ($files as $file) {
	$response[] = basename($file);
}

header('Content-Type: application/json');
echo json_encode($response);
die();
?>
```

## License

This plugin may be freely distributed and is licensed under the MIT license.