## Gulp Commands

## Task or Commands You Can Use

Most gulp tasks have an equivalent `npm run <command>`. See the `scripts` field in `package.json` for details. 

`project-name` should be the same as your json file name without `.json` extension.

`poject-name` default to `myanmar` for testing purposes if you omit it. 

`project-name` should not include the `.json` suffix as it will be appended automatically.

### `gulp html -i <project-name>`

Build the HTML file with the specified `project-name.json` in the `data` directory. Equiavalent to `npm run build-html -- -i <project-name>`. 

CSS and JS will be inlined if `process.env.NODE_ENV === 'production'`.

### `gulp styles`

Build css. Equal to `npm run build-css`.

### `gulp scripts`

Build js. Equal to `npm run build-js`.

### `gulp serve -i <project-name>`

Live preview.

### `gulp clean`

Delete file in `.tmp` directory. Equal to `npm run clean`.

### `gulp build -i <project-name>`

Build css, js and html in `production` mode ready to be deployed.

### `gulp images -i <project-name>`

Compress and copy images to server. This is reserved for legacy as you should avoid commit image files to this repo. Instead compress the images with any tool you like (recommd [imagemin-app](https://github.com/imagemin/imagemin-app)) and upload them.

You can continue to put images in `public/images/<project-name>` which is default for testing purposes, but this folder will not be commited to git repo. For collaboration, share images using online storage or upload the compressed images to server first.

After you uploaded images to server and want to use those online images in testing environemnt, you can set the `MEDIA_PREFIX` envrionment variable on terminal:

```
MEDIA_PREFIX=http://interactive.ftchinese.com
```

Susequent calls to `gulp html` will prepend the value of `MEDIA_PREFIX` to each image's path.

### `gulp deploy -i <project-name>`

Copy built html to server.

## Configuration
In you json file, set any of these fields to `true` in `config` will enable those functions

```json
"config": {
	"highcharts": false,
	"d3": false,
	"customCss": true,
	"customJs": false,
	"enableScroll": true,
	"navOnHeader": true
}
```

To include your custom css/js (if any), set those fields to `true`. Set them to `false` will not include custom css/js files.
```json
"customCss": "false",
"customJs": "false",
```

You custom js/css files should be put in `custom/js` and `custom/css` folders respectively, and named after the json file. For example, if the json file is `china-gdp.json`, custom js/css should be named `china-gdp.js` and `china-gdp.css`.

`navOnHeader` will show the navigation in the center the header. If `false`, a plain title will present.

DO NOT touch any other files!

## Wechat Cover Image

```html
<img src="{{{article.wechatImage}}}" style="display:block; width:0px; height:0px; overflow:hidden">
```

1. Style should be set inline;
2. Do not use display:none;
3. For width:0px; height:0px; to be effective, img should be display:block.

You do not need to worry about this as it already set up in templates.

## Data File

Data saved in `json` format as `data/<project-name>.json`.

## Data Structure

If a certain field do not have value, do not omit it. Specify the value as `null`.

### `header` and `share`
Used to config the header and `ftc-footer`, `ftc-share`'s color.

```json
"header": {
		"theme": "theme-dark" // or `theme-light`
},
"share": {
		"theme": "theme-dark" // or `theme-light`, `theme-default`
}
```

### `title`
This is the title on visible on the page.

```js
"title": {
	"text": "成长的烦恼", // Text of title
	"html": "" // Or you can add html to the title. Not available currently.
}
```

### `edition`
```json
"edition": {
		"text": "English",
		"href": "https://ig.ft.com/special-reports/growing-pains/"
}
```

### `meta`
Values for various `<meta>` in the `<head>` tag

* `meta.title: String`: `<title>meta.title - FT中文网</title>`
* `meta.description: String`: `<meta name="description" content="meta.description">`
* `meta.keywords`: `<meta name="keywords" content="meta.keyword">`
* `meta.wx: String`: `<img src="meta.wx">`
* `meta.og: Object` Open graph protocol tags

```json
{
	"type": "article",
	"site_name": "FT中文网",
	"title": "og:title",
	"description":"og:description",
	"image": "og:image",
	"url": "og:url"
}
```

### `seriesTitle: String`

### `media` in each `segements`

* `media.video.provider: String` `ft` or `cc`.

To be continued...