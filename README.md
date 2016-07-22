## Gulp Commands

### Pass your json file as a command line argument

`gulp serve -i your-data-file-name.json`

or

`gulp serve --input=your-data-file-name.json`

They are identical. It is the same with `gulp build`:

`gulp build -i your-data-file-name.json`

These gulp tasks will combine json data with mustache templates to build a static html file.

To preview this project with default data (in the `model/example.json` file), simple run `gulp serve` or `gulp build`. You do not need to pass any arguments here.

After running `gulp build`, you can run `gulp deploy` to server.

NOTE: `gulp deploy` do not need any arguments.

## Custom CSS/JS
In you json file, set any of these fields to `true` will include those libraries:
```
"highcharts": false,
"d3": false,
```
To include your custom css/js (if any), set those fields to `true`. Set them to `false` will not include custom css/js files.
```
"customCss": "false",
"customJs": "false",
```
You custom js/css files should be put in `custom/js` and `custom/css` folders respectively, and named after the json file. For example, if the json file is `china-gdp.json`, custom js/css should be named `china-gdp.js` and `china-gdp.css`.

DO NOT touch any other files!

## Data

Data saved in `json` format in `model/your-project-name.json` folder.

**DO NOT** touch `model/footer.json`.

To use the 'light' theme, add `theme:true,` as the first entry in you json file.

## Data Structure
### Fields in JSON
- `lightTheme`: <true | false>, // Use the light theme or not.
- `darkTheme`: <true | false>, // Use the dark theme or not. `lightTheme` and `darkTheme` should be mutually exclusive.
- `enableScroll`: <true | false>, // Enable / disable scrolling effect.

- `articleCover` <object>. Its first level has a single entry whose key could be one of `cc`, `ft` or `picture` depending on the type of media.
```
"articleCover": {
	"picture": {
		"source": <Array>, // one or more object
		"src": <String> // image tag's src url.
	}
	// or
	"ft": {
		"poster": <String>, // the value of `poster` attribute for `<video>` tag.
		"source": <Array> // difffernt format for `<video>`'s `<source>`
	}
	// or
	"cc": {
		"src": <string>. // url by cc video.
	}
}
```
`source` entry for `picture`:
```
"source": [
	{
		"landscape": <true | false>, // if `true`, output `media="(min-aspect-ratio: 1/1)"`
		"portrait": <true | false>, // if `true`, output `media="(max-aspect-ratio: 1/1)"`
		"srcset": [
			"images/sapienza_new-lr_cycwhld.jpg 1100w,", // trailing `1100w` indicate above which size the image will be used. Omitted for default.
			"images/sapienza_new-mr_osvv1bn.jpg 1500w,",
			"images/sapienza_new-hr_f0hbatq.jpg"
		]
	}
]
```

Corresponding HTML:
```
<picture>
	<source media="(min-aspect-ratio: 1/1)" srcset="">
	<source media="(max-aspect-ratio: 1/1)" srcset="">
	<img src="">
</picture>
```

`source` entry for `ft`
```
"source": [
	{
		"src": "https://ig.ft.com/sites/land-rush-investment/myanmar/media/myanmar_blinkie_7.mp4.mp4",
		"type": "mp4" // for the `<source>` tag's `type` attribute.
	},
	{
		"src": "https://ig.ft.com/sites/land-rush-investment/myanmar/media/myanmar_blinkie_7.webm",
		"type": "webm"
	}
]
```
Correponding HTML:
```
 <video poster="{{poster}}">
    <source src="https://ig.ft.com/sites/land-rush-investment/myanmar/media/myanmar_blinkie_7.mp4.mp4" type="video/mp4">
    <source src="https://ig.ft.com/sites/land-rush-investment/myanmar/media/myanmar_blinkie_7.webm" type="video/webm">
</video>          
```
`sectionCover`, `fullspanMedia` use the same teamplate as this one.

- `figure` <object>
`<figure>` element in a paragraph.
```
"figure": {
	"mobileOnly": <true | false>, 
	// whether the image is visible only on mobile devices.

	"ratio": "", 
	// image's width/height ratio, e.g, `7/5`. Omit it if you do not have wired dimensions.

	"hasLink": {
		"href": "https://www.ft.com/land"
	}, 
	// whehter the image is clickable or not. Omit it or leave it empty if you do not want to jump away.

	"imgSrc": "./images/new_logo.png",
	
	"caption": <String> 
	// Caption for the image.
}
```


## Polyfills needed

- `object-fit`
- `<picture>`
- `vh`

## NOTES:
Wechat cover image:
```
<img src="{{{article.wechatImage}}}" style="display:block; width:0px; height:0px; overflow:hidden">
```
1. Style should be set inline;
2. Do not use display:none;
3. For width:0px; height:0px; to be effective, img should be display:block.

## CMS
### Enable debug
`DEBUG=app node index.js`

