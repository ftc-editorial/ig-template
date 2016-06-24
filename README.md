## Gulp Commands

### Pass your json file as a command line argument

`gulp serve -i your-data-file-name.json`

or

`gulp serve --input=your-data-file-name.json`

They are identical. It is the same with `gulp build`:

`gulp build -i your-data-file-name.json`

These gulp tasks will combine json data with mustache templates to build a static html file.

To preview this project with default data (in the `model/example.json` file), simple run `gulp serve` or `gulp build`. You do not need to pass any arguments here.

After running `gulp build`, you can run `gulp deploy` to go to server. NO arguments here.

## Data

Data saved in `json` format in `model/your-project-name.json` folder.

**DO NOT** touch `model/footer.json`.

To use the 'light' theme, add `theme:true,` as the first entry in you json file.

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

